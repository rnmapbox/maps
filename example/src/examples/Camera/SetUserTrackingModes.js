import React from 'react';
import { Text, ScrollView } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { ButtonGroup } from '@rneui/base';

import { onSortOptions } from '../../utils';
import Bubble from '../common/Bubble';

const styles = {
  bubbleOne: { bottom: 80 },
  bubbleTwo: { bottom: 150 },
  bubbleThree: { bottom: 220 },
  matchParent: { flex: 1 },
};

class SetUserTrackingModes extends React.Component {
  constructor(props) {
    super(props);

    this._trackingOptions = Object.keys(Mapbox.UserTrackingModes)
      .map((key) => {
        return {
          label: key,
          data: Mapbox.UserTrackingModes[key],
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
      showsUserHeadingIndicator: false,
      selectedIndex: 3,
    };

    this.onTrackingChange = this.onTrackingChange.bind(this);
    this.onUserTrackingModeChange = this.onUserTrackingModeChange.bind(this);
    this.onToggleUserLocation = this.onToggleUserLocation.bind(this);
    this.onToggleHeadingIndicator = this.onToggleHeadingIndicator.bind(this);
  }

  onTrackingChange(index, userTrackingMode) {
    this.setState({
      selectedIndex: index,
      userSelectedUserTrackingMode: userTrackingMode,
      currentTrackingMode: userTrackingMode,
    });
  }

  onUserTrackingModeChange(e) {
    const { followUserMode } = e.nativeEvent.payload;
    this.setState({ currentTrackingMode: followUserMode || 'none' });
  }

  onToggleUserLocation() {
    this.setState({ showUserLocation: !this.state.showUserLocation });
  }

  onToggleHeadingIndicator() {
    this.setState({
      showsUserHeadingIndicator: !this.state.showsUserHeadingIndicator,
    });
  }

  get userTrackingModeText() {
    switch (this.state.currentTrackingMode) {
      case Mapbox.UserTrackingModes.Follow:
        return 'Follow';
      case Mapbox.UserTrackingModes.FollowWithCourse:
        return 'FollowWithCourse';
      case Mapbox.UserTrackingModes.FollowWithHeading:
        return 'FollowWithHeading';
      default:
        return 'None';
    }
  }

  render() {
    return (
      <>
        <ScrollView horizontal style={{ maxHeight: 64 }}>
          <ButtonGroup
            buttons={this._trackingOptions.map((i) => i.label)}
            selectedIndex={this.state.selectedIndex}
            onPress={(i) =>
              this.onTrackingChange(i, this._trackingOptions[i].data)
            }
          />
        </ScrollView>
        <Mapbox.MapView style={styles.matchParent}>
          <Mapbox.UserLocation
            visible={this.state.showUserLocation}
            showsUserHeadingIndicator={this.state.showsUserHeadingIndicator}
          />

          <Mapbox.Camera
            defaultSettings={{
              centerCoordinate: [-111.8678, 40.2866],
              zoomLevel: 0,
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
        </Mapbox.MapView>

        <Bubble style={styles.bubbleOne}>
          <Text>User Tracking Mode: {this.userTrackingModeText}</Text>
        </Bubble>

        <Bubble onPress={this.onToggleUserLocation} style={styles.bubbleTwo}>
          <Text>
            Toggle User Location:{' '}
            {this.state.showUserLocation ? 'true' : 'false'}
          </Text>
        </Bubble>

        <Bubble
          onPress={this.onToggleHeadingIndicator}
          style={styles.bubbleThree}
        >
          <Text>
            Toggle user heading indicator:{' '}
            {this.state.showsUserHeadingIndicator ? 'true' : 'false'}
          </Text>
        </Bubble>
      </>
    );
  }
}

export default SetUserTrackingModes;
