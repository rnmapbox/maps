import React, { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
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

const markerCount = 20;
const centerCoord = [-73.99155, 40.72];
const allColors = ['red', 'green', 'blue', 'purple'];

const Markers = memo((props: BaseExampleProps) => {
  const [markers, setMarkers] = useState<MarkerConfig[]>([]);
  const [show, setShow] = useState(false);

  const randomize = useCallback(() => {
    const newMarkers = new Array(show ? markerCount : 0).fill(0).map((o, i) => {
      return {
        coords: [
          centerCoord[0] + (Math.random() - 0.5) * 0.01,
          centerCoord[1] + (Math.random() - 0.5) * 0.01,
        ],
        color: allColors[i % allColors.length],
      };
    });

    setMarkers(newMarkers);
  }, [show]);

  useEffect(() => {
    randomize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    randomize();
    randomize();
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
              key={`MarkerView-${JSON.stringify(marker)}`}
              coordinate={marker.coords}
            >
              <View
                style={[styles.markerBox, { backgroundColor: marker.color }]}
              >
                <Text style={styles.markerText}>MarkerView {i + 1}</Text>
              </View>
            </MapboxGL.MarkerView>
          );
        })}
      </MapView>

      <SafeAreaView style={styles.buttonWrap} pointerEvents={'box-none'}>
        <Button style={styles.button} title={'Rearrange'} onPress={randomize} />
        <Button
          style={styles.button}
          title={show ? 'Hide markers' : 'Show markers'}
          onPress={() => {
            setShow(!show);
          }}
        />
      </SafeAreaView>
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
    padding: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  buttonWrap: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    alignContent: 'center',
  },
  button: {
    flex: 0,
    marginTop: 12,
    marginHorizontal: 12,
  },
});

export default Markers;
