import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../styles/sheet';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import TabBarPage from './common/TabBarPage';

class SetUserLocationRenderMode extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this._renderModeOptions = [
      {
        label: 'Normal',
        data: 'normal',
      },
      {
        label: 'Native',
        data: 'native',
      },
    ];

    this.state = {
      renderMode: this._renderModeOptions[0].data,
    };

    this.onRenderModeChange = this.onRenderModeChange.bind(this);
  }

  onRenderModeChange(index, renderMode) {
    this.setState({renderMode});
  }

  render() {
    return (
      <TabBarPage
        {...this.props}
        options={this._renderModeOptions}
        onOptionPress={this.onRenderModeChange}
      >
        <MapboxGL.MapView style={sheet.matchParent}>
          <MapboxGL.Camera followUserLocation />
          <MapboxGL.UserLocation renderMode={this.state.renderMode} />
        </MapboxGL.MapView>
      </TabBarPage>
    );
  }
}

export default SetUserLocationRenderMode;
