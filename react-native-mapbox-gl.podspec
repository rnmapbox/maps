require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

default_ios_mapbox_version = '~> 5.9.0'
rnmbgl_ios_version = $ReactNativeMapboxGLIOSVersion || ENV["REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION"] || default_ios_mapbox_version
if ENV.has_key?("REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION")
  puts "REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION env is deprecated please use `$ReactNativeMapboxGLIOSVersion = \"#{rnmbgl_ios_version}\"`"
end

TargetsToChangeToDynamic = ['MapboxMobileEvents']

$RNMBGL = Object.new

def $RNMBGL.post_install(installer)
  # Noop
end

def $RNMBGL.pre_install(installer)
  installer.aggregate_targets.each do |target|
    target.pod_targets.select { |p| TargetsToChangeToDynamic.include?(p.name) }.each do |mobile_events_target|
      mobile_events_target.instance_variable_set(:@build_type,Pod::BuildType.dynamic_framework)
      puts "* Changed #{mobile_events_target.name} to #{mobile_events_target.send(:build_type)}"
      fail "Unable to change build_type" unless mobile_events_target.send(:build_type) == Pod::BuildType.dynamic_framework
    end
  end
end

Pod::Spec.new do |s|
  s.name		= "react-native-mapbox-gl"
  s.summary		= "React Native Component for Mapbox GL"
  s.version		= package['version']
  s.authors		= { "Nick Italiano" => "ni6@njit.edu" }
  s.homepage    	= "https://github.com/@react-native-mapbox-gl/maps#readme"
  s.source      	= { :git => "https://github.com/@react-native-mapbox-gl/maps.git" }
  s.license     	= "MIT"
  s.platform    	= :ios, "8.0"

  s.dependency 'Mapbox-iOS-SDK', rnmbgl_ios_version
  s.dependency 'React-Core'
  s.dependency 'React'

  s.subspec 'DynamicLibrary' do |sp|
    sp.source_files	= "ios/RCTMGL/**/*.{h,m}"
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
