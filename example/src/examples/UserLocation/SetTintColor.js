import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../../styles/sheet';
import BaseExamplePropTypes from '../common/BaseExamplePropTypes';
import TabBarPage from '../common/TabBarPage';

const COLOR = ['red', 'yellow', 'green'];
const OPTIONS = [{label: 'red'}, {label: 'yellow'}, {label: 'green'}];

class SetTintColor extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  state = {tintColor: COLOR[0]};

  onTintColorChange = index => {
    this.setState({tintColor: COLOR[index]});
  };

  render() {
    return (
      <TabBarPage
        {...this.props}
        options={OPTIONS}
        onOptionPress={this.onTintColorChange}>
        <MapboxGL.MapView
          style={sheet.matchParent}
          tintColor={this.state.tintColor}>
          <MapboxGL.Camera
            followZoomLevel={16}
            followUserMode="compass"
            followUserLocation
          />

          <MapboxGL.UserLocation
            renderMode="native"
            androidRenderMode="compass"
          />
        </MapboxGL.MapView>
      </TabBarPage>
    );
  }
}

export default SetTintColor;
