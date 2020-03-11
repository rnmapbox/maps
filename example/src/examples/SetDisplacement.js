import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../styles/sheet';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import TabBarPage from './common/TabBarPage';

const DISPLACEMENT = [0, 5, 10];
const OPTIONS = [{label: '0 meter'}, {label: '5 meter'}, {label: '10 meter'}];

class SetDisplacement extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  state = {minDisplacement: DISPLACEMENT[0]};

  componentDidMount() {
    MapboxGL.locationManager.start();
  }

  componentWillUnmount() {
    MapboxGL.locationManager.stop();
  }

  onDisplacementChange = index => {
    this.setState({minDisplacement: DISPLACEMENT[index]});
  };

  render() {
    return (
      <TabBarPage
        {...this.props}
        options={OPTIONS}
        onOptionPress={this.onDisplacementChange}>
        <MapboxGL.MapView style={sheet.matchParent}>
          <MapboxGL.Camera
            followZoomLevel={16}
            followUserMode="compass"
            followUserLocation
          />

          <MapboxGL.UserLocation minDisplacement={this.state.minDisplacement} />
        </MapboxGL.MapView>
      </TabBarPage>
    );
  }
}

export default SetDisplacement;
