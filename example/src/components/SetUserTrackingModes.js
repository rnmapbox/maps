import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import TabBarPage from './common/TabBarPage';

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
      userTrackingMode: this._trackingOptions[0].data,
    };

    this.onTrackingChange = this.onTrackingChange.bind(this);
  }

  onTrackingChange (index, userTrackingMode) {
    this.setState({ userTrackingMode: userTrackingMode });
  }

  render () {
    return (
      <TabBarPage {...this.props} scrollable options={this._trackingOptions} onOptionPress={this.onTrackingChange}>
        <MapboxGL.MapView
            showUserLocation={true}
            userTrackingMode={this.state.userTrackingMode}
            style={sheet.matchParent} />
      </TabBarPage>
    );
  }
}

export default SetUserTrackingModes;
