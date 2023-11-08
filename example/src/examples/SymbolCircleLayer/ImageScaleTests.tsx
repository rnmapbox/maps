import React, { ComponentProps } from 'react';
import {
  Images,
  MapView,
  ShapeSource,
  SymbolLayer,
  Camera,
  CircleLayer,
} from '@rnmapbox/maps';
import { View, Image, Text, ImageSourcePropType } from 'react-native';

const styles = {
  mapView: { flex: 1 },
} as const;

const iconLayerStyle: ComponentProps<typeof SymbolLayer>['style'] = {
  iconSize: 1.0,
  iconImage: ['get', 'icon'],
  textField: ['get', 'text'],
  textColor: 'black',
  textHaloColor: 'white',
  textHaloWidth: 1,
  textAnchor: 'top',
  textOffset: [0, 2.5] as number[],
} as const;

const dx = 0.005;
const dy = 0.005;

function feature(image: string, x: number, y: number): GeoJSON.Feature {
  return {
    type: 'Feature',
    id: `feature-${image}-${x}-{y}`,
    geometry: {
      type: 'Point',
      coordinates: [-74.00597 + x * dx, 40.71427 + y * dy],
    },
    properties: {
      icon: image,
      text: `${image}`,
    },
  };
}

const features: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    feature('icon1', 0, 0),
    feature('icon2', 1, 0),
    feature('icon3', 0, 1),
    feature('icon4', 1, 1),
    feature('bicon1', 1, 2),
  ],
};

const baseImages: {
  [key: string]: ImageSourcePropType;
} = {
  icon1: require('../../assets/scale-test-icon.png'),
  icon2: require('../../assets/scale-test-icon2.png'),
  icon3: require('../../assets/scale-test-icon3.png'),
  icon4: require('../../assets/scale-test-icon4.png'),
} as const;

const scaleImages: {
  [key: string]: { image: ImageSourcePropType; scale: number };
} = {
  bicon1: {
    image: require('../../assets/scale-test-icon.png'),
    scale: 1.0,
  },
} as const;

const allImages = { ...baseImages, ...scaleImages };

const ImageScaleTests = () => {
  const radius = 32;
  const circelStyle = {
    circleRadius: radius,
    circleOpacity: 0.4,
    circleStrokeColor: 'green',
    circleStrokeWidth: 2,
  };
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          padding: 4,
          justifyContent: 'space-around',
        }}
      >
        {Object.entries(baseImages).map(([key, value]) => (
          <View
            key={key}
            style={{ flexDirection: 'column', alignItems: 'center' }}
          >
            <Image key={key} source={value} />
            <Text>{key}</Text>
          </View>
        ))}
        {Object.entries(scaleImages).map(([key, value]) => (
          <View
            key={key}
            style={{ flexDirection: 'column', alignItems: 'center' }}
          >
            <Image source={value.image} />
            <Text>{key}</Text>
          </View>
        ))}
      </View>
      <MapView style={styles.mapView}>
        <Camera centerCoordinate={[-74.00597, 40.71427]} zoomLevel={14} />
        <Images images={allImages} />
        <ShapeSource id={'shape-source-id-0'} shape={features}>
          <SymbolLayer id="symbol-id" style={iconLayerStyle} />
          <CircleLayer id="circel-layer" style={circelStyle} />
        </ShapeSource>
      </MapView>
    </>
  );
};

export default ImageScaleTests;
