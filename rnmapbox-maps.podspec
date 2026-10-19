# Customization:
#  $RNMapboxMapsVersion - version specification ("~> 10.4.3", "~> 5.9.0" or "exactVersion 5.12.1" mapblibre/SPM)
#  $RNMapboxMapsSwiftPackageManager can be either
#     "manual" - you're responsible for the Mapbox lib dependency either using cocoapods or SPM
#     true - get MapboxMaps from https://github.com/mapbox/mapbox-maps-ios.git through Swift Package Manager,
#            with the requirement derived from $RNMapboxMapsVersion
#     Hash - same as true, with any of these keys overridden: ```
#         {
#           url: "https://github.com/mapbox/mapbox-maps-ios.git",
#           requirement: {
#             kind: 'exactVersion',
#             version: '11.23.1',
#           },
#           product_name: "MapboxMaps",
#         }
#         ```
#  $RNMapboxMapsDownloadToken - *deprecated* download token is no longer required
#  $RNMapboxMapsCustomPods - use a custom pod for mapbox libs

require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

## Warning: these lines are scanned by autogenerate.js
rnMapboxMapsDefaultMapboxVersion = package['mapbox']['ios']

rnMapboxMapsDefaultImpl = 'mapbox'

$RNMapboxMaps = Object.new
def $RNMapboxMaps.compute_new_arch_enabled
  if defined?(NewArchitectureHelper) && NewArchitectureHelper.respond_to?(:new_arch_enabled)
    NewArchitectureHelper.new_arch_enabled
  else
    ENV['RCT_NEW_ARCH_ENABLED'] == '1'
  end
end

new_arch_enabled = $RNMapboxMaps.compute_new_arch_enabled

unless new_arch_enabled
  Pod::UI.puts "[RNMapbox] ❌ ERROR: Old React Native Architecture is no longer supported as of @rnmapbox/maps 10.3.0"
  Pod::UI.puts "[RNMapbox] Please enable New Architecture or use @rnmapbox/maps 10.2.x"
  raise "Old React Native Architecture is no longer supported. Enable New Architecture or use @rnmapbox/maps 10.2.x"
end

# DEPRECATIONS

if $RNMBGL_Use_SPM
  abort "Error: $RNMBGL_Use_SPM is deprecated - use $RNMapboxMapsSwiftPackageManager"
end

if $RNMBGL_USE_V10
  abort "Error: $RNMBGL_USE_V10 is deprecated - this is the default now"
end

if $RNMBGL_USE_MAPLIBRE
  abort "Error: $RNMBGL_USE_MAPLIBRE is deprecated no mapblire is supported"
end

if ENV.has_key?("REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION")
  abort "Error: REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION env is deprecated please use `$RNMapboxMapsVersion = \"#{ENV['REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION']}\"`"
end

if $ReactNativeMapboxGLIOSVersion
  abort "Error: $ReactNativeMapboxGLIOSVersion is deprecated use we default to mapbox now"
end

$RNMBGL = Object.new

def $RNMBGL.pre_install(installer)
  abort "WARNING: $RNMBGL.pre_install is removed - use $RNMapboxMaps.pre_install"
end

def $RNMBGL.post_install(installer)
  abort "WARNING: $RNMBGL.post_install is removed - use $RNMapboxMaps.post_install"
end

# --

$RNMapboxMapsImpl ||= 'mapbox'

case $RNMapboxMapsImpl
when 'mapbox'
  rnMapboxMapsTargetsToChangeToDynamic = ['MapboxMobileEvents', 'Turf', 'MapboxMaps', 'MapboxCoreMaps', 'MapboxCommon']
  $MapboxImplVersion = $RNMapboxMapsVersion || rnMapboxMapsDefaultMapboxVersion
when 'mapbox-gl'
  abort 'Errors: mapbox-gl in @rnmapbox/maps is removed. See https://github.com/rnmapbox/maps/wiki/Deprecated-RNMapboxImpl-Maplibre#ios'
