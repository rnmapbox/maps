import React from 'react';
import {Text} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

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

    this._trackingOptions = Object.keys(MapboxGL.UserTrackingModes)
      .map(key => {
        return {
          label: key,
          data: MapboxGL.UserTrackingModes[key],
        };
      })
      .sort(onSortOptions);

    this.state = {
      showUserLocation: true,
      userSelectedUserTrackingMode: this._trackingOptions[0].data,
      currentTrackingMode: this._trackingOptions[0].data,
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
    const {userTrackingMode} = e.nativeEvent.payload;
    this.setState({currentTrackingMode: userTrackingMode});
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
        return 'FolloWithHeading';
      default:
        return 'None';
    }
  }

  render() {
    return (
      <TabBarPage
        {...this.props}
        scrollable
        options={this._trackingOptions}
        onOptionPress={this.onTrackingChange}
      >
        <MapboxGL.MapView
          showUserLocation={this.state.showUserLocation}
          userTrackingMode={this.state.userSelectedUserTrackingMode}
          onUserTrackingModeChange={this.onUserTrackingModeChange}
          style={sheet.matchParent}
        />

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
