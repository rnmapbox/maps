# Logger

## methods
### setLogLevel(LogLevel)

#### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `LogLevel` | `String` | `Yes` | required level of logging, can be `"error" | "warning" | "info" | "debug" | "verbose"` |

#### Description
sets the amount of logging

### setLogCallback(LogCallback)

#### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `LogCallback` | `function` | `Yes` | callback taking a log object `{ message: String, level: LogLevel, tag: String }` as param. If callback return falsy value then default logging will take place.  |

#### Description
overwrite logging - good to mute specific errors/ warnings