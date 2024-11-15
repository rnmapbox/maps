# Customization:
#  $RNMapboxMapsVersion - version specification ("~> 10.4.3", "~> 5.9.0" or "exactVersion 5.12.1" mapblibre/SPM)
#  $RNMapboxMapsSwiftPackageManager can be either
#     "manual" - you're responsible for the Mapbox lib dependency either using cocoapods or SPM
#     Hash - ```
#         {
#           url: "https://github.com/maplibre/maplibre-gl-native-distribution",
#           requirement: {
#             kind: 'exactVersion',
#             version: 5.12.1,
#           },
#           product_name: "Mapbox"
#         }
#         ```
#  $RNMapboxMapsDownloadToken - *expo only* download token
#  $RNMapboxMapsCustomPods - use a custom pod for mapbox libs

require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

## Warning: these lines are scanned by autogenerate.js
rnMapboxMapsDefaultMapboxVersion = '~> 10.19.0'

rnMapboxMapsDefaultImpl = 'mapbox'

new_arch_enabled = ENV['RCT_NEW_ARCH_ENABLED'] == '1'

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
  warn "WARNING: $RNMapboxMapsUseV11 is deprecated just set $RNMapboxMapsVersion to '= 11.8.0"
end

if $MapboxImplVersion =~ /(~>|>=|=|>)?\S*11\./
  $RNMapboxMapsUseV11 = true
end


$RNMapboxMaps = Object.new

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

def $RNMapboxMaps._add_spm_to_target(project, target, url, requirement, product_name)
  pkg_class = Xcodeproj::Project::Object::XCRemoteSwiftPackageReference
  ref_class = Xcodeproj::Project::Object::XCSwiftPackageProductDependency
  pkg = project.root_object.package_references.find { |p| p.class == pkg_class && p.repositoryURL == url }
  if !pkg
    pkg = project.new(pkg_class)
    pkg.repositoryURL = url
    pkg.requirement = requirement
    project.root_object.package_references << pkg
  end
  ref = target.package_product_dependencies.find { |r| r.class == ref_class && r.package == pkg && r.product_name == product_name }
  if !ref
    ref = project.new(ref_class)
    ref.package = pkg
    ref.product_name = product_name
    target.package_product_dependencies << ref
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
  use_v11 = $RNMapboxMapsUseV11 || (map_pod && map_pod.version.split('.')[0].to_i >= 11)
  if use_v11
    installer.pods_project.build_configurations.each do |config|
      config.build_settings['OTHER_SWIFT_FLAGS'] ||= ['$(inherited)', '-D RNMBX_11']
    end
  end

  if $RNMapboxMapsSwiftPackageManager
    return if $RNMapboxMapsSwiftPackageManager == "manual"

    spm_spec = $RNMapboxMapsSwiftPackageManager
    project = installer.pods_project
    self._add_spm_to_target(
      project,
      project.targets.find { |t| t.name == "rnmapbox-maps"},
      spm_spec[:url],
      spm_spec[:requirement],
      spm_spec[:product_name]
    )

    installer.aggregate_targets.group_by(&:user_project).each do |project, targets|
      targets.each do |target|
        target.user_targets.each do |user_target|
          self._add_spm_to_target(
            project,
            user_target,
            spm_spec[:url],
            spm_spec[:requirement],
            spm_spec[:product_name]
          )
        end
      end
    end
  else
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

$rnMapboxMapsTargetsToChangeToDynamic = rnMapboxMapsTargetsToChangeToDynamic

def $RNMapboxMaps.pre_install(installer)
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
  if $RNMapboxMapsUseV11
    s.platform    	= :ios, "12.4"
  else
    s.platform    	= :ios, "11.0"
  end
  s.header_dir = "rnmapbox_maps"

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
      sp.source_files = "ios/RNMBX/**/*.{h,m,mm,swift}"
      sp.private_header_files = 'ios/RNMBX/RNMBXFabricHelpers.h', 'ios/RNMBX/RNMBXFabricPropConvert.h', 'ios/RNMBX/rnmapbox_maps-Swift.pre.h'
      if new_arch_enabled
        sp.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
        install_modules_dependencies(sp)
        dependencies_only_requiring_modular_headers = ["React-Fabric", "React-graphics", "React-utils", "React-debug", "glog"]
        sp.dependencies = sp.dependencies.select { |d| !dependencies_only_requiring_modular_headers.include?(d.name) }.map {|d| [d.name, []]}.to_h
        if $RNMapobxMaps._rn_72_or_earlier()
          $RNMapboxMaps._add_compiler_flags(sp, "-DRNMBX_RN_72=1")
        end
      end
      if ENV['USE_FRAMEWORKS'] || $RNMapboxMapsUseFrameworks
        $RNMapboxMaps._add_compiler_flags(sp, "-DRNMBX_USE_FRAMEWORKS=1")
      end
    else
      fail "$RNMapboxMapsImpl should be mapbox but was: $RNMapboxMapsImpl"
    end
  end

  s.default_subspecs= ['DynamicLibrary']
end
