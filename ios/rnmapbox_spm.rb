# CocoaPods helpers for pods that get Mapbox frameworks through Swift Package Manager.
module RNMapboxSPM
  @frameworks_by_pod ||= {}
  @embedded_by_react_native ||= []

  # CocoaPods doesn't embed the dynamic frameworks of a pod's Swift packages, so the app would crash at launch
  # with dyld "Library not loaded: @rpath/<name>.framework". Listing them among the frameworks CocoaPods embeds
  # also makes it create the embed phase in apps without any dynamic pod.
  def self.embed_frameworks(pod_name, framework_names)
    @frameworks_by_pod[pod_name] = framework_names
  end

  # facebook/react-native#58781 makes `spm_dependency` embed package frameworks itself, but only into an existing
  # embed script.
  def self.spm_dependency_options(pod_name, framework_names)
    return {} unless defined?(::SPMManager) &&
                     ::SPMManager.instance_method(:dependency).parameters.include?([:key, :embed_frameworks])
    @embedded_by_react_native << pod_name
    { embed_frameworks: framework_names }
  end

  def self.frameworks_to_embed(aggregate_target, embed_script_exists)
    aggregate_target.pod_targets.flat_map do |pod|
      next [] if embed_script_exists && @embedded_by_react_native.include?(pod.pod_name)
      @frameworks_by_pod.fetch(pod.pod_name, [])
    end.uniq
  end

  # Xcode 26 archives collect xcframework signatures into one folder, and the copies Xcode writes to both the
  # shared products dir and the pod's own build dir fail the archive with "<name>.xcframework-ios.signature
  # already exists". From react-native 0.87 a static pod with Swift packages builds into the shared dir, which
  # then holds the only copy.
  def self.signature_cleanup_script_phase(pod_name)
    {
      :name => "[#{pod_name}] Remove duplicate xcframework signatures",
      :script => '[ "${CONFIGURATION_BUILD_DIR}" = "${PODS_CONFIGURATION_BUILD_DIR}" ] || ' \
                 'rm -f "${CONFIGURATION_BUILD_DIR}"/*.xcframework-*.signature',
      :execution_position => :after_compile,
      :always_out_of_date => '1'
    }
  end

  def self.embeds_frameworks?(pod_name)
    @frameworks_by_pod.key?(pod_name)
  end

  # react-native 0.87+ builds static pods with Swift packages into the shared products dir, but rewrites the
  # aggregate -fmodule-map-file flags assuming the module is named after the pod, which rnmapbox-maps isn't:
  # https://github.com/react/react-native/blob/v0.88.0/packages/react-native/scripts/cocoapods/spm.rb#L79
  module SPMManager
    private

    def rewrite_aggregate_modulemap_references(installer, pod_names)
      super
      moved_pods = installer.pod_targets.select do |pod|
        pod_names.include?(pod.label) && pod.label != pod.product_module_name && RNMapboxSPM.embeds_frameworks?(pod.pod_name)
      end
      return if moved_pods.empty?

      installer.aggregate_targets.each do |aggregate_target|
        aggregate_target.xcconfigs.each do |config_name, config_file|
          changed = false
          %w[OTHER_CFLAGS OTHER_SWIFT_FLAGS].each do |key|
            value = config_file.attributes[key]
            next unless value

            updated_value = moved_pods.reduce(value) do |acc, pod|
              acc.gsub(
                "${PODS_CONFIGURATION_BUILD_DIR}/#{pod.label}/#{pod.product_module_name}.modulemap",
                "${PODS_CONFIGURATION_BUILD_DIR}/#{pod.product_module_name}.modulemap"
              )
            end
            next if updated_value == value
            config_file.attributes[key] = updated_value
            changed = true
          end
          config_file.save_as(aggregate_target.xcconfig_path(config_name)) if changed
        end
      end
    end
  end

  module AggregateTarget
    def framework_paths_by_config
      @rnmapbox_spm_framework_paths_by_config ||= begin
        paths_by_config = super
        embed_script_exists = paths_by_config.values.any?(&:any?) ||
                              xcframeworks_by_config.values.flatten.any? { |xcframework| xcframework.build_type.dynamic_framework? }
        frameworks = RNMapboxSPM.frameworks_to_embed(self, embed_script_exists)
        paths_by_config.transform_values do |paths|
          missing = frameworks.reject do |name|
            paths.any? { |path| path.source_path.end_with?("/#{name}.framework") }
          end
          # Swift package binary targets are copied to the shared products dir whatever the pod's build dir is.
          paths + missing.map { |name| Pod::Xcode::FrameworkPaths.new("${PODS_CONFIGURATION_BUILD_DIR}/#{name}.framework") }
        end
      end
    end
  end
end

Pod::AggregateTarget.prepend(RNMapboxSPM::AggregateTarget) unless Pod::AggregateTarget.ancestors.include?(RNMapboxSPM::AggregateTarget)
if defined?(::SPMManager) && ::SPMManager.private_method_defined?(:rewrite_aggregate_modulemap_references) &&
   !::SPMManager.ancestors.include?(RNMapboxSPM::SPMManager)
  ::SPMManager.prepend(RNMapboxSPM::SPMManager)
end
