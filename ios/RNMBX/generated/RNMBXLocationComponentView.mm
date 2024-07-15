/***
to: ios/rnmbx/generated/RNMBXLocationComponentView.mm
***/
#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXLocationComponentView.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

#import "rnmapbox_maps-Swift.pre.h"

#import "RCTFollyConvert.h"

using namespace facebook::react;


@implementation RNMBXLocationComponentView {
    RNMBXLocation *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXLocationProps>();
    _props = defaultProps;
    _view = [[RNMBXLocation alloc] init];
    [self prepareView];
    
    self.contentView = _view;
  }
  
  return self;
}

- (void)prepareView
{
  __weak __typeof__(self) weakSelf = self;

  /*
  [_view setOnStatusChanged:^(NSDictionary* event) {
    __typeof__(self) strongSelf = weakSelf;
    
    if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
      auto type = std::string([[event objectForKey:@"type"] UTF8String]);
      auto payload = convertIdToFollyDynamic([event objectForKey:@"payload"]);
      RNMBXLocationEventEmitter::OnStatusChanged event = {type, payload};
      strongSelf->_eventEmitter->onStatusChanged(event);
    }
  }];*/
}


#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXLocationComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &oldViewProps = static_cast<const RNMBXLocationProps &>(*oldProps);
  const auto &newViewProps = static_cast<const RNMBXLocationProps &>(*props);

    /*
  if (!oldProps.get() || oldViewProps.transitionsToIdleUponUserInteraction != newViewProps.transitionsToIdleUponUserInteraction) {
    _view.transitionsToIdleUponUserInteraction = convertDynamicToOptional_boolean(newViewProps.transitionsToIdleUponUserInteraction, @"transitionsToIdleUponUserInteraction");
  }
*/
  
    
      if (!oldProps.get() || oldViewProps.hasOnBearingChange != newViewProps.hasOnBearingChange) {
        _view.hasOnBearingChange = newViewProps.hasOnBearingChange;
      }
    
  
    
      if (!oldProps.get() || oldViewProps.hasOnLocationChange != newViewProps.hasOnLocationChange) {
        _view.hasOnLocationChange = newViewProps.hasOnLocationChange;
      }
    
  

  [super updateProps:props oldProps:oldProps];

  
    
    
        if (!oldProps.get() || oldViewProps.hasOnBearingChange != newViewProps.hasOnBearingChange) {
          if (newViewProps.hasOnBearingChange) {
            __weak __typeof__(self) weakSelf = self;
            [_view setOnBearingChange:^(NSDictionary* event) {
              __typeof__(self) strongSelf = weakSelf;
              if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
                

                    auto direction = [[event objectForKey:@"direction"] doubleValue];


                    auto accuracy = [[event objectForKey:@"accuracy"] doubleValue];


                    auto timestamp = [[event objectForKey:@"timestamp"] doubleValue];

                std::dynamic_pointer_cast<const facebook::react::RNMBXLocationEventEmitter>(strongSelf->_eventEmitter)->onBearingChange({direction,accuracy,timestamp});
              }
            }];
          } else {
            [_view setOnBearingChange:nil];
          }
        }
    
  
    
    
        if (!oldProps.get() || oldViewProps.hasOnLocationChange != newViewProps.hasOnLocationChange) {
          if (newViewProps.hasOnLocationChange) {
            __weak __typeof__(self) weakSelf = self;
            [_view setOnLocationChange:^(NSDictionary* event) {
              __typeof__(self) strongSelf = weakSelf;
              if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
                

                    auto altitude = [[event objectForKey:@"altitude"] doubleValue];


                    auto longitude = [[event objectForKey:@"longitude"] doubleValue];


                    auto latitude = [[event objectForKey:@"latitude"] doubleValue];


                    auto timestamp = [[event objectForKey:@"timestamp"] doubleValue];

                std::dynamic_pointer_cast<const facebook::react::RNMBXLocationEventEmitter>(strongSelf->_eventEmitter)->onLocationChange({altitude,longitude,latitude,timestamp});
              }
            }];
          } else {
            [_view setOnLocationChange:nil];
          }
        }
    
  
}
@end

Class<RCTComponentViewProtocol> RNMBXLocationCls(void)
{
  return RNMBXLocationComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
