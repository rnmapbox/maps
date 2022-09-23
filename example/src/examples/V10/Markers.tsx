import React, { memo, useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MapView, Camera, Logger, MarkerView } from '@rnmapbox/maps';
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
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const [show, setShow] = useState(true);
  const [anchor, setAnchor] = useState({ x: 0.5, y: 0.5 });
  const [allowOverlap, setAllowOverlap] = useState(true);

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
            <MarkerView
              key={`MarkerView-${marker.coords.join('-')}`}
              coordinate={marker.coords}
              anchor={anchor}
              allowOverlap={allowOverlap}
              onPress={() => setSelectedIndex(i)}
            >
              <View
                style={[
                  styles.markerBox,
                  { backgroundColor: marker.color },
                  // i === selectedIndex && styles.markerBoxSelected,
                ]}
              >
                <Text style={styles.markerText}>Marker {i + 1}</Text>
              </View>
            </MarkerView>
          );
        })}
      </MapView>

      <View style={styles.buttonsHolder}>
        <Button
          style={styles.button}
          title={'Rearrange'}
          onPress={randomizeCoordinatesAndColors}
        />

        <Divider style={styles.divider} />

        <ScrollView
          style={{ flex: 0, flexDirection: 'row', overflow: 'visible' }}
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

        <Divider style={styles.divider} />

        <Button
          style={styles.button}
          title={show ? 'Hide markers' : 'Show markers'}
          onPress={() => {
            setShow(!show);
          }}
        />

        <Divider style={styles.divider} />

        <Button
          style={styles.button}
          title={allowOverlap ? 'Disallow overlap' : 'Allow overlap'}
          onPress={() => {
            setAllowOverlap(!allowOverlap);
          }}
        />
      </View>
    </Page>
  );
});

const styles = StyleSheet.create({
  markerBox: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    padding: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerBoxSelected: {
    padding: 12,
  },
  markerText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  buttonsHolder: {
    flex: 0,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  button: {
    flex: 0,
  },
  divider: {
    marginVertical: 10,
  },
});

export default Markers;
