import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../../styles/sheet';

import BaseExamplePropTypes from '../common/BaseExamplePropTypes';
import TabBarPage from '../common/TabBarPage';

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

    const zeroPadding = {
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
    };

    const somePadding = {
      paddingLeft: 40,
      paddingRight: 100,
      paddingTop: 40,
      paddingBottom: 140,
    };

    this.options = [
      {
        label: 'House',
        data: {bounds: houseBounds, padding: zeroPadding},
      },
      {
        label: 'House (Padded)',
        data: {bounds: houseBounds, padding: somePadding},
      },
      {
        label: 'Town',
        data: {bounds: townBounds, padding: zeroPadding},
      },
      {
        label: 'Town (Padded)',
        data: {bounds: townBounds, padding: somePadding},
      },
    ];

    this.state = {
      bounds: houseBounds,
      padding: zeroPadding,
      animationDuration: 0,
    };
  }

  onOptionPress = (i, config) => {
    this.setState({
      bounds: config.bounds,
      padding: config.padding,
      animationDuration: 1000,
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
            <View style={{flex: 1, borderColor: 'blue', borderWidth: 4}} />
          </View>
        </MapboxGL.MapView>
      </TabBarPage>
    );
  }
}

export default FitBounds;
