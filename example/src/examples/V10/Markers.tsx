import React, { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapboxGL, { MapView, Camera, Logger } from '@rnmapbox/maps';
import { Position } from 'geojson';
import { Button } from '@rneui/base';

import Page from '../common/Page';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';

Logger.setLogLevel('verbose');

type MarkerConfig = {
  coords: Position;
  color: string;
};

const markerCount = 1;
const centerCoord = [-73.99155, 40.72];
const allColors = ['red', 'green', 'blue', 'purple'];

const Markers = memo((props: BaseExampleProps) => {
  const [markers, setMarkers] = useState<MarkerConfig[]>([]);
  const [show, setShow] = useState(true);
  const [anchor, setAnchor] = useState({ x: 0.5, y: 0.5 });

  const changeCoordinatesAndColors = useCallback(() => {
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

  const changeAnchor = useCallback(() => {
    const x = Math.floor((Math.random() * 2 - 1) * 10) / 10;
    const y = Math.floor((Math.random() * 2 - 1) * 10) / 10;
    setAnchor({ x, y });
  }, []);

  useEffect(() => {
    changeCoordinatesAndColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    changeCoordinatesAndColors();
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
            onPress={changeCoordinatesAndColors}
          />
        </View>
        <View style={styles.buttonWrap}>
          <Button
            style={styles.button}
            title={`Change anchor (${anchor.x}, ${anchor.y})`}
            onPress={changeAnchor}
          />
        </View>
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
