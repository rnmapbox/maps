// This guard prevent the code from being compiled in the old architecture
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNMBXMapView.h"

#import <react/renderer/components/@rnmapbox-maps/ComponentDescriptors.h>
#import <react/renderer/components/@rnmapbox-maps/EventEmitters.h>
#import <react/renderer/components/@rnmapbox-maps/Props.h>
#import <react/renderer/components/@rnmapbox-maps/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

#import "RNMBXMapViewImpl.h"

using namespace facebook::react;

@interface RNMBXMapView () <RCTRNMBXMapViewViewProtocol>

@property (nonatomic, strong, nullable) UIView<RNMBXMapViewImplProtocol> *contentView;


@end

@implementation RNMBXMapView {
    UIView<RNMBXMapViewImplProtocol> * _view;
}

@dynamic contentView;

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXMapViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
if (self = [super initWithFrame:frame]) {
  static const auto defaultProps = std::make_shared<const RNMBXMapViewProps>();
    _props = defaultProps;

    _view = [RNMBXMapViewImplFactory createWithFrame: frame];

    self.contentView = _view;
}

return self;
}

- (void)sayHello:(NSString *)message {
  [self.contentView sayHello: message];
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<RNMBXMapViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<RNMBXMapViewProps const>(props);

  //
  //  if (oldViewProps.color != newViewProps.color) {
  //      NSString * colorToConvert = [[NSString alloc] initWithUTF8String: newViewProps.color.c_str()];
  //      [_view setBackgroundColor:[self hexStringToColor:colorToConvert]];
  //  }
  //

    [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> RNMBXMapViewCls(void)
{
return RNMBXMapView.class;
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
  RCTRNMBXMapViewHandleCommand(self, commandName, args);
}

- hexStringToColor:(NSString *)stringToConvert
{
NSString *noHashString = [stringToConvert stringByReplacingOccurrencesOfString:@"#" withString:@""];
NSScanner *stringScanner = [NSScanner scannerWithString:noHashString];

unsigned hex;
if (![stringScanner scanHexInt:&hex]) return nil;
int r = (hex >> 16) & 0xFF;
int g = (hex >> 8) & 0xFF;
int b = (hex) & 0xFF;

return [UIColor colorWithRed:r / 255.0f green:g / 255.0f blue:b / 255.0f alpha:1.0f];
}

@end
#endif
