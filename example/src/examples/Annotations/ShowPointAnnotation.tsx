import React, { FC, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Callout, Camera, MapView, PointAnnotation } from '@rnmapbox/maps';
import { Feature, Point, Position } from 'geojson';

import sheet from '../../styles/sheet';
import Page from '../common/Page';
import Bubble from '../common/Bubble';

const ANNOTATION_SIZE = 40;

const styles = StyleSheet.create({
  annotationContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: ANNOTATION_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    height: ANNOTATION_SIZE,
    justifyContent: 'center',
    overflow: 'hidden',
    width: ANNOTATION_SIZE,
  },
});

type AnnotationWithRemoteImageProps = {
  id: string;
  title: string;
  coordinate: Position;
};

const AnnotationWithRemoteImage = ({
  id,
  coordinate,
  title,
}: AnnotationWithRemoteImageProps) => {
  const pointAnnotation = useRef<PointAnnotation>(null);

  return (
    <PointAnnotation
      id={id}
      coordinate={coordinate}
      title={title}
      draggable
      onDrag={(feature: Feature<Point, { id: string }>) =>
        console.log(
          'onDrag:',
          feature.properties.id,
          feature.geometry.coordinates,
        )
      }
      onDragStart={(feature: Feature<Point, { id: string }>) =>
        console.log(
          'onDragStart:',
          feature.properties.id,
          feature.geometry.coordinates,
        )
      }
      onDragEnd={(feature: Feature<Point, { id: string }>) =>
        console.log(
          'onDragEnd:',
          feature.properties.id,
          feature.geometry.coordinates,
        )
      }
      ref={pointAnnotation}
    >
      <View style={styles.annotationContainer}>
        <Image
          source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
          style={{ width: ANNOTATION_SIZE, height: ANNOTATION_SIZE }}
          onLoad={() => pointAnnotation.current?.refresh()}
        />
      </View>
      <Callout title="This is a sample loading a remote image" />
    </PointAnnotation>
  );
};

const ShowPointAnnotation: FC = (props) => {
  const [coordinates, setCoordinates] = useState([[-73.99155, 40.73581]]);

  const renderAnnotations = () => {
    const items = [];

    for (let i = 0; i < coordinates.length; i++) {
      const coordinate = coordinates[i];

      const title = `Lon: ${coordinate[0]} Lat: ${coordinate[1]}`;
      const id = `pointAnnotation${i}`;

      if (i % 2 === 1) {
        items.push(
          null,
          <AnnotationWithRemoteImage
            key={id}
            id={id}
            coordinate={coordinate}
            title={title}
          />,
        );
      } else {
        items.push(
          null,
          <PointAnnotation
            key={id}
            id={id}
            coordinate={coordinate}
            title={title}
          >
            <View style={styles.annotationContainer} />
            <Callout title="This is an empty example" />
          </PointAnnotation>,
        );
      }
    }

    return items;
  };

  return (
    <Page {...props}>
      <MapView
        onPress={(feature) => {
          console.log('ADD NEW ANNOTATION');

          setCoordinates((prevState) => [
            ...prevState,
            (feature.geometry as Point).coordinates,
          ]);
        }}
        style={sheet.matchParent}
      >
        <Camera
          defaultSettings={{ centerCoordinate: coordinates[0], zoomLevel: 16 }}
        />

        {renderAnnotations()}
      </MapView>

      <Bubble>
        <Text>Click to add a point annotation</Text>
      </Bubble>
    </Page>
  );
};

export default ShowPointAnnotation;
