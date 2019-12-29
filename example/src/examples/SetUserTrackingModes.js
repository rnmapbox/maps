import React from 'react';
import {Text} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../styles/sheet';
import {onSortOptions} from '../utils';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import TabBarPage from './common/TabBarPage';
import Bubble from './common/Bubble';

class SetUserTrackingModes extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    // eslint-disable-next-line fp/no-mutating-methods
    this._trackingOptions = Object.keys(MapboxGL.UserTrackingModes)
      .map(key => {
        return {
          label: key,
          data: MapboxGL.UserTrackingModes[key],
        };
      })
      .concat([
        {
          label: 'None',
          data: 'none',
        },
      ])
      .sort(onSortOptions);

    this.state = {
      showUserLocation: true,
      userSelectedUserTrackingMode: this._trackingOptions[3].data,
      currentTrackingMode: this._trackingOptions[3].data,
    };

    this.onTrackingChange = this.onTrackingChange.bind(this);
    this.onUserTrackingModeChange = this.onUserTrackingModeChange.bind(this);
    this.onToggleUserLocation = this.onToggleUserLocation.bind(this);
  }

  onTrackingChange(index, userTrackingMode) {
    this.setState({
      userSelectedUserTrackingMode: userTrackingMode,
      currentTrackingMode: userTrackingMode,
    });
  }

  onUserTrackingModeChange(e) {
    const {followUserMode} = e.nativeEvent.payload;
    this.setState({currentTrackingMode: followUserMode || 'none'});
  }

  onToggleUserLocation() {
    this.setState({showUserLocation: !this.state.showUserLocation});
  }

  get userTrackingModeText() {
    switch (this.state.currentTrackingMode) {
      case MapboxGL.UserTrackingModes.Follow:
        return 'Follow';
      case MapboxGL.UserTrackingModes.FollowWithCourse:
        return 'FollowWithCourse';
      case MapboxGL.UserTrackingModes.FollowWithHeading:
        return 'FollowWithHeading';
      default:
        return 'None';
    }
  }

  render() {
    return (
      <TabBarPage
        {...this.props}
        scrollable
        initialIndex={3}
        options={this._trackingOptions}
        onOptionPress={this.onTrackingChange}>
        <MapboxGL.MapView style={sheet.matchParent}>
          <MapboxGL.UserLocation visible={this.state.showUserLocation} />

          <MapboxGL.Camera
            defaultSettings={{
              centerCoordinate: [-111.8678, 40.2866],
              zoomLevel: 16,
            }}
            followUserLocation={
              this.state.userSelectedUserTrackingMode !== 'none'
            }
            followUserMode={
              this.state.userSelectedUserTrackingMode !== 'none'
                ? this.state.userSelectedUserTrackingMode
                : 'normal'
            }
            onUserTrackingModeChange={this.onUserTrackingModeChange}
          />
        </MapboxGL.MapView>

        <Bubble style={{bottom: 100}}>
          <Text>User Tracking Mode: {this.userTrackingModeText}</Text>
        </Bubble>

        <Bubble onPress={this.onToggleUserLocation} style={{bottom: 180}}>
          <Text>Toggle User Location</Text>
        </Bubble>
      </TabBarPage>
    );
  }
}

export default SetUserTrackingModes;
