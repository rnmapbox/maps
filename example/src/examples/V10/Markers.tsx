import React, { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import MapboxGL, { MapView, Camera, Logger } from '@rnmapbox/maps';
import { Position } from 'geojson';
import { Button } from '@rneui/base';

import Page from '../common/Page';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';

Logger.setLogLevel('verbose');

const centerCoord = [-73.99155, 40.72];

const Markers = memo((props: BaseExampleProps) => {
  const [coords, setCoords] = useState<Position[]>([]);
  const [show, setShow] = useState(false);

  const shuffleMarkers = useCallback(() => {
    const newCoords = new Array(show ? 10 : 0).fill(0).map(() => {
      return [
        centerCoord[0] + (Math.random() - 0.5) * 0.01,
        centerCoord[1] + (Math.random() - 0.5) * 0.01,
      ];
    });

    setCoords(newCoords);
  }, [show]);

  useEffect(() => {
    shuffleMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    shuffleMarkers();
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

        {coords.map((c, i) => {
          return (
            <MapboxGL.MarkerView
              key={`MarkerView-${JSON.stringify(c)}`}
              coordinate={c}
            >
              <View style={styles.markerBox}>
                <Text style={styles.markerText}>MarkerView {i + 1}</Text>
              </View>
            </MapboxGL.MarkerView>
          );
        })}

        <SafeAreaView style={styles.buttonWrap}>
          <Button
            style={styles.button}
            title={'Rearrange'}
            onPress={shuffleMarkers}
          />
          <Button
            style={styles.button}
            title={show ? 'Hide markers' : 'Show markers'}
            onPress={() => {
              setShow(!show);
            }}
          />
        </SafeAreaView>
      </MapView>
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
