import React from 'react';
import { Button, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Mapbox from '@rnmapbox/maps';

import Bubble from '../common/Bubble';

const styles = StyleSheet.create({
  touchableContainer: { borderColor: 'black', borderWidth: 1.0, width: 60 },
  touchable: {
    backgroundColor: 'blue',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchableText: {
    color: 'white',
    fontWeight: 'bold',
  },
  matchParent: { flex: 1 },
});

const AnnotationContent = ({ title }: { title: string }) => (
  <View style={styles.touchableContainer}>
    <Text>{title}</Text>
    <TouchableOpacity style={styles.touchable}>
      <Text style={styles.touchableText}>Btn</Text>
    </TouchableOpacity>
  </View>
);
const INITIAL_COORDINATES: [number, number][] = [
  [-73.99155, 40.73581],
  [-73.99155, 40.73681],
];

const ShowMarkerView = () => {
  const [pointList, setPointList] =
    React.useState<GeoJSON.Position[]>(INITIAL_COORDINATES);
  const [allowOverlapWithPuck, setAllowOverlapWithPuck] =
    React.useState<boolean>(false);

  const onPressMap = (e: GeoJSON.Feature) => {
    const geometry = e.geometry as GeoJSON.Point;
    setPointList((pl) => [...pl, geometry.coordinates]);
  };

  return (
    <>
      <Button
        title={
          allowOverlapWithPuck
            ? 'allowOverlapWithPuck true'
            : 'allowOverlapWithPuck false'
        }
        onPress={() => setAllowOverlapWithPuck((prev) => !prev)}
      />
      <Mapbox.MapView onPress={onPressMap} style={styles.matchParent}>
        <Mapbox.Camera
          defaultSettings={{
            zoomLevel: 16,
            centerCoordinate: pointList[0],
          }}
        />

        <Mapbox.PointAnnotation coordinate={pointList[1]} id="pt-ann">
          <AnnotationContent title={'this is a point annotation'} />
        </Mapbox.PointAnnotation>

        <Mapbox.MarkerView
          coordinate={pointList[0]}
          allowOverlapWithPuck={allowOverlapWithPuck}
        >
          <AnnotationContent title={'this is a marker view'} />
        </Mapbox.MarkerView>

        {pointList.slice(2).map((coordinate, index) => (
          <Mapbox.PointAnnotation
            coordinate={coordinate}
            id={`pt-ann-${index}`}
            key={`pt-ann-${index}`}
          >
            <AnnotationContent title={'this is a point annotation'} />
          </Mapbox.PointAnnotation>
        ))}

        <Mapbox.NativeUserLocation />
      </Mapbox.MapView>

      <Bubble>
        <Text>Tap on map to add a point annotation</Text>
      </Bubble>
    </>
  );
};

export default ShowMarkerView;

/* end-example-doc */

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'Marker View',
  tags: ['PointAnnotation', 'MarkerView'],
  docs: `
Shows marker view and poitn annotations
`,
};
ShowMarkerView.metadata = metadata;
