import React from 'react';
import { View } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../../styles/sheet';

import BaseExamplePropTypes from '../common/BaseExamplePropTypes';
import TabBarPage from '../common/TabBarPage';

const buildPadding = ([top, right, bottom, left] = [0, 0, 0, 0]) => {
  return {
    paddingLeft: left,
    paddingRight: right,
    paddingTop: top,
    paddingBottom: bottom,
  };
}

class FitCenterCoord extends React.Component {
  static propTypes = {...BaseExamplePropTypes};

  constructor(props) {
    super(props);

    const houseCenterCoord = [-74.13545, 40.7958];
    const houseZoom = 20;
    
    const townCenterCoord = [-74.12641, 40.797968];
    const townZoom = 14;

    this.options = [
      {
        label: 'House (none)',
        data: {centerCoord: houseCenterCoord, zoom: houseZoom, padding: buildPadding()},
      },
      {
        label: 'House (bottom)',
        data: {centerCoord: houseCenterCoord, zoom: houseZoom, padding: buildPadding([40, 40, 200, 40])},
      },
      {
        label: 'House (top)',
        data: {centerCoord: houseCenterCoord, zoom: houseZoom, padding: buildPadding([200, 40, 40, 40])},
      },
      {
        label: 'Town',
        data: {centerCoord: townCenterCoord, zoom: townZoom, padding: buildPadding()},
      },
      {
        label: 'Town (bottom)',
        data: {centerCoord: townCenterCoord, zoom: townZoom, padding: buildPadding([40, 40, 200, 40])},
      },
      {
        label: 'Town (top)',
        data: {centerCoord: townCenterCoord, zoom: townZoom, padding: buildPadding([200, 40, 40, 40])},
      },
    ];

    this.state = {
      ...this.options[0].data,
      animationDuration: 0,
    };
  }

  onOptionPress = (i, config) => {
    this.setState({
      centerCoord: config.centerCoord,
      zoom: config.zoom,
      padding: config.padding,
      animationDuration: 500,
    });
  };

  render() {
    const {centerCoord, zoom, padding, animationDuration} = this.state;

    return (
      <TabBarPage
        {...this.props}
        options={this.options}
        onOptionPress={this.onOptionPress}>
        <MapboxGL.MapView
          styleURL={MapboxGL.StyleURL.Satellite}
          style={sheet.matchParent}>
          <MapboxGL.Camera
            centerCoordinate={centerCoord}
            zoomLevel={zoom}
            padding={padding}
            animationDuration={animationDuration}
          />
          <View style={{flex: 1, ...padding}}>
            <View style={{flex: 1, borderColor: 'white', borderWidth: 4}} />
          </View>
        </MapboxGL.MapView>
      </TabBarPage>
    );
  }
}

export default FitCenterCoord;
