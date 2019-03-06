import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import sheet from '../styles/sheet';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import TabBarPage from './common/TabBarPage';

class SetPitch extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this._pitchOptions = [
      {label: '15', data: 15},
      {label: '45', data: 45},
      {label: '60', data: 60},
    ];

    this.onUpdatePitch = this.onUpdatePitch.bind(this);
  }

  onUpdatePitch(index, pitch) {
    this.map.setCamera({pitch, duration: 300});
  }

  render() {
    return (
      <TabBarPage
        {...this.props}
        options={this._pitchOptions}
        onOptionPress={this.onUpdatePitch}
      >
        <MapboxGL.MapView
          ref={ref => (this.map = ref)}
          pitch={15}
          showUserLocation={true}
          userTrackingMode={MapboxGL.UserTrackingModes.Follow}
          style={sheet.matchParent}
        />
      </TabBarPage>
    );
  }
}

export default SetPitch;
