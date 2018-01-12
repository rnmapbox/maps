## <MapboxGL.StyleSheet />
### StyleSheet is a component that takes in layer styles and formats it into a JSON blob that our Android/iOS SDK's can understand.

### Style functions

#### camera(stops[, interpolationMode])

This is a value function defining a style value that changes as the zoom level changes. The layout and paint attribute properties of the layer can be set to style function objects. Use a camera function to create the illusion of depth and control data density.

```javascript
// color would change based on zoom level keys.
MapboxGL.StyleSheet.camera({
  0: 'blue',
  10: 'green',
  20: 'yellow',
}, MapboxGL.InterpolationMode.Exponential);

// Example of use inside stylesheet
MapboxGL.StyleSheet.create({
  fillColor: MapboxGL.StyleSheet.camera({
    15: 'blue',
    20: 'green',
  }, MapboxGL.InterpolationMode.Interval),
});
```

#### source(stops, attributeName[, interpolationMode])

This is a value function defining a style value that changes with its properties. The layout and paint attribute properties of the layer can be set to style function objects. Use source functions to visually differentate types of features within the same layer or create data visualizations.

```javascript
// would color the layer based the property rating=[1, 5]
MapboxGL.StyleSheet.source([
  [1, 'red'],
  [2, 'organge'],
  [3, 'yellow'],
  [4, 'yellowgreen'],
  [5, 'green'],
], 'rating', MapboxGL.InterpolationMode.Categorical);

// Example of use inside stylesheet
MapboxGL.StyleSheet.create({
  circleColor: MapboxGL.StyleSheet.source([
    [1, 'red'],
    [2, 'organge'],
    [3, 'yellow'],
    [4, 'yellowgreen'],
    [5, 'green'],
  ], 'rating', MapboxGL.InterpolationMode.Categorical),
});
```

#### composite(stops, attributeName[, interpolationMode])

This is a value function defining a style value that changes with the feature attributes at each map zoom level. The layout and paint attribute properties of the layer can be set to style function objects. Use composite functions to allow the appearance of a map feature to change with both its attributes and the map zoom level. Note that support for composite functions is not yet complete in the Android/iOS SDK's.

```javascript
// would change based on the zoom level and rating value
// {zoom_level}: [{value}, {style_value}]
MapboxGL.StyleSheet.composite({
  0: [0, 0],
  0: [5, 5],
  20: [0, 0],
  20: [5, 20],
}, 'rating', MapboxGL.InterpolationMode.Interval);

MapboxGL.StyleSheet.create({
  circleRadius: MapboxGL.StyleSheet.composite({
    0: [0, 0],
    0: [5, 5],
    20: [0, 0],
    20: [5, 20],
  }, 'rating', MapboxGL.InterpolationMode.Interval),
});
```

### Helper functions

#### identity(attributeName)

This is just a source style function under the hood. For example say if you had a feature property with an attribute height. Identity means that it will just equal the attribute value, so there is no need to provide any stops

```javascript
MapboxGL.StyleSheet.create({
  fillExtrusionHeight: MapboxGL.StyleSheet.identity('height'),
});
```

above is shorthand for

```javascript
MapboxGL.StyleSheet.create({
  fillExtrusionHeight: MapboxGL.StyleSheet.source(null, 'height', MapboxGL.InterpolationMode.Exponential),
});
```

### StyleSheet Examples

```javascript
const styles = MapboxGL.StyleSheet.create({
  buildings: {
    fillColor: 'blue',
  },
  street: {
    lineColor: 'green',
  }
});

...

<MapboxGL.FillLayer ... style={styles.buildings} />
<MapboxGL.FillLayer ... style={styles.street} />
```

```javascript
const layerStyles = MapboxGL.StyleSheet.create({
  singlePoint: {
    circleColor: 'green',
    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
    circleRadius: 5,
  },

  clusteredPoints: {
    circleColor: MapboxGL.StyleSheet.source([
      [25, 'yellow'],
      [50, 'red'],
      [75, 'blue'],
      [100, 'orange'],
      [300, 'pink'],
      [750, 'white'],
    ], 'point_count', MapboxGL.InterpolationMode.Exponential),

    circleRadius: MapboxGL.StyleSheet.source([
      [0, 15],
      [100, 20],
      [750, 30],
    ], 'point_count', MapboxGL.InterpolationMode.Exponential),

    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
  },

  clusterCount: {
    textField: '{point_count}',
    textSize: 12,
  },
});

...

<MapboxGL.SymbolLayer
  id='pointCount'
  style={layerStyles.clusterCount} />

<MapboxGL.CircleLayer
  id='clusteredPoints'
  belowLayerID='pointCount'
  filter={['has', 'point_count']}
  style={layerStyles.clusteredPoints} />

<MapboxGL.CircleLayer
  id='singlePoint'
  filter={['!has', 'point_count']}
  style={layerStyles.singlePoint} />
```

```javascript
const layerStyles = MapboxGL.StyleSheet.create({
  building: {
    fillExtrusionOpacity: 1,
    fillExtrusionHeight: MapboxGL.StyleSheet.identity('height'),
    fillExtrusionBase: MapboxGL.StyleSheet.identity('min_height'),
    fillExtrusionColor: MapboxGL.StyleSheet.source([
      [0, 'white'],
      [50, 'blue'],
      [100, 'red'],
    ], 'height', MapboxGL.InterpolationMode.Exponential),
    fillExtrusionColorTransition: { duration: 2000, delay: 0 },
  },
  streets: {
    lineColor: 'blue',
    lineWidth: 2,
    lineOpacity: 0.50,
    lineJoin: MapboxGL.LineJoin.Round,
    lineCap: MapboxGL.LineCap.Round,
    lineDasharray: [2, 2],
  },
});

...

<MapboxGL.FillExtrusionLayer
  id='building3d'
  sourceLayerID='building'
  style={layerStyles.building} />

<MapboxGL.LineLayer
  id='streetLineColor'
  sourceLayerID='road'
  minZoomLevel={14}
  belowLayerID='building3d'
  style={layerStyles.streets} />
```

### Native Module JSON Blob Format

As an end user this is something you won't ever have to deal with. I thought it would be helpful to document some of the json blobs here for contributors. The unit tests also go into more detail. Note that all of the native styling code is autogenrated.

```javascript
// constants
{
  styletype: 'constant',
  payload: {
    value: {CONSTANT_VALUE}
  }
}

// color
{
  styletype: 'color',
  payload: {
    value: {INT_COLOR_VALUE}
  }
}

// image
{
  styletype: 'constant',
  payload: {
    value: '{img_uri}',
    image: true
  }
}

// transition
{
  styletype: 'transition',
  payload: {
    value: { duration: Number, delay: Number }
  }
}

// translate
{
  styletype: 'translation',
  payload: {
    value: [x, y]
  }
}

// style function
{
  styletype: 'function',
  payload: {
    fn: 'camera|source|composite',
    stops: [
      key, // { type: 'string', value: 'propName' }
      stylevalue // { styletype: 'color', payload: { value: COLOR_INT } }
    ],
    attributeName: '{property_name}',
    mode: MapboxGL.{Exponential|Identity|Interval|Categorical}
  }
}
```
