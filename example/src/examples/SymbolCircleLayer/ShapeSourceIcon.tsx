import React from 'react';
import {
  MapView,
  Images,
  Camera,
  Image,
  SymbolLayer,
  ShapeSource,
} from '@rnmapbox/maps';
import { type StyleProp, Text, type ViewStyle } from 'react-native';
import { type FeatureCollection } from 'geojson';

import exampleIcon from '../../assets/example.png';
import pinIcon from '../../assets/pin.png';
import { type SymbolLayerStyleProps } from '../../../../src/utils/MapboxStyles';
import { type ExampleWithMetadata } from '../common/ExampleMetadata';

const styles: {
  icon: SymbolLayerStyleProps;
  matchParent: StyleProp<ViewStyle>;
} = {
  icon: {
    iconImage: ['get', 'icon'],

    iconSize: [
      'match',
      ['get', 'icon'],
      'example',
      1.2,
      'airport-15',
      1.2,
      /* default */ 1,
    ],
    iconAllowOverlap: true,
  },
  matchParent: { flex: 1 },
};

const featureCollection: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: '9d10456e-bdda-4aa9-9269-04c1667d4552',
      properties: {
        icon: 'example',
      },
      geometry: {
        type: 'Point',
        coordinates: [-117.20611157485, 52.180961084261],
      },
    },
    {
      type: 'Feature',
      id: '9d10456e-bdda-4aa9-9269-04c1667d4552',
      properties: {
        icon: 'airport-15',
      },
      geometry: {
        type: 'Point',
        coordinates: [-117.205908, 52.180843],
      },
    },
    {
      type: 'Feature',
      id: '9d10456e-bdda-4aa9-9269-04c1667d4552',
      properties: {
        icon: 'pin',
      },
      geometry: {
        type: 'Point',
        coordinates: [-117.206562, 52.180797],
      },
    },
    {
      type: 'Feature',
      id: '9d10456e-bdda-4aa9-9269-04c1667d4553',
      properties: {
        icon: 'pin3',
      },
      geometry: {
        type: 'Point',
        coordinates: [-117.206862, 52.180897],
      },
    },
    {
      type: 'Feature',
      id: '9d10456e-bdda-4aa9-9269-04c1667d4555',
      properties: {
        icon: 'pin-rn',
      },
      geometry: {
        type: 'Point',
        coordinates: [-117.205862, 52.180697],
      },
    },
  ],
};

class ShapeSourceIcon extends React.Component {
  state = {
    images: {
      example: exampleIcon,
    },
  };

  render() {
    const { images } = this.state;

    return (
      <MapView style={styles.matchParent}>
        <Camera
          defaultSettings={{
            zoomLevel: 16,
            centerCoordinate: [-117.20611157485, 52.180961084261],
          }}
        />
        <Images
          nativeAssetImages={['pin']}
          images={images}
          onImageMissing={(imageKey) => {
            if (imageKey !== 'pin-rn') {
              this.setState({
                images: { ...this.state.images, [imageKey]: pinIcon },
              });
            }
          }}
        >
          <Image name="pin-rn">
            <Text
              style={{
                fontWeight: 'bold',
                textAlign: 'center',
                color: 'white',
                borderRadius: 10,
                backgroundColor: 'gray',
                padding: 8,
                margin: 16,
                width: 100,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
              }}
            >
              RN Pin 3
            </Text>
          </Image>
        </Images>
        <ShapeSource id="exampleShapeSource" shape={featureCollection}>
          <SymbolLayer id="exampleIconName" style={styles.icon} />
        </ShapeSource>
      </MapView>
    );
  }
}

export default ShapeSourceIcon;

/* end-example-doc */
const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Shape Source Icons',
  tags: [
    'ShapeSource',
    'SymbolLayer',
    'Images',
    'Images#nativeAssetImages',
    'Images#onImageMissing',
  ],
  docs: `
Render icons with various methods.

* pin-rn: Rendered with a React Native View
* pin: Rendered with a native asset image
* pin3: Resolved as a result of onImageMissing
* example: Rendered with a js asset image (require)

`,
};

(ShapeSourceIcon as unknown as ExampleWithMetadata).metadata = metadata;
