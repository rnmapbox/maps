import React, { memo, useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import MapboxGL, { MapView, Camera, Logger } from '@rnmapbox/maps';
import { Position } from 'geojson';
import { Text, Button, Divider } from '@rneui/base';

import Page from '../common/Page';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';

Logger.setLogLevel('verbose');

type MarkerConfig = {
  coords: Position;
  color: string;
};

const markerCount = 20;
const centerCoord = [-73.99155, 40.72];
const allColors = ['red', 'green', 'blue', 'purple'];

const Markers = memo((props: BaseExampleProps) => {
  const [markers, setMarkers] = useState<MarkerConfig[]>([]);
  const [show, setShow] = useState(true);
  const [anchor, setAnchor] = useState({ x: 0.5, y: 0.5 });

  const randomizeCoordinatesAndColors = useCallback(() => {
    const newMarkers = new Array(show ? markerCount : 0).fill(0).map((o, i) => {
      return {
        coords: [
          centerCoord[0] + (Math.random() - 0.5) * 0.008,
          centerCoord[1] + (Math.random() - 0.5) * 0.008,
        ],
        color: allColors[i % allColors.length],
      };
    });

    setMarkers(newMarkers);
  }, [show]);

  useEffect(() => {
    randomizeCoordinatesAndColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    randomizeCoordinatesAndColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return (
    <Page {...props}>
      <MapView style={{ flex: 1 }}>
        <Camera
          defaultSettings={{ centerCoordinate: centerCoord, zoomLevel: 14 }}
          centerCoordinate={centerCoord}
          zoomLevel={14}
        />

        {markers.map((marker, i) => {
          return (
            <MapboxGL.MarkerView
              key={`MarkerView-${marker.coords.join('-')}`}
              coordinate={marker.coords}
              anchor={anchor}
            >
              <View
                style={[styles.markerBox, { backgroundColor: marker.color }]}
              >
                <Text style={styles.markerText}>Marker {i + 1}</Text>
              </View>
            </MapboxGL.MarkerView>
          );
        })}
      </MapView>

      <View style={styles.buttonsHolder}>
        <View style={styles.buttonWrap}>
          <Button
            style={styles.button}
            title={'Rearrange'}
            onPress={randomizeCoordinatesAndColors}
          />
        </View>

        <Divider />

        <View style={styles.buttonWrap}>
          <Text>
            Anchor: {anchor.x}, {anchor.y}
          </Text>
          <ScrollView
            style={{ flex: 0, flexDirection: 'row' }}
            horizontal={true}
          >
            {[
              [0, 0],
              [0.5, 0],
              [1, 0],
              [0, 0.5],
              [0.5, 0.5],
              [1, 0.5],
              [0, 1],
              [0.5, 1],
              [1, 1],
            ].map(([x, y]) => {
              return (
                <Button
                  key={`${x}-${y}`}
                  style={[styles.button, { marginRight: 8 }]}
                  title={`${x}, ${y}`}
                  onPress={() => setAnchor({ x, y })}
                />
              );
            })}
          </ScrollView>
        </View>

        <Divider />

        <View style={styles.buttonWrap}>
          <Button
            style={styles.button}
            title={show ? 'Hide markers' : 'Show markers'}
            onPress={() => {
              setShow(!show);
            }}
          />
        </View>
      </View>
    </Page>
  );
});

const styles = StyleSheet.create({
  markerBox: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    borderRadius: 6,
    padding: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  buttonsHolder: {
    flex: 0,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonWrap: {
    flex: 0,
    paddingVertical: 4,
  },
  button: {
    flex: 0,
  },
});

export default Markers;
