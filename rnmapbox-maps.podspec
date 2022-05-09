# Customization:
#  $RNMapboxMapsImpl - one of (maplibre, mapbox, mapbox-gl)
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

require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

## Warning: these lines are scanned by autogenerate.js
rnMapboxMapsDefaultMapboxVersion = '~> 10.5.0'
rnMapboxMapsDefaultMapboxGLVersion = '~> 5.9.0'
rnMapboxMapsDefaultMapLibreVersion = 'exactVersion 5.12.1'

rnMapboxMapsDefaultImpl = 'maplibre'

# DEPRECATIONS

if ENV["REACT_NATIVE_MAPBOX_GL_USE_FRAMEWORKS"]
  puts "REACT_NATIVE_MAPBOX_GL_USE_FRAMEWORKS is now deprecated!"
end

if $RNMBGL_Use_SPM
  puts "WARNING: $RNMBGL_Use_SPM is deprecated - use $RNMapboxMapsSwiftPackageManager"
  if $RNMBGL_Use_SPM.is_a?(Hash)
    $RNMapboxMapsSwiftPackageManager = $RNMBGL_Use_SPM
  else
    $RNMapboxMapsImpl = 'maplibre' unless $RNMapboxMapsImpl
    $RNMapboxMapsSwiftPackageManager = {
      url: "https://github.com/maplibre/maplibre-gl-native-distribution",
      requirement: {
        kind: rnMapboxMapsDefaultMapLibreVersion.split.first,
        version: rnMapboxMapsDefaultMapLibreVersion.split.last,
      },
      product_name: "Mapbox"
    }
  end
end

if $RNMBGL_USE_V10
  puts "WARNING: $RNMBGL_USE_V10 is deprecated - use $RNMapboxMapsImpl = 'mapbox'"
  $RNMapboxMapsImpl = 'mapbox'
end

if $RNMBGL_USE_MAPLIBRE
  puts "WARNING: $RNMBGL_USE_MAPLIBRE is deprecated - use $RNMapboxMapsImpl = 'maplibre'"
  $RNMapboxMapsImpl = 'maplibre'
end

if ENV.has_key?("REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION")
  puts "WARNING: REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION env is deprecated please use `$RNMapboxMapsVersion = \"#{ENV['REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION']}\"`"
  $RNMapboxMapsVersion = ENV["REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION"]
end

if $ReactNativeMapboxGLIOSVersion
  puts "WARNING: $ReactNativeMapboxGLIOSVersion is deprecated use `$RNMapboxMapsVersion = \"#{$ReactNativeMapboxGLIOSVersion}\"`"
  $RNMapboxMapsVersion = $ReactNativeMapboxGLIOSVersion
end

$RNMBGL = Object.new

def $RNMBGL.pre_install(installer)
  puts "WARNING: $RNMBGL.pre_install is deprecated - use $RNMapboxMaps.pre_install"
  $RNMapboxMaps.pre_install(installer)
end

def $RNMBGL.post_install(installer)
  puts "WARNING: $RNMBGL.post_install is deprecated - use $RNMapboxMaps.post_install"
  $RNMapboxMaps.post_install(installer)
end

# --

$RNMapboxMapsImpl = rnMapboxMapsDefaultImpl unless $RNMapboxMapsImpl

case $RNMapboxMapsImpl
when 'mapbox'
  rnMapboxMapsTargetsToChangeToDynamic = ['MapboxMobileEvents', 'Turf', 'MapboxMaps', 'MapboxCoreMaps', 'MapboxCommon']
  MapboxImplVersion = $RNMapboxMapsVersion || rnMapboxMapsDefaultMapboxVersion
when 'mapbox-gl'
  rnMapboxMapsTargetsToChangeToDynamic = ['MapboxMobileEvents']
  MapboxImplVersion = $RNMapboxMapsVersion || rnMapboxMapsDefaultMapboxGLVersion
when 'maplibre'
  rnMapboxMapsTargetsToChangeToDynamic = ['MapboxMobileEvents']

  spm_version = ($RNMapboxMapsVersion || rnMapboxMapsDefaultMapLibreVersion).split
  if spm_version.length < 2
    spm_version.prepend('exactVersion')
  end

  unless $RNMapboxMapsSwiftPackageManager
    $RNMapboxMapsSwiftPackageManager = {
      url: "https://github.com/maplibre/maplibre-gl-native-distribution",
      requirement: {
        kind: spm_version[0],
        version: spm_version[1],
      },
      product_name: "Mapbox"
    }
  end
else
  fail "$RNMapboxMapsImpl should be one of mapbox, mapbox-gl, maplibre"
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

def $RNMapboxMaps.post_install(installer)
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
      puts "* [RNMBGL] Changed #{mobile_events_target.name} to #{mobile_events_target.send(:build_type)}"
      fail "* [RNMBGL] Unable to change build_type" unless mobile_events_target.send(:build_type) == Pod::BuildType.dynamic_framework
    end
  end
end

## RNMapboxMapsDownloadToken
# expo does not supports `.netrc`, so we need to patch curl commend used by cocoapods to pass the credentials

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
  s.platform    	= :ios, "11.0"

  unless $RNMapboxMapsSwiftPackageManager
    case $RNMapboxMapsImpl
    when 'mapbox'
      s.dependency 'MapboxMaps', MapboxImplVersion
      s.dependency 'Turf'
      s.swift_version = '5.0'
    when 'mapbox-gl'
      s.dependency 'Mapbox-iOS-SDK', MapboxImplVersion
    when 'maplibre'
      fail "internal error: maplibre requires $RNMapboxMapsSwiftPackageManager"
    else
      fail "$RNMapboxMapsImpl should be one of mapbox, mapbox-gl, maplibre"
    end
  end

  s.dependency 'React-Core'
  s.dependency 'React'

  s.subspec 'DynamicLibrary' do |sp|
    case $RNMapboxMapsImpl
    when 'mapbox'
      sp.source_files = "ios/RCTMGL-v10/**/*.{h,m,swift}"
      sp.public_header_files = 'ios/RCTMGL-v10/Bridge/*.h'
    when 'mapbox-gl'
      sp.source_files	= "ios/RCTMGL/**/*.{h,m}"
    when 'maplibre'
      sp.source_files	= "ios/RCTMGL/**/*.{h,m}"
      sp.compiler_flags = '-DRNMBGL_USE_MAPLIBRE=1'
    end
  end

  s.default_subspecs= ['DynamicLibrary']
end