when 'maplibre'
  abort 'Error: maplibre in @rnmapbox/maps is removed. See https://github.com/rnmapbox/maps/wiki/Deprecated-RNMapboxImpl-MapboxGL#ios'
else
  fail "$RNMapboxMapsImpl should be one of mapbox"
end

if $RNMapboxMapsUseV11 != nil
  warn "WARNING: $RNMapboxMapsUseV11 is deprecated just set $RNMapboxMapsVersion to '= 11.15.0"
  $RNMapboxMapsUseV11Imp = $RNMapboxMapsUseV11
end

if $MapboxImplVersion =~ /(~>|>=|=|>)?\S*11\./
  $RNMapboxMapsUseV11Imp = true
else
  Pod::UI.puts "[RNMapbox] ❌ ERROR: Mapbox v10 is no longer supported as of @rnmapbox/maps 10.3.0"
  Pod::UI.puts "[RNMapbox] Please upgrade to Mapbox v11.x or use @rnmapbox/maps 10.2.x"
  raise "Mapbox v10 is no longer supported. Upgrade to v11.x or use @rnmapbox/maps 10.2.x"
end

def $RNMapboxMaps._check_no_mapbox_spm(project)
  pkg_class = Xcodeproj::Project::Object::XCRemoteSwiftPackageReference
  ref_class = Xcodeproj::Project::Object::XCSwiftPackageProductDependency
  pkg = project.root_object.package_references.find { |p| p.class == pkg_class && [
    "https://github.com/maplibre/maplibre-gl-native-distribution",
    "https://github.com/mapbox/mapbox-maps-ios.git"
  ].include?(p.repositoryURL) }
  if pkg
    puts "!!! Warning: Duplicate Mapbox dependency found, it's consumed by both SwiftPackageManager and CocoaPods"
  end
end

def $RNMapboxMaps._spm_requirement(version)
  case version.strip
  when /\A~>\s*(\d+\.\d+\.\d+)\z/ then { kind: 'upToNextMinorVersion', minimumVersion: $1 }
  when /\A~>\s*(\d+\.\d+)\z/ then { kind: 'upToNextMajorVersion', minimumVersion: "#{$1}.0" }
  when /\A=?\s*(\d+\.\d+\.\d+)\z/ then { kind: 'exactVersion', version: $1 }
  else
    raise "[RNMapbox] Can't turn $RNMapboxMapsVersion '#{version}' into a Swift package requirement, " \
          "set `requirement:` in $RNMapboxMapsSwiftPackageManager"
  end
end

def $RNMapboxMaps._spm_spec
  return nil if !$RNMapboxMapsSwiftPackageManager || $RNMapboxMapsSwiftPackageManager == "manual"
  options = $RNMapboxMapsSwiftPackageManager == true ? {} : $RNMapboxMapsSwiftPackageManager
  {
    url: 'https://github.com/mapbox/mapbox-maps-ios.git',
    product_name: 'MapboxMaps'
  }.merge(options).tap { |spec| spec[:requirement] ||= self._spm_requirement($MapboxImplVersion) }
end

# @rnmapbox/maps 10.3.8 and earlier also added the package product to the app targets, which now links a second
# copy next to the pod's and embeds its frameworks twice ("Multiple commands produce").
def $RNMapboxMaps._remove_spm_from_app_targets(installer, url)
  installer.aggregate_targets.group_by(&:user_project).each do |project, targets|
    targets.flat_map(&:user_targets).uniq.each do |target|
      stale = target.package_product_dependencies.select { |r| r.package.respond_to?(:repositoryURL) && r.package.repositoryURL == url }
      next if stale.empty?
      Pod::UI.warn "[RNMapbox] Removing #{stale.map(&:product_name).join(', ')} (#{url}) from #{target.name}, it is linked through the pods"
      stale.each do |ref|
        target.frameworks_build_phase.files.select { |f| f.product_ref == ref }.each(&:remove_from_project)
        target.package_product_dependencies.delete(ref)
        ref.remove_from_project
      end
    end
    project.root_object.package_references.select { |p| p.respond_to?(:repositoryURL) && p.repositoryURL == url }.each do |pkg|
      in_use = project.targets.any? { |t| t.package_product_dependencies.any? { |r| r.package == pkg } }
      pkg.remove_from_project unless in_use
    end
  end
