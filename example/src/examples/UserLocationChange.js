import React from 'react';
import {Text} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../styles/sheet';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';
import Bubble from './common/Bubble';

class UserLocationChange extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this.state = {
      timestamp: 0,
      latitude: 0.0,
      longitude: 0.0,
      altitude: 0.0,
      heading: 0.0,
      accuracy: 0.0,
      speed: 0.0,
    };

    this.onUserLocationUpdate = this.onUserLocationUpdate.bind(this);
  }

  onUserLocationUpdate(location) {
    this.setState({
      timestamp: location.timestamp,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      heading: location.coords.heading,
      accuracy: location.coords.accuracy,
      speed: location.coords.speed,
    });
  }

  renderLocationInfo() {
    if (this.state.timestamp <= 0) {
      return null;
    }
    return (
      <Bubble>
        <Text>Timestamp: {this.state.timestamp}</Text>
        <Text>Latitude: {this.state.latitude}</Text>
        <Text>Longitude: {this.state.longitude}</Text>
        <Text>Altitude: {this.state.altitude}</Text>
        <Text>Heading: {this.state.heading}</Text>
        <Text>Accuracy: {this.state.accuracy}</Text>
        <Text>Speed: {this.state.speed}</Text>
      </Bubble>
    );
  }

  render() {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
          zoomLevel={16}
          showUserLocation={true}
          onUserLocationUpdate={this.onUserLocationUpdate}
          userTrackingMode={MapboxGL.UserTrackingModes.Follow}
          style={sheet.matchParent}
        />
        {this.renderLocationInfo()}
      </Page>
    );
  }
}

export default UserLocationChange;
