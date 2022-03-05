require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))


default_ios_mapbox_v10_version = '~> 10.3.0'
default_ios_mapbox_gl_version = '~> 5.9.0'

if $RNMBGL_USE_V10
  default_ios_mapbox_version = default_ios_mapbox_v10_version
else
  default_ios_mapbox_version = default_ios_mapbox_gl_version
end


rnmbgl_ios_version = $ReactNativeMapboxGLIOSVersion || ENV["REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION"] || default_ios_mapbox_version
if ENV.has_key?("REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION")
  puts "REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION env is deprecated please use `$ReactNativeMapboxGLIOSVersion = \"#{rnmbgl_ios_version}\"`"
end

if $RNMBGL_USE_V10
  TargetsToChangeToDynamic = ['MapboxMobileEvents', 'Turf', 'MapboxMaps', 'MapboxCoreMaps', 'MapboxCommon']
else
  TargetsToChangeToDynamic = ['MapboxMobileEvents']
end

$RNMBGL = Object.new

def $RNMBGL._add_spm_to_target(project, target, url, requirement, product_name)
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

def $RNMBGL.post_install(installer)
  if $RNMBGL_Use_SPM
    spm_spec = {
      url: "https://github.com/maplibre/maplibre-gl-native-distribution",
      requirement: {
        kind: "exactVersion",
        version: "5.12.1"
      },
      product_name: "Mapbox"
    }

    if $RNMBGL_Use_SPM.is_a?(Hash)
      spm_spec = $RNMBGL_Use_SPM
    end
    project = installer.pods_project
    self._add_spm_to_target(
      project,
      project.targets.find { |t| t.name == "react-native-mapbox"},
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
  end
end

def $RNMBGL.pre_install(installer)
  installer.aggregate_targets.each do |target|
    target.pod_targets.select { |p| TargetsToChangeToDynamic.include?(p.name) }.each do |mobile_events_target|
      mobile_events_target.instance_variable_set(:@build_type,Pod::BuildType.dynamic_framework)
      puts "* [RNMBGL] Changed #{mobile_events_target.name} to #{mobile_events_target.send(:build_type)}"
      fail "* [RNMBGL] Unable to change build_type" unless mobile_events_target.send(:build_type) == Pod::BuildType.dynamic_framework
    end
  end
end

Pod::Spec.new do |s|
  s.name		= "react-native-mapbox"
  s.summary		= "React Native Component for Mapbox"
  s.version		= package['version']
  s.authors		= { "Miklós Fazekas" => "mfazekas@szemafor.com" }
  s.homepage    	= "https://github.com/rnmapbox/maps#readme"
  s.source      	= { :git => "https://github.com/rnmapbox/maps.git" }
  s.license     	= "MIT"
  s.platform    	= :ios, "11.0"

  if !$RNMBGL_Use_SPM
    if $RNMBGL_USE_V10
      s.dependency 'MapboxMaps', rnmbgl_ios_version
      s.dependency 'Turf'
      s.swift_version = '5.0'
    else
      s.dependency 'Mapbox-iOS-SDK', rnmbgl_ios_version
    end
  end
  s.dependency 'React-Core'
  s.dependency 'React'

  s.subspec 'DynamicLibrary' do |sp|
    if $RNMBGL_USE_V10
      sp.source_files = "ios/RCTMGL-v10/**/*.{h,m,swift}"
      sp.public_header_files = 'ios/RCTMGL-v10/Bridge/*.h'
    else
      sp.source_files	= "ios/RCTMGL/**/*.{h,m}"
      if $RNMBGL_USE_MAPLIBRE
        sp.compiler_flags = '-DRNMBGL_USE_MAPLIBRE=1'
      end
    end
  end

  if ENV["REACT_NATIVE_MAPBOX_GL_USE_FRAMEWORKS"]
    s.default_subspecs= ['DynamicLibrary']
  else
    s.subspec 'StaticLibraryFixer' do |sp|
      # s.dependency '@react-native-mapbox-gl-mapbox-static', rnmbgl_ios_version
    end

    s.default_subspecs= ['DynamicLibrary', 'StaticLibraryFixer']
  end
end