end

def $RNMapboxMaps._add_compiler_flags(sp, extra_flags)
  exisiting_flags = sp.attributes_hash["compiler_flags"]
  if exisiting_flags.present?
    sp.compiler_flags = exisiting_flags + " #{extra_flags}"
  else
    sp.compiler_flags = extra_flags
  end
end

def $RNMapobxMaps._rn_72_or_earlier()
  rn_version_full = JSON.parse(File.read("node_modules/react-native/package.json"))['version']
  rn_major_minor = rn_version_full.split('.')[0...2].map(&:to_i)
  return (rn_major_minor <=> [0,72]) <= 0
rescue
  false
end

def $RNMapboxMaps.post_install(installer)
  map_pod = installer.pod_targets.find {|p| p.name == "MapboxMaps" }
  use_v11 = $RNMapboxMapsUseV11Imp || (map_pod && map_pod.version.split('.')[0].to_i >= 11)
  if use_v11
    installer.pods_project.build_configurations.each do |config|
      config.build_settings['OTHER_SWIFT_FLAGS'] ||= ['$(inherited)', '-D RNMBX_11']
    end
  end

  spm_spec = self._spm_spec
  self._remove_spm_from_app_targets(installer, spm_spec[:url]) if spm_spec

  if !$RNMapboxMapsSwiftPackageManager
    self._check_no_mapbox_spm(installer.pods_project)
    installer.aggregate_targets.group_by(&:user_project).each do |project, targets|
      targets.each do |target|
        target.user_targets.each do |user_target|
          self._check_no_mapbox_spm(project)
        end
      end
    end
  end
end

rnMapboxMapsSPMSpec = $RNMapboxMaps._spm_spec

if rnMapboxMapsSPMSpec
  require_relative 'ios/rnmapbox_spm'
end

$rnMapboxMapsTargetsToChangeToDynamic = rnMapboxMapsTargetsToChangeToDynamic

def $RNMapboxMaps._expo_precompiled_pipeline?
  # Expo SDK 56+ precompiled iOS pipeline (prebuilt React core) downgrades every
  # framework-style pod back to a static library after the podspec is evaluated.
  # Flipping the Mapbox pods to dynamic here fights that and leaves an inconsistent
  # graph (MapboxMaps stays dynamic while its deps get forced static). See #4242.
  ENV['EXPO_USE_PRECOMPILED_MODULES'] == '1'
end

def $RNMapboxMaps.pre_install(installer)
  if $RNMapboxMaps._expo_precompiled_pipeline?
    Pod::UI.puts "[RNMapbox] Expo precompiled modules pipeline detected (EXPO_USE_PRECOMPILED_MODULES=1) — skipping the Mapbox dynamic-framework flip so all Mapbox pods stay consistently static."
    return
  end
  installer.aggregate_targets.each do |target|
    target.pod_targets.select { |p| $rnMapboxMapsTargetsToChangeToDynamic.include?(p.name) }.each do |mobile_events_target|
      mobile_events_target.instance_variable_set(:@build_type,Pod::BuildType.dynamic_framework)
      puts "* [RNMapbox] Changed #{mobile_events_target.name} to #{mobile_events_target.send(:build_type)}"
      fail "* [RNMapbox] Unable to change build_type" unless mobile_events_target.send(:build_type) == Pod::BuildType.dynamic_framework
    end
  end
end

## RNMapboxMapsDownloadToken
# expo does not support `.netrc`, so we need to patch curl command used by cocoapods to pass the credentials
# Supports both config variable and environment variable RNMAPBOX_MAPS_DOWNLOAD_TOKEN

if !$RNMapboxMapsDownloadToken && ENV['RNMAPBOX_MAPS_DOWNLOAD_TOKEN']
  $RNMapboxMapsDownloadToken = ENV['RNMAPBOX_MAPS_DOWNLOAD_TOKEN']
end

