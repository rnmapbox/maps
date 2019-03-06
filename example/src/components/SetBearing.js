import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import sheet from '../styles/sheet';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import TabBarPage from './common/TabBarPage';

class SetBearing extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this._bearingOptions = [
      {label: '0', data: 0},
      {label: '90', data: 90},
      {label: '180', data: 180},
    ];

    this.onBearingChange = this.onBearingChange.bind(this);
  }

  onBearingChange(index, bearing) {
    this.map.setCamera({heading: bearing, duration: 150});
  }

  render() {
    return (
      <TabBarPage
        {...this.props}
        options={this._bearingOptions}
        onOptionPress={this.onBearingChange}
      >
        <MapboxGL.MapView
          ref={ref => (this.map = ref)}
          heading={0}
          showUserLocation={true}
          userTrackingMode={MapboxGL.UserTrackingModes.Follow}
          style={sheet.matchParent}
        />
      </TabBarPage>
    );
  }
}

export default SetBearing;
