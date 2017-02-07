Pod::Spec.new do |s|
  s.name                = "RCTMapboxGL"
  s.version             = "5.1.0"
  s.summary             = "A Mapbox GL react native module for creating custom maps."
  s.homepage            = "https://github.com/mapbox/react-native-mapbox-gl#readme"
  s.license             = "BSD"
  s.author              = "Bobby Sudekum"
  s.screenshot          = "https://cldup.com/A8S_7rLg1L.png"
  s.social_media_url    = "https://twitter.com/mapbox"
  s.documentation_url   = "https://github.com/mapbox/react-native-mapbox-gl/blob/master/API.md"

  s.source              = { :git => "https://github.com/mapbox/react-native-mapbox-gl.git", :tag => "#{s.version}" }
  s.platform            = :ios, "8.0"

  s.vendored_frameworks = 'Mapbox.framework'
  s.module_name = 'Mapbox'
  s.source_files = "RCTMapboxGL/*.{h,m}"

end