if $RNMapboxMapsDownloadToken
  module AddCredentialsToCurlWhenDownloadingMapbox
    def curl!(*args)
      mapbox_download = args.flatten.any? { |i| i.to_s.start_with?('https://api.mapbox.com') }
      if mapbox_download
        arguments = args.flatten
        arguments.prepend("-u","mapbox:#{$RNMapboxMapsDownloadToken}")
        super(*arguments)
      else
        super
      end
    end
  end

  class Pod::Downloader::Http
    prepend AddCredentialsToCurlWhenDownloadingMapbox
  end
end

Pod::Spec.new do |s|
  s.name		= "rnmapbox-maps"
  s.summary		= "React Native Component for Mapbox"
  s.version		= package['version']
  s.authors		= { "Miklós Fazekas" => "mfazekas@szemafor.com (https://github.com/mfazekas/)" }
  s.homepage    	= "https://github.com/rnmapbox/maps#readme"
  s.source      	= { :git => "https://github.com/rnmapbox/maps.git" }
  s.license     	= "MIT"
  if $RNMapboxMapsUseV11Imp
    s.platform    	= :ios, "14.0"
  else
    s.platform    	= :ios, "11.0"
  end
  s.header_dir = "rnmapbox_maps"

  if rnMapboxMapsSPMSpec
    spm_frameworks = ['MapboxCommon', 'MapboxCoreMaps', 'Turf']
    spm_dependency(s,
      url: rnMapboxMapsSPMSpec[:url],
      requirement: rnMapboxMapsSPMSpec[:requirement],
      products: [rnMapboxMapsSPMSpec[:product_name]],
      **RNMapboxSPM.spm_dependency_options(s.name, spm_frameworks)
    )
    RNMapboxSPM.embed_frameworks(s.name, spm_frameworks)
    s.script_phase = RNMapboxSPM.signature_cleanup_script_phase(s.name)
  end

  unless $RNMapboxMapsSwiftPackageManager
    if $RNMapboxMapsCustomPods
      $RNMapboxMapsCustomPods.each do |dependecy_spec|
        s.dependency *dependecy_spec
      end
    else
      case $RNMapboxMapsImpl
      when 'mapbox'
        s.dependency 'MapboxMaps', $MapboxImplVersion
        s.dependency 'Turf'
        s.swift_version = '5.0'
      else
        fail "$RNMapboxMapsImpl should be mapbox but was: $RNMapboxMapsImpl"
      end
    end
  end

  s.dependency 'React-Core'
  s.dependency 'React'

  s.subspec 'DynamicLibrary' do |sp|
    case $RNMapboxMapsImpl
    when 'mapbox'
      sp.source_files = "ios/RNMBX/**/*.{h,m,mm,swift}", "cpp/**/*.{h,cpp}"
      sp.private_header_files = 'ios/RNMBX/RNMBXFabricHelpers.h', 'ios/RNMBX/RNMBXFabricPropConvert.h', 'ios/RNMBX/rnmapbox_maps-Swift.pre.h', 'ios/RNMBX/Utils/RNMBXFollyConvert.h', 'cpp/**/*.h'

      if new_arch_enabled
        sp.pod_target_xcconfig = {
          'DEFINES_MODULE' => 'YES',
          'HEADER_SEARCH_PATHS' => '"$(PODS_TARGET_SRCROOT)/cpp"',
        }
        install_modules_dependencies(sp)
        dependencies_only_requiring_modular_headers = ["React-Fabric", "React-graphics", "React-utils", "React-debug", "glog"]
        sp.dependencies = sp.dependencies.select { |d| !dependencies_only_requiring_modular_headers.include?(d.name) }.map {|d| [d.name, []]}.to_h
        if $RNMapobxMaps._rn_72_or_earlier()
          $RNMapboxMaps._add_compiler_flags(sp, "-DRNMBX_RN_72=1")
        end
      end
    else
      fail "$RNMapboxMapsImpl should be mapbox but was: $RNMapboxMapsImpl"
    end
  end

  s.default_subspecs= ['DynamicLibrary']
end
