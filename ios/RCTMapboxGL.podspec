Pod::Spec.new do |s|
  s.name                = "RCTMapboxGL"
  s.version             = "2.1.3"
  s.summary             = "A Mapbox GL react native module for creating custom maps."
  s.homepage            = "https://github.com/mapbox/react-native-mapbox-gl#readme"
  s.license             = "BSD"
  s.author              = "Bobby Sudekum"
  s.screenshot          = "https://cldup.com/A8S_7rLg1L.png"
  s.social_media_url    = "https://twitter.com/mapbox"
  s.documentation_url   = "https://github.com/mapbox/react-native-mapbox-gl/blob/master/ios/API.md"

  s.source              = { :git => "https://github.com/mapbox/react-native-mapbox-gl.git", :tag => "#{s.version}" }
  s.platform            = :ios, "7.0"

  s.source_files        = "RCTMapboxGL/RCTMapboxGL.{h,m}", "RCTMapboxGL/RCTMapboxGLManager.{h,m}"
  s.resources           = "RCTMapboxGL/Settings.bundle"
  s.dependency            "Mapbox-iOS-SDK", "3.0.0"

  # These resources, library, frameworks and libraries spec is already part of
  # the Mapbox-iOS-SDK dependency above. The npm `preinstall` hock download
  # them automatically. Instead of the dependency we could also use the
  # following attributes to use the local files...
  # I keep this it it makes development easier of fix somes "troubles" later.

#  s.source_files        = "RCTMapboxGL/*.{h,m}"
#  s.resources           = "RCTMapboxGL/Mapbox.bundle", "RCTMapboxGL/Settings.bundle"
#  s.vendored_libraries  = "RCTMapboxGL/libMapbox.a"
#  s.framework           = "CoreTelephony", "GLKit", "ImageIO", "MobileCoreServices", "QuartzCore", "SystemConfiguration"
#  s.libraries           = "c++", "sqlite3", "z"

end
