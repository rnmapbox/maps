# StyleSheet

StyleSheet is written as a JS object.
See [Mapbox expression specs](https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions) for reference on
expressions.

## Style Functions

### Zoom based Expressions

This is a value function defining a style value that changes as the zoom level changes. The layout and paint attribute
properties of the layer can be set to style function objects. Use a camera function to create the illusion of depth and
control data density.

```typescript
// color would change based on zoom level keys.
[
  'interpolate',
  ['exponential', 1.5],
  ['zoom'],
  0, 'blue',
  10, 'green',
  20, 'yellow',
];

// Example of use inside stylesheet
{
  fillColor: ['step', ['zoom'], 'blue', 20, 'green'];
}
```

### Attribute based Expressions

This is a value function defining a style value that changes with its properties. The layout and paint attribute
properties of the layer can be set to style function objects. Use source functions to visually differentiate types of
features within the same layer or create data visualizations.

```typescript
// would color the layer based the property rating=[1, 5]
[
  'step',
  ['get', 'rating'],
  'red',
  2, 'orange',
  3, 'yellow',
  4, 'yellowgreen',
  5, 'green',
];

// Example of use inside stylesheet
{
  circleColor: [
    'step',
    ['get', 'rating'],
    'red',
    2, 'orange',
    3, 'yellow',
    4, 'yellowgreen',
    5, 'green',
  ];
}
```

### Nested Expressions

This is a value function defining a style value that changes with the feature attributes at each map zoom level. The
layout and paint attribute properties of the layer can be set to style function objects. Use composite functions to
allow the appearance of a map feature to change with both its attributes and the map zoom level. Note that support for
composite functions is not yet complete in the Android/iOS SDK's.

```typescript
// would change based on the zoom level and rating value
// {zoom_level}: [{value}, {style_value}]
[
  'step',
  ['zoom'],
  ['step', ['get', 'rating'], 0, 5, 5],
  20,
  ['step', ['get', 'rating'], 0, 5, 20],
];

{
  circleRadius: [
    'step',
    ['zoom'],
    ['step', ['get', 'rating'], 0, 5, 5],
    20,
    ['step', ['get', 'rating'], 0, 5, 20],
  ];
}
```

## StyleSheet Examples

```tsx
const styles = {
  buildings: {
    fillColor: 'blue',
  },
  street: {
    lineColor: 'green',
  }
};

// ...

<MapboxGL.FillLayer
  style={styles.buildings}
  // ...
/>
< MapboxGL.FillLayer
  style={styles.street}
  // ...
/>
```

```tsx
const layerStyles = {
  singlePoint: {
    circleColor: 'green',
    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
    circleRadius: 5,
  },

  clusteredPoints: {
    circleColor: [
      'interpolate',
      ['exponential', 1.5],
      ['get', 'point_count'],
      25, 'yellow',
      50, 'red',
      75, 'blue',
      100, 'orange',
      300, 'pink',
      750, 'white',
    ],

    circleRadius: [
      'interpolate',
      ['exponential', 1.5],
      ['get', 'point_count'],
      [0, 15],
      [100, 20],
      [750, 30],
    ],

    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
  },

  clusterCount: {
    textField: ['get', 'point_count'],
    textSize: 12,
  },
};

// ...

<MapboxGL.SymbolLayer
  id='pointCount'
  style={layerStyles.clusterCount}
/>

< MapboxGL.CircleLayer
  id='clusteredPoints'
  belowLayerID='pointCount'
  filter={['has', 'point_count'
  ]
  }
  style={layerStyles.clusteredPoints}
/>

< MapboxGL.CircleLayer
  id='singlePoint'
  filter={['!has', 'point_count'
  ]
  }
  style={layerStyles.singlePoint}
/>
```

```tsx
const layerStyles = {
  building: {
    fillExtrusionOpacity: 1,
    fillExtrusionHeight: ['get', 'height'],
    fillExtrusionBase: ['get', 'min_height'],
    fillExtrusionColor: [
      'interpolate',
      ['exponential', 1.5],
      ['get', 'height'],
      [0, 'white'],
      [50, 'blue'],
      [100, 'red'],
    ],
    fillExtrusionColorTransition: {duration: 2000, delay: 0},
  },
  streets: {
    lineColor: 'blue',
    lineWidth: 2,
    lineOpacity: 0.50,
    lineJoin: MapboxGL.LineJoin.Round,
    lineCap: MapboxGL.LineCap.Round,
    lineDasharray: [2, 2]
  }
};

// ...

<MapboxGL.FillExtrusionLayer
  id='building3d'
  sourceLayerID='building'
  style={layerStyles.building}
/>

< MapboxGL.LineLayer
  id='streetLineColor'
  sourceLayerID='road'
  minZoomLevel={14}
  belowLayerID='building3d'
  style={layerStyles.streets}
/>
```
