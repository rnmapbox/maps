import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {StyleSheet, Text, View} from 'react-native';

import sheet from '../../styles/sheet';
import Page from '../common/Page';

const ANNOTATION_SIZE = 50;

const defaultCamera = {
  centerCoordinate: [-73.98004319979121, 40.75272669831773],
  zoomLevel: 17,
};

const corners = [
  {
    coordinate: [-73.980313714175, 40.75279456928388],
    anchor: {x: 0, y: 1},
  },
  {
    coordinate: [-73.9803415496257, 40.75275624885313],
    anchor: {x: 0, y: 0},
  },
  {
    coordinate: [-73.98048535932631, 40.752816154647235],
    anchor: {x: 1, y: 0},
  },
  {
    coordinate: [-73.98045541426053, 40.75285444197175],
    anchor: {x: 1, y: 1},
  },
];

const sides = [
  {
    coordinate: [-73.97952569308393, 40.75274356459241],
    anchor: {x: 1 / 3, y: 0},
  },
  {
    coordinate: [-73.98082017858928, 40.75329086324669],
    anchor: {x: 1 / 3, y: 1},
  },
  {
    coordinate: [-73.97985980165191, 40.752286242917535],
    anchor: {x: 0, y: 1 / 3},
    containerStyle: {flexDirection: 'row'},
  },
];

const styles = StyleSheet.create({
  small: {
    backgroundColor: 'blue',
    height: ANNOTATION_SIZE,
    justifyContent: 'center',
    width: ANNOTATION_SIZE,
    flex: 1,
  },
  large: {
    borderColor: 'blue',
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    height: ANNOTATION_SIZE * 2,
    justifyContent: 'center',
    width: ANNOTATION_SIZE * 2,
    flex: 1,
  },
  text: {
    position: 'absolute',
    fontSize: 10,
  },
});

const PointAnnotationAnchors = props => {
  return (
    <Page {...props}>
      <MapboxGL.MapView style={sheet.matchParent}>
        <MapboxGL.Camera defaultSettings={defaultCamera} />
        {corners.map((p, i) => (
          <MapboxGL.PointAnnotation
            key={`square-${i}`}
            id={`square-${i}`}
            coordinate={p.coordinate}
            anchor={p.anchor}>
            <View style={styles.small}>
              <Text style={[styles.text, {color: 'white'}]}>
                x={p.anchor.x.toPrecision(2)}, y={p.anchor.y.toPrecision(2)}
              </Text>
            </View>
          </MapboxGL.PointAnnotation>
        ))}
        {sides.map((p, i) => {
          let {x, y} = p.anchor;
          if (x === 1) {
            x = 0;
          }
          if (y === 1) {
            y = 0;
          }
          return (
            <MapboxGL.PointAnnotation
              key={`triangle-${i}`}
              id={`triangle-${i}`}
              coordinate={p.coordinate}
              anchor={p.anchor}>
              <View style={[styles.large, p.containerStyle]}>
                <View
                  style={{
                    height: ANNOTATION_SIZE * 2,
                    width: ANNOTATION_SIZE * 2 * x,
                    backgroundColor: 'green',
                  }}
                />
                <View
                  style={{
                    height: ANNOTATION_SIZE * 2 * y,
                    width: ANNOTATION_SIZE * 2,
                    backgroundColor: 'green',
                  }}
                />
                <Text style={[styles.text, {color: 'black'}]}>
                  x={p.anchor.x.toPrecision(2)}, y={p.anchor.y.toPrecision(2)}
                </Text>
              </View>
            </MapboxGL.PointAnnotation>
          );
        })}
      </MapboxGL.MapView>
    </Page>
  );
};

export default PointAnnotationAnchors;
