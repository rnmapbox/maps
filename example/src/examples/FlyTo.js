import React from 'react';
import {Alert} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../styles/sheet';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import TabBarPage from './common/TabBarPage';

const layerStyles = {
  building: {
    fillExtrusionColor: '#aaa',

    fillExtrusionHeight: [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      15.05,
      ['get', 'height'],
    ],

    fillExtrusionBase: [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      15.05,
      ['get', 'min_height'],
    ],

    fillExtrusionOpacity: 0.6,
  },
};

class FlyTo extends React.Component {
  static SF_OFFICE_LOCATION = [-122.400021, 37.789085];

  static DC_OFFICE_LOCATION = [-77.036086, 38.910233];

  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this.state = {
      location: FlyTo.SF_OFFICE_LOCATION,
    };

    this._flyToOptions = [
      {label: 'SF', data: FlyTo.SF_OFFICE_LOCATION},
      {label: 'DC', data: FlyTo.DC_OFFICE_LOCATION},
    ];

    this.onFlyToPress = this.onFlyToPress.bind(this);
    this.onFlyToComplete = this.onFlyToComplete.bind(this);
  }

  onFlyToPress(i) {
    this.setState({location: this._flyToOptions[i].data});
  }

  onFlyToComplete() {
    Alert.alert('Fly To Animation Completed', 'We did it!!!');
  }

  render() {
    return (
      <TabBarPage
        {...this.props}
        options={this._flyToOptions}
        onOptionPress={this.onFlyToPress}>
        <MapboxGL.MapView style={sheet.matchParent}>
          <MapboxGL.Camera
            zoomLevel={16}
            animationMode={'flyTo'}
            animationDuration={6000}
            centerCoordinate={this.state.location}
          />

          <MapboxGL.UserLocation />

          <MapboxGL.VectorSource>
            <MapboxGL.FillExtrusionLayer
              id="building3d"
              sourceLayerID="building"
              style={layerStyles.building}
            />
          </MapboxGL.VectorSource>
        </MapboxGL.MapView>
      </TabBarPage>
    );
  }
}

export default FlyTo;
