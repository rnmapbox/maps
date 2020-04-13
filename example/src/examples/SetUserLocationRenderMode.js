import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {Button} from 'react-native';

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
      {
        label: 'Hidden',
        data: 'hidden',
      }
    ];

    this.state = {
      renderMode: this._renderModeOptions[0].data,
      followUserLocation: true,
    };

    this.onRenderModeChange = this.onRenderModeChange.bind(this);
  }

  onRenderModeChange(index, renderMode) {
    this.setState({renderMode});
  }

  render() {
    const {followUserLocation} = this.state;
    return (
      <TabBarPage
        {...this.props}
        options={this._renderModeOptions}
        onOptionPress={this.onRenderModeChange}>
        <Button
          title={
            followUserLocation
              ? 'Don\'t follow User Location'
              : 'Follow user location'
          }
          onPress={() =>
            this.setState({followUserLocation: !followUserLocation})
          }
        />
        <MapboxGL.MapView style={sheet.matchParent}>
          <MapboxGL.Camera followUserLocation={followUserLocation} />
          {this.state.renderMode !== 'hidden' && (
            <MapboxGL.UserLocation renderMode={this.state.renderMode} />
          )}
        </MapboxGL.MapView>
      </TabBarPage>
    );
  }
}

export default SetUserLocationRenderMode;
