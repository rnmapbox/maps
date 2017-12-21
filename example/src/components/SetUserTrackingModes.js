import React from 'react';
import { Text } from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import TabBarPage from './common/TabBarPage';
import Bubble from './common/Bubble';

import sheet from '../styles/sheet';
import { onSortOptions } from '../utils';

class SetUserTrackingModes extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor (props) {
    super(props);

    this._trackingOptions = Object.keys(MapboxGL.UserTrackingModes).map((key) => {
      return {
        label: key,
        data: MapboxGL.UserTrackingModes[key],
      };
    }).sort(onSortOptions);

    this.state = {
      userSelectedUserTrackingMode: this._trackingOptions[0].data,
      currentTrackingMode: this._trackingOptions[0].data,
    };

    this.onTrackingChange = this.onTrackingChange.bind(this);
    this.onUserTrackingModeChange = this.onUserTrackingModeChange.bind(this);
  }

  onTrackingChange (index, userTrackingMode) {
    this.setState({
      userSelectedUserTrackingMode: userTrackingMode,
      currentTrackingMode: userTrackingMode,
    });
  }

  onUserTrackingModeChange (e) {
    const userTrackingMode = e.nativeEvent.payload.userTrackingMode;
    this.setState({ currentTrackingMode: userTrackingMode });
  }

  get userTrackingModeText () {
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

  render () {
    return (
      <TabBarPage {...this.props} scrollable options={this._trackingOptions} onOptionPress={this.onTrackingChange}>
        <MapboxGL.MapView
            showUserLocation={true}
            userTrackingMode={this.state.userSelectedUserTrackingMode}
            onUserTrackingModeChange={this.onUserTrackingModeChange}
            style={sheet.matchParent} />

        <Bubble style={{ marginBottom: 100 }}>
          <Text>User Tracking Mode: {this.userTrackingModeText}</Text>
        </Bubble>
      </TabBarPage>
    );
  }
}

export default SetUserTrackingModes;
