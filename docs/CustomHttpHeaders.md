# Custom http headers

Custom headers are implemented using [HttpServiceFactory](https://docs.mapbox.com/ios/maps/api/10.10.1/common/Classes/MBXHttpServiceFactory.html) on iOS and  android.

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
    MapboxGL.addCustomHeader('Authorization', '{auth header}', { urlRegexp: '^https://tiles\\.example\\.com/' });
```

`urlRegexp` is a regular expression string (not a `RegExp` object). The header is sent when the pattern matches anywhere in the request URL, the same on iOS and Android, so:

- start the pattern with `^`, so it has to match from the start of the URL;
- end the host with `/` (or `:port`), otherwise `'^https://tiles\\.example\\.com'` also matches `https://tiles.example.com.evil.com/`.

> **Deprecated:** unanchored patterns (not starting with `^`, or starting with a wildcard like `^.*`) log a deprecation warning since 10.4 and will be rejected in v11. They can send the header to look-alike hosts such as `tiles.example.com.evil.com` or `evil.com/?u=tiles.example.com`, which matters when styles, sources or tiles come from third parties.

### Working example

```tsx
export default class HelloWorldApp extends Component {
  componentDidMount() {
    MapboxGL.addCustomHeader('Authorization', '{auth header}', {
      urlRegexp: '^https://tiles\\.example\\.com/',
    });
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
