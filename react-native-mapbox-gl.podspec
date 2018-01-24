require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name		= "react-native-mapbox-gl"
  s.summary		= "React Native Component for Mapbox GL"
  s.version		= package['version']
  s.authors		= { "Nick Italiano" => "ni6@njit.edu" }
  s.homepage    	= "https://github.com/mapbox/react-native-mapbox-gl#readme"
  s.license     	= "MIT"
  s.platform    	= :ios, "8.0"
  s.source      	= { :git => "https://github.com/mapbox/react-native-mapbox-gl.git" }
  s.source_files	= "ios/RCTMGL/**/*.{h,m}"

  s.vendored_frameworks = 'ios/Mapbox.framework'
  s.dependency 'React'
end
