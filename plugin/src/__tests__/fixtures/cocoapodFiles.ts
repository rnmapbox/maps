export const reactNativeTemplatePodfile = `
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '11.0'

target 'HelloWorld' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    # to enable hermes on iOS, change \`false\` to \`true\` and then install pods
    :hermes_enabled => false
  )

  target 'HelloWorldTests' do
    inherit! :complete
    # Pods for testing
  end

  # Enables Flipper.
  #
  # Note that if you have use_frameworks! enabled, Flipper will not work and
  # you should disable the next line.
  use_flipper!()

  post_install do |installer|
    react_native_post_install(installer)
  end
end
`;

export const expoTemplatePodfile = `
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/react-native-unimodules/cocoapods.rb'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '11.0'

target 'HelloWorld' do
  use_unimodules!
  config = use_native_modules!

  use_react_native!(:path => config["reactNativePath"])

  # Uncomment to opt-in to using Flipper
  #
  # if !ENV['CI']
  #   use_flipper!('Flipper' => '0.75.1', 'Flipper-Folly' => '2.5.3', 'Flipper-RSocket' => '1.3.1')
  #   post_install do |installer|
  #     flipper_post_install(installer)
  #   end
  # end
end
`;

export const customExpoTemplatePodfile = `
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/react-native-unimodules/cocoapods.rb'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '11.0'

target 'HelloWorld' do
  use_unimodules!
  config = use_native_modules!

  use_react_native!(:path => config["reactNativePath"])

  # pre_install do |installer|
  # end

  # Uncomment to opt-in to using Flipper
  #
  # if !ENV['CI']
  #   use_flipper!('Flipper' => '0.75.1', 'Flipper-Folly' => '2.5.3', 'Flipper-RSocket' => '1.3.1')
  #   post_install do |installer|
  #     flipper_post_install(installer)
  #   end
  # end
end
`;

// This tests that if an invalid revision is pushed, the plugin can correct it based on the ID.
export const expoTemplateWithRevisions = `
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/react-native-unimodules/cocoapods.rb'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '11.0'

target 'HelloWorld' do
  use_unimodules!
  config = use_native_modules!

# @generated begin pre_installer - expo prebuild (DO NOT MODIFY) sync-00old-id
INVALID_pre_install do |installer|
# @generated begin @rnmapbox/maps-pre_installer - expo prebuild (DO NOT MODIFY) sync-00
  INVALID_$RNMBGL.pre_install(installer)
# @generated end @rnmapbox/maps-pre_installer
end
# @generated end pre_installer
# @generated begin post_installer - expo prebuild (DO NOT MODIFY) sync-00old-id-2
INVALID_post_install do |installer|
# @generated begin @rnmapbox/maps-post_installer - expo prebuild (DO NOT MODIFY) sync-001
  INVALID_$RNMBGL.post_install(installer)
# @generated end @rnmapbox/maps-post_installer
end
# @generated end post_installer
  use_react_native!(:path => config["reactNativePath"])

  # pre_install do |installer|
  # end

  # Uncomment to opt-in to using Flipper
  #
  # if !ENV['CI']
  #   use_flipper!('Flipper' => '0.75.1', 'Flipper-Folly' => '2.5.3', 'Flipper-RSocket' => '1.3.1')
  #   post_install do |installer|
  #     flipper_post_install(installer)
  #   end
  # end
end
`;

export const expoTemplateWithRevisionsAfterComments = `
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/react-native-unimodules/cocoapods.rb'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '11.0'

target 'HelloWorld' do
  use_unimodules!
  config = use_native_modules!
  # pre_install do |installer|
  # end

  # Uncomment to opt-in to using Flipper
  #
  # if !ENV['CI']
  #   use_flipper!('Flipper' => '0.75.1', 'Flipper-Folly' => '2.5.3', 'Flipper-RSocket' => '1.3.1')
  #   post_install do |installer|
  #     flipper_post_install(installer)
  #   end
  # end

# @generated begin pre_installer - expo prebuild (DO NOT MODIFY) sync-00old-id
INVALID_pre_install do |installer|
# @generated begin @rnmapbox/maps-pre_installer - expo prebuild (DO NOT MODIFY) sync-00
  INVALID_$RNMBGL.pre_install(installer)
# @generated end @rnmapbox/maps-pre_installer
end
# @generated end pre_installer
# @generated begin post_installer - expo prebuild (DO NOT MODIFY) sync-00old-id-2
INVALID_post_install do |installer|
# @generated begin @rnmapbox/maps-post_installer - expo prebuild (DO NOT MODIFY) sync-001
  INVALID_$RNMBGL.post_install(installer)
# @generated end @rnmapbox/maps-post_installer
end
# @generated end post_installer
  use_react_native!(:path => config["reactNativePath"])


end
`;

export const blankTemplatePodfile = `
platform :ios, '11.0'

target 'HelloWorld' do
end
`;
