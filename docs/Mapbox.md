# Mapbox

## methods
### setAccessToken(accessToken)

#### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `accessToken` | `String` | `Yes` | required acessToken to pull mapbox tiles, can be `null` if other tiles are used |

#### Description
sets the accessToken, which is required when you want to use mapbox tiles
not required when using other tiles

### setWellKnownTileServer(tileServer)



#### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `tileServer` | `String` | `Yes` | tile server |

#### Description
Deprecard will be removed on next version

### getAccessToken()

#### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `accessToken` | `String` | `Yes` | required acessToken to pull mapbox tiles, can be `null` if other tiles are used |

#### Description
gets the accessToken


### addCustomHeader(headerName, headerValue)

#### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `headerName` | `String` | `Yes` | name for customHeader |
| `headerValue` | `String` | `Yes` | value for customHeader |

### addCustomHeaderWithOptions(headerName, headerValue, options)

#### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `headerName` | `String` | `Yes` | name for customHeader |
| `headerValue` | `String` | `Yes` | value for customHeader |
| `options` | `{ urlRegexp }` | `No` | optional configurations for customHeader |

#### Description
`urlRegexp` is a regular expression string (not a `RegExp` object); the header is only sent to request URLs it matches anywhere in, on both iOS and Android. Start it with `^` and end the host with `/` (or `:port`), e.g. `'^https://tiles\\.example\\.com/'`. Unanchored patterns are deprecated (warned since 10.4) and will be rejected in v11.

also see [CustomHttpHeaders](/docs/CustomHttpHeaders.md)


### removeCustomHeader(headerName)

#### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `headerName` | `String` | `Yes` | name of customHeader to be removed |

#### Description
also see [CustomHttpHeaders](/docs/CustomHttpHeaders.md)

### setTelemetryEnabled(telemetryEnabled)

#### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `telemetryEnabled` | `Boolean` | `Yes` |  |

#### Description
If mapbox' telemetry should be enabled or not

### setLanguage(language)

#### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `language` | `String \| String[] \| null` | `Yes` | BCP-47 language tag, or a list of them in order of preference, `null` to reset |

#### Description
Sets the language of map labels for all maps in the app, by setting `MapboxCommonSettings.language` as described in [Mapbox's internationalization guide](https://docs.mapbox.com/help/dive-deeper/maps-internationalization/). Tiles are requested already localized, so this works with every language Mapbox supports and with all styles, including Standard. Returns a promise that rejects if the setting can't be written.

The value is passed to Mapbox unchanged, and like upstream it's stored persistently, so it applies to later app launches too until it's set again or reset with `null`. If Mapbox rejects a tag (e.g. `EN` or `english`), source and tile loading fails, which is reported through `onMapLoadingError`.

For per-map localization use the [`MapView`](/docs/components/MapView) `localizeLabels` prop instead.

```js
await Mapbox.setLanguage('nl');
await Mapbox.setLanguage(['zh-Hant', 'en']);
await Mapbox.setLanguage(null);
```

### normalizeLanguageTag(tag)

#### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `tag` | `String` | `Yes` | BCP-47 language tag, e.g. from the device locale |

#### Description
Optional helper for `setLanguage`: rewrites a tag into the form the Mapbox tile API understands, returning an empty string for a blank tag. It applies RFC 5646 casing (`EN` -> `en`, `sr-latn-rs` -> `sr-Latn-RS`), and maps Chinese to the script Mapbox localizes into (`zh-TW`, `zh-HK`, `zh-MO` -> `zh-Hant`, other `zh` -> `zh-Hans`). Invalid tags stay invalid.

```js
await Mapbox.setLanguage(normalizeLanguageTag('zh-TW')); // zh-Hant
```

## Android only
### requestAndroidLocationPermissions()
#### Description
Opens Android Location Permission prompt.
Returns a Promise which resolves into a boolean.
Either permission was granted or denied.


### setConnected(connected)
#### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `connected` | `Boolean` | `Yes` | whether or not mapbox is told to be connected or not |

### Description
If you want to fully block online map - maybe to force offline maps

### clearData

Clears temporary map data from the data path defined in the given resource options. Useful to reduce the disk usage or in case the disk cache contains invalid data.

### Description
If you want to fully block online map - maybe to force offline maps