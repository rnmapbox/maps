#import <React/RCTViewManager.h>


// TODO: remove as we don't need this, we can use existing RCTMGLMapViewManager instead for non fabric

@interface RNMBXMapViewManager : RCTViewManager

@end


// RCT_EXPORT_MODULE()

@implementation RNMBXMapViewManager

RCT_EXPORT_MODULE(RNMBXMapView)


- (UIView *)view
{
  
//  UIScreen.main.bounds
  return [[UIView alloc] initWithFrame: [[UIScreen mainScreen] bounds] ];
}

RCT_CUSTOM_VIEW_PROPERTY(color, NSString, UIView)
{
[view setBackgroundColor:[self hexStringToColor:json]];
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
