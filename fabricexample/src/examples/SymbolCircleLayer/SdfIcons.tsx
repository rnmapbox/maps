import React from 'react';
import { View } from 'react-native';
import Mapbox, { type ImageEntry } from '@rnmapbox/maps';

import sheet from '../../styles/sheet';
import exampleIcon from '../../assets/example.png';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';
import Page from '../common/Page';

const styles = {
  icon: {
    iconImage: ['get', 'icon'],

    iconColor: ['get', 'color'],

    textField: ['get', 'name'],

    iconTextFit: 'both',

    iconSize: [
      'match',
      ['get', 'icon'],
      'example',
      1.2,
      'airport-15',
      1.2,
      /* default */ 1,
    ],
  },
} as const;

const featureCollection: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    /*
    {
      type: 'Feature',
      id: '9d10456e-bdda-4aa9-9269-04c1667d4552',
      properties: {
        icon: 'rn-image',
        color: '#f0c',
      },
      geometry: {
        type: 'Point',
        coordinates: [-117.20611157485, 52.180961084261],
      },
    },*/
    {
      type: 'Feature',
      id: '9d10456e-bdda-4aa9-9269-04c1667d4552',
      properties: {
        icon: 'popup',
        color: '#0fc',
        name: 'Line 1\nLine 2\nLine 3 is very very long',
      },
      geometry: {
        type: 'Point',
        coordinates: [-117.206908, 52.181843],
      },
    },
    /*
    {
      type: 'Feature',
      id: '9d10456e-bdda-4aa9-9269-04c1667d4552',
      properties: {
        icon: 'rn-image',
        color: '#0fc',
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
        icon: 'rn-image',
        color: '#cf0',
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
        icon: 'rn-image',
        color: '#c00',
      },
      geometry: {
        type: 'Point',
        coordinates: [-117.206862, 52.180897],
      },
    },*/
  ],
};

class SdfIcons extends React.PureComponent<BaseExampleProps> {
  state: {
    images: { [key: string]: ImageEntry };
  } = {
    images: {
      example: exampleIcon,
      popup: {
        url: 'https://docs.mapbox.com/mapbox-gl-js/assets/popup_debug.png',
        stretchX: [
          [25, 55],
          [85, 105],
        ],
        stretchY: [[25, 100]],
        content: [25, 25, 115, 100],
        scale: 1.0,
      },
    },
  };

  render() {
    const { images } = this.state;

    return (
      <Page {...this.props}>
        <Mapbox.MapView style={sheet.matchParent}>
          <Mapbox.Camera
            zoomLevel={17}
            centerCoordinate={[-117.20611157485, 52.180961084261]}
          />
          <Mapbox.Images
            nativeAssetImages={[{ name: 'pin', sdf: true }]}
            images={images}
            onImageMissing={(imageKey: string) =>
              console.log('=> on image missing', imageKey)
            }
          >
            <Mapbox.Image name="rn-image" sdf>
              <View
                style={{
                  backgroundColor: 'red',
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                }}
              />
            </Mapbox.Image>
          </Mapbox.Images>
          <Mapbox.ShapeSource id="exampleShapeSource" shape={featureCollection}>
            <Mapbox.SymbolLayer id="exampleIconName" style={styles.icon} />
          </Mapbox.ShapeSource>
        </Mapbox.MapView>
      </Page>
    );
  }
}

export default SdfIcons;
