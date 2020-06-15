import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {View} from 'react-native';
let {MapView, Camera, Images, ShapeSource, SymbolLayer} = MapboxGL;

import exampleIcon from '../../assets/example.png';

const styles = {
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
  },
};

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

class ShapeSourceIcon extends React.Component {
  state = {
    images: {
      example: exampleIcon,
    },
  };

  render() {
    const {images} = this.state;

    return (
      <View style={{flex: 1}}>
        <MapView style={{flex: 1}}>
          <Camera
            zoomLevel={17}
            centerCoordinate={[-117.20611157485, 52.180961084261]}
          />
          <Images images={images} />
          <ShapeSource id="exampleShapeSource" shape={featureCollection}>
            <SymbolLayer id="exampleIconName" style={styles.icon} />
          </ShapeSource>
        </MapView>
      </View>
    );
  }
}

export default ShapeSourceIcon;
