import React from 'react';
import Mapbox from '@rnmapbox/maps';

import sheet from '../../styles/sheet';
import exampleIcon from '../../assets/example.png';
import pinIcon from '../../assets/pin.png';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';
import Page from '../common/Page';

const styles = {
  icon: {
    iconImage: ['get', 'icon'],

    iconColor: '#f0c',

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
  ],
};

class SdfIcons extends React.PureComponent<BaseExampleProps> {
  state = {
    images: {
      example: exampleIcon,
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
              this.setState({
                images: { ...this.state.images, [imageKey]: pinIcon },
              })
            }
          />
          <Mapbox.ShapeSource id="exampleShapeSource" shape={featureCollection}>
            <Mapbox.SymbolLayer id="exampleIconName" style={styles.icon} />
          </Mapbox.ShapeSource>
        </Mapbox.MapView>
      </Page>
    );
  }
}

export default SdfIcons;
