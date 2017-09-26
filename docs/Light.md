## <MapboxGL.Light />
### Light represents the light source for extruded geometries

### props
| Prop | Type | Default | Required | Description |
| ---- | :--: | :-----: | :------: | :----------: |
| style | `custom` | `none` | `false` | Customizable style attributes |


### styles
| Name | Type | Requires | Disabled By |  Description |
| ---- | :--: | :------: | :---------: | :----------: |
| `anchor` | `enum` | `none` | `none` | Whether extruded geometries are lit relative to the map or viewport. |
| `position` | `array` | `none` | `none` | Position of the light source relative to lit (extruded) geometries, in [r radial coordinate, a azimuthal angle, p polar angle] where r indicates the distance from the center of the base of an object to its light, a indicates the position of the light relative to 0° (0° when `light.anchor` is set to `viewport` corresponds to the top of the viewport, or 0° when `light.anchor` is set to `map` corresponds to due north, and degrees proceed clockwise), and p indicates the height of the light (from 0°, directly above, to 180°, directly below). |
| `color` | `color` | `none` | `none` | Color tint for lighting extruded geometries. |
| `intensity` | `number` | `none` | `none` | Intensity of lighting (on a scale from 0 to 1). Higher numbers will present as more extreme contrast. |
