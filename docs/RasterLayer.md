## <MapboxGL.RasterLayer />
### 

### props
| Prop | Type | Default | Required | Description |
| ---- | :--: | :-----: | :------: | :----------: |
| id | `string` | `none` | `false` | A string that uniquely identifies the source in the style to which it is added. |
| sourceID | `string` | `MapboxGL.StyleSource.DefaultSourceID` | `false` | The source from which to obtain the data to style. If the source has not yet been added to the current style, the behavior is undefined. |
| sourceLayerID | `string` | `none` | `false` | Identifier of the layer within the source identified by the sourceID property from which the receiver obtains the data to style. |
| aboveLayerID | `string` | `none` | `false` | Inserts a layer above aboveLayerID. |
| belowLayerID | `string` | `none` | `false` | Inserts a layer below belowLayerID |
| layerIndex | `number` | `none` | `false` | Inserts a layer at a specified index |
| filter | `array` | `none` | `false` | Filter only the features in the source layer that satisfy a condition that you define |
| minZoomLevel | `number` | `none` | `false` | The minimum zoom level at which the layer gets parsed and appears. |
| maxZoomLevel | `number` | `none` | `false` | The maximum zoom level at which the layer gets parsed and appears. |
| style | `union` | `none` | `false` | Customizable style attributes |


### styles
___

#### Name
visibility

#### Description
Whether this layer is displayed.

#### Type
enum

#### Default Value
<span>visible</span>

#### Supported Values
**visible** - The layer is shown.<br />
**none** - The layer is not shown.<br />



___

#### Name
rasterOpacity

#### Description
The opacity at which the image will be drawn.

#### Type
number

#### Default Value
<span>1</span>

#### Minimum
0


#### Maximum
1

#### Supported Style Functions
camera

___

#### Name
rasterHueRotate

#### Description
Rotates hues around the color wheel.

#### Type
number

#### Default Value
<span>0</span>

#### Units
degrees


#### Supported Style Functions
camera

___

#### Name
rasterBrightnessMin

#### Description
Increase or reduce the brightness of the image. The value is the minimum brightness.

#### Type
number

#### Default Value
<span>0</span>

#### Minimum
0


#### Maximum
1

#### Supported Style Functions
camera

___

#### Name
rasterBrightnessMax

#### Description
Increase or reduce the brightness of the image. The value is the maximum brightness.

#### Type
number

#### Default Value
<span>1</span>

#### Minimum
0


#### Maximum
1

#### Supported Style Functions
camera

___

#### Name
rasterSaturation

#### Description
Increase or reduce the saturation of the image.

#### Type
number

#### Default Value
<span>0</span>

#### Minimum
-1


#### Maximum
1

#### Supported Style Functions
camera

___

#### Name
rasterContrast

#### Description
Increase or reduce the contrast of the image.

#### Type
number

#### Default Value
<span>0</span>

#### Minimum
-1


#### Maximum
1

#### Supported Style Functions
camera

___

#### Name
rasterFadeDuration

#### Description
Fade duration when a new tile is added.

#### Type
number

#### Default Value
<span>300</span>

#### Units
milliseconds

#### Minimum
0


#### Supported Style Functions
camera

