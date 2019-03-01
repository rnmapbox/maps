import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import sheet from '../styles/sheet';
import exampleIcon from '../assets/example.png';
import {IS_ANDROID} from '../utils';

import Page from './common/Page';
import BaseExamplePropTypes from './common/BaseExamplePropTypes';

const styles = MapboxGL.StyleSheet.create({
  icon: {
    iconImage: '{icon}',
    iconSize: MapboxGL.StyleSheet.source(
      [['example', IS_ANDROID ? 1 : 0.5], ['airport-15', 1.2]],
      'icon',
      MapboxGL.InterpolationMode.Categorical,
    ),
  },
});

const featureCollection = {
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
  ],
};

class ShapeSourceIcon extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  render() {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
          zoomLevel={17}
          centerCoordinate={[-117.20611157485, 52.180961084261]}
          style={sheet.matchParent}
        >
          <MapboxGL.ShapeSource
            id="exampleShapeSource"
            shape={featureCollection}
            images={{example: exampleIcon, assets: ['pin']}}
          >
            <MapboxGL.SymbolLayer id="exampleIconName" style={styles.icon} />
          </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
      </Page>
    );
  }
}

export default ShapeSourceIcon;
