import { Button, Divider, Text } from '@rneui/base';
import { Camera, Logger, MapView, MarkerView } from '@rnmapbox/maps';
import { Position } from 'geojson';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc

Logger.setLogLevel('verbose');

type MarkerConfig = {
  coords: Position;
  color: string;
};

const markerCount = 20;
const centerCoord = [-73.99155, 40.72];
const allColors = ['red', 'green', 'blue', 'purple'];

const Markers = () => {
  const [markers, setMarkers] = useState<MarkerConfig[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const [anchor, setAnchor] = useState({ x: 0.5, y: 0.5 });
  const [allowOverlap, setAllowOverlap] = useState(true);

  const [show, setShow] = useState(true);
  const [size, setSize] = useState(1);

  const randomizeCoordinatesAndColors = useCallback(() => {
    const newMarkers = new Array(markerCount).fill(0).map((o, i) => {
      return {
        coords: [
          centerCoord[0] + (Math.random() - 0.5) * 0.008,
          centerCoord[1] + (Math.random() - 0.5) * 0.008,
        ],
        color: allColors[i % allColors.length],
      };
    });

    setMarkers(newMarkers);
  }, []);

  useEffect(() => {
    randomizeCoordinatesAndColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
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
              isSelected={i === selectedIndex}
              style={{ display: show ? 'flex' : 'none' }}
            >
              <Pressable
                style={[
                  styles.markerBox,
                  { backgroundColor: marker.color, padding: 4 * size },
                ]}
                onPress={() =>
                  setSelectedIndex((index) => (index === i ? -1 : i))
                }
              >
                <Text style={styles.markerText}>Marker {i + 1}</Text>
              </Pressable>
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

        <View>
          {[
            [
              [0, 0],
              [0.5, 0],
              [1, 0],
            ],
            [
              [0, 0.5],
              [0.5, 0.5],
              [1, 0.5],
            ],
            [
              [0, 1],
              [0.5, 1],
              [1, 1],
            ],
          ].map((anchors, index) => {
            return (
              <View
                key={index}
                style={{
                  flex: 0,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                {anchors.map(([x, y]) => {
                  const isSelected = anchor.x === x && anchor.y === y;
                  return (
                    <View key={`${x}-${y}`}>
                      <Button
                        type={isSelected ? 'solid' : 'outline'}
                        style={styles.button}
                        title={`${x}, ${y}`}
                        onPress={() => setAnchor({ x, y })}
                      />
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>

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

        <Divider style={styles.divider} />

        <View
          style={{
            flex: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Button
            style={styles.button}
            title={'Decrease size'}
            onPress={() => {
              setSize((s) => s - 1);
            }}
          />
          <Button
            style={styles.button}
            title={'Increase size'}
            onPress={() => {
              setSize((s) => s + 1);
            }}
          />
        </View>
      </View>
    </>
  );
};

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
    alignSelf: 'stretch',
  },
  divider: {
    marginVertical: 10,
  },
});

export default Markers;

/* end-example-doc */

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Markers',
  tags: ['MarkerView'],
  docs: `
Test view for MarkerViews
`,
};
Markers.metadata = metadata;
