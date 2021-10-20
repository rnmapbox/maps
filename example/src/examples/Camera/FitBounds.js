import React from 'react';
import {View} from 'react-native';
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
};

class FitBounds extends React.Component {
  static propTypes = {...BaseExamplePropTypes};

  constructor(props) {
    super(props);

    const houseBounds = {
      ne: [-74.135379, 40.795909],
      sw: [-74.135449, 40.795578],
    };

    const townBounds = {
      ne: [-74.12641, 40.797968],
      sw: [-74.143727, 40.772177],
    };

    this.options = [
      {
        label: 'House (none)',
        data: {bounds: houseBounds, padding: buildPadding()},
      },
      {
        label: 'House (bottom)',
        data: {bounds: houseBounds, padding: buildPadding([40, 40, 200, 40])},
      },
      {
        label: 'House (top)',
        data: {bounds: houseBounds, padding: buildPadding([200, 40, 40, 40])},
      },
      {
        label: 'Town',
        data: {bounds: townBounds, padding: buildPadding()},
      },
      {
        label: 'Town (bottom)',
        data: {bounds: townBounds, padding: buildPadding([40, 40, 200, 40])},
      },
      {
        label: 'Town (top)',
        data: {bounds: townBounds, padding: buildPadding([200, 40, 40, 40])},
      },
    ];

    this.state = {
      ...this.options[0].data,
      animationDuration: 0,
    };
  }

  onOptionPress = (i, config) => {
    this.setState({
      bounds: config.bounds,
      padding: config.padding,
      animationDuration: 500,
    });
  };

  render() {
    const {bounds, padding, animationDuration} = this.state;

    return (
      <TabBarPage
        {...this.props}
        options={this.options}
        onOptionPress={this.onOptionPress}>
        <MapboxGL.MapView
          styleURL={MapboxGL.StyleURL.Satellite}
          style={sheet.matchParent}>
          <MapboxGL.Camera
            bounds={bounds}
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

export default FitBounds;
