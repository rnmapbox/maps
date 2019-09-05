## Custom http headers

### Intro

Custom headers are implemented using OkHttp interseptor for android and method swizzling for iOS.

[Method swizzling](https://en.wikipedia.org/wiki/Monkey_patch) is done on the `[NSMutableURLRequest requestWithURL:]` to allow adding headers during runtime.

### Prerequisites

#### Android 

None

#### IOS

To enable this on iOS you need to call `[MGLCustomHeaders initHeaders]` pretty early in the lifecycle of the application. This will swizzle the custom method.
Suggested location is `[AppDelegate application: didFinishLaunchingWithOptions:]`

#### Working example (AppDelegate.m)

```obj-c
@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"SampleApp"
                                            initialProperties:nil];
  // *** Init headers, add swizzle method
  [MGLCustomHeaders initHeaders];
  // *** Optionally you can add some global headers here
  [[MGLCustomHeaders sharedInstance] addHeader:@"IP" forHeaderName:@"X-For-Real"];

  ...
  return YES;
}

...

@end
```


### Sending custom http headers with the tile requests

You can configure sending of custom http headers to your tile server. This is to support custom authentication or custom metadata which can't be included in the url.

You can add and remove headers at runtime.

#### To add a header

```javascript
    MapboxGL.addCustomHeader('Authorization', '{auth header}');
```

#### To remove a header

```javascript
    MapboxGL.removeCustomHeader('Authorization');
```

#### Working example

```javascript
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

