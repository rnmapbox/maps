# Custom http headers

Custom headers are implemented using [HttpServiceFactory](https://docs.mapbox.com/ios/maps/api/10.10.1/common/Classes/MBXHttpServiceFactory.html) on iOS and  android.

On deprecated version (classic Mapbox GL iOS) it's implemented using [Method swizzling](https://en.wikipedia.org/wiki/Monkey_patch) is done on the `[NSMutableURLRequest requestWithURL:]` to allow adding headers during runtime.

## Usage

## Sending custom http headers with the tile requests

You can configure sending of custom http headers to your tile server. This is to support custom authentication or custom metadata which can't be included in the url.

You can add and remove headers at runtime.

### To add a header

```javascript
    MapboxGL.addCustomHeader('Authorization', '{auth header}');
```

### To remove a header

```javascript
    MapboxGL.removeCustomHeader('Authorization');
```

### To add a header based on url

```javascript
    MapboxGL.addCustomHeader('Authorization', '{auth header}', { urlRegexp: '^https:\/\/api\.mapbox\.com\/(.*)$' });
```

### Working example

```tsx
export default class HelloWorldApp extends Component {
  componentDidMount() {
    MapboxGL.addCustomHeader('Authorization', '{auth header}');
  }

  render() {
    MapboxGL.addCustomHeader('X-Some-Header', 'my-value');
    return (
      <View style={styles.page}>
        <View style={styles.container}>
          <MapboxGL.MapView 
            style={styles.map} 
            styleURL={STYLE_URL} />
        </View>
      </View>
    );
  }
}
```



## Prerequisites

### Android

None

### iOS with Mapbox-v10

None

### iOS with Mapbox GL or Mapblibre

To enable this on iOS you need to call `[[MGLCustomHeaders sharedInstance] initHeaders]` pretty early in the lifecycle of the application. This will swizzle the custom method.
Suggested location is `[AppDelegate application: didFinishLaunchingWithOptions:]`

### Working example (AppDelegate.m)

```obj-c
// (1) Include the header file
#import "MGLCustomHeaders.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"SampleApp"
                                            initialProperties:nil];
  // (2) Init headers, add swizzle method
  [[MGLCustomHeaders sharedInstance] initHeaders];
  // (3*) Optionally you can add some global headers here
  [[MGLCustomHeaders sharedInstance] addHeader:@"IP" forHeaderName:@"X-For-Real"];

  ...
  return YES;
}

...

@end
```

