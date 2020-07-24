## MapboxGL
###

### methods
#### setAccessToken(accessToken)

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `accessToken` | `String` | `Yes` | required acessToken to pull mapbox tiles, can be `null` if other tiles are used |

##### Description
sets the accessToken, which is required when you want to use mapbox tiles
not required when using other tiles

#### getAccessToken()

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `accessToken` | `String` | `Yes` | required acessToken to pull mapbox tiles, can be `null` if other tiles are used |

##### Description
gets the accessToken


#### addCustomHeader(headerName, headerValue)

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `headerName` | `String` | `Yes` | name for customHeader |
| `headerValue` | `String` | `Yes` | value for customHeader |

##### Description
also see [CustomHttpHeaders](/docs/CustomHttpHeaders.md)


#### removeCustomHeader(headerName)

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `headerName` | `String` | `Yes` | name of customHeader to be removed |

##### Description
also see [CustomHttpHeaders](/docs/CustomHttpHeaders.md)

#### setTelemetryEnabled(telemetryEnabled)

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `telemetryEnabled` | `Boolean` | `Yes` |  |

##### Description
If mapbox' telemetry should be enabled or not

### Android only
#### requestAndroidLocationPermissions()
##### Description
Opens Android Location Permission prompt.
Returns a Promise which resolves into a boolean.
Either permission was granted or denied.


#### setConnected(connected)
##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `connected` | `Boolean` | `Yes` | whether or not mapbox is told to be connected or not |

#### Description
If you want to fully block online map - maybe to force offline maps
