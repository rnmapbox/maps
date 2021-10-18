import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {Button, View} from 'react-native';
import {ButtonGroup} from 'react-native-elements';
import PropTypes from 'prop-types';

import sheet from '../../styles/sheet';
import BaseExamplePropTypes from '../common/BaseExamplePropTypes';
import TabBarPage from '../common/TabBarPage';

class SettingsPane extends React.Component {
  render() {
    const followModes = ['normal', 'compass', 'course'];
    const renderModes = ['normal', 'compass', 'gps'];
    let {settings, onUpdateSettings} = this.props;
    let {
      followUserLocation,
      showsUserHeadingIndicator,
      followUserMode = 'normal',
      androidRenderMode = 'normal',
    } = settings;
    const selectedModeIndex = followModes.findIndex(i => i === followUserMode);
    const renderModeIndex = renderModes.findIndex(i => i === androidRenderMode);

    return (
      <View>
        <Button
          title={
            followUserLocation
              ? 'Don`t follow User Location'
              : 'Follow user location'
          }
          onPress={() =>
            onUpdateSettings({followUserLocation: !followUserLocation})
          }
        />
        <Button
          title={
            showsUserHeadingIndicator
              ? 'Hide user heading indicator'
              : 'Show user heading indicator'
          }
          onPress={() =>
            onUpdateSettings({
              showsUserHeadingIndicator: !showsUserHeadingIndicator,
            })
          }
        />
        <ButtonGroup
          buttons={followModes}
          selectedIndex={selectedModeIndex}
          onPress={i =>
            onUpdateSettings({
              followUserMode: followModes[i],
            })
          }
        />
        <ButtonGroup
          buttons={renderModes}
          selectedIndex={renderModeIndex}
          onPress={i =>
            onUpdateSettings({
              androidRenderMode: renderModes[i],
            })
          }
        />
      </View>
    );
  }
}
SettingsPane.propTypes = {
  settings: PropTypes.shape({
    followUserLocation: PropTypes.bool,
    showsUserHeadingIndicator: PropTypes.bool,
    followUserMode: PropTypes.string,
    androidRenderMode: PropTypes.string,
  }),
  onUpdateSettings: PropTypes.func,
};

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
      },
    ];

    this.state = {
      renderMode: this._renderModeOptions[0].data,
      followUserLocation: true,
      showsUserHeadingIndicator: false,
    };

    this.onRenderModeChange = this.onRenderModeChange.bind(this);
  }

  onRenderModeChange(index, renderMode) {
    this.setState({renderMode});
  }

  render() {
    const {
      followUserLocation,
      showsUserHeadingIndicator,
      followUserMode,
      androidRenderMode,
    } = this.state;
    return (
      <TabBarPage
        {...this.props}
        options={this._renderModeOptions}
        onOptionPress={this.onRenderModeChange}>
        <SettingsPane
          settings={this.state}
          onUpdateSettings={settings => this.setState(settings)}
        />
        <MapboxGL.MapView style={sheet.matchParent} tintColor={'red'}>
          <MapboxGL.Camera
            followUserLocation={followUserLocation}
            followUserMode={followUserMode}
          />
          {this.state.renderMode !== 'hidden' && (
            <MapboxGL.UserLocation
              renderMode={this.state.renderMode}
              showsUserHeadingIndicator={showsUserHeadingIndicator}
              androidRenderMode={androidRenderMode}
            />
          )}
        </MapboxGL.MapView>
      </TabBarPage>
    );
  }
}

export default SetUserLocationRenderMode;
