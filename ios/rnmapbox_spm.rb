# CocoaPods helpers for pods that get Mapbox frameworks through Swift Package Manager.
module RNMapboxSPM
  @frameworks_by_pod ||= {}

  # CocoaPods doesn't embed the dynamic frameworks of a pod's Swift packages, so the app would crash at launch
  # with dyld "Library not loaded: @rpath/<name>.framework". Listing them among the frameworks CocoaPods embeds
  # also makes it create the embed phase in apps without any dynamic pod.
  def self.embed_frameworks(pod_name, framework_names)
    @frameworks_by_pod[pod_name] = framework_names
  end

  def self.frameworks_to_embed(aggregate_target)
    aggregate_target.pod_targets.flat_map { |pod| @frameworks_by_pod.fetch(pod.pod_name, []) }.uniq
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

  module AggregateTarget
    def framework_paths_by_config
      @rnmapbox_spm_framework_paths_by_config ||= super.transform_values do |paths|
        missing = RNMapboxSPM.frameworks_to_embed(self).reject do |name|
          paths.any? { |path| path.source_path.end_with?("/#{name}.framework") }
        end
        # Swift package binary targets are copied to the shared products dir whatever the pod's build dir is.
        paths + missing.map { |name| Pod::Xcode::FrameworkPaths.new("${PODS_CONFIGURATION_BUILD_DIR}/#{name}.framework") }
      end
    end
  end
end

Pod::AggregateTarget.prepend(RNMapboxSPM::AggregateTarget) unless Pod::AggregateTarget.ancestors.include?(RNMapboxSPM::AggregateTarget)
