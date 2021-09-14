import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../../styles/sheet';

import BaseExamplePropTypes from '../common/BaseExamplePropTypes';
import TabBarPage from '../common/TabBarPage';

class FitBounds extends React.Component {
  static propTypes = {...BaseExamplePropTypes};

  houseConfig = {
    bounds: {
      ne: [-74.135379, 40.795909],
      sw: [-74.135449, 40.795578],
    },
  };

  townConfig =  {
    bounds: {
      ne: [-74.12641, 40.797968],
      sw: [-74.143727, 40.772177],
    },
  };

  padding = {
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 40,
    paddingBottom: 40,
  };

  constructor(props) {
    super(props);

    this.options = [
      {
        label: 'House',
        data: this.houseConfig,
      },
      {
        label: 'Town',
        data: this.townConfig,
      },
      {
        label: 'House (Padded)',
        data: { ...this.houseConfig, padding },
      },
      {
        label: 'Town (Padded)',
        data: { ...this.townConfig, padding },
      },
    ];

    this.state = {
      ...this.houseConfig,
      animationDuration: 0,
    };
  }

  onOptionPress = (i, config) => {
    this.setState({
      bounds: config.bounds,
      padding: config.padding,
      animationDuration: 2000,
    });
  }

  render() {
    return (
      <TabBarPage
        {...this.props}
        options={this.options}
        onOptionPress={this.onOptionPress}>
        <MapboxGL.MapView
          contentInset={10}
          styleURL={MapboxGL.StyleURL.Satellite}
          style={sheet.matchParent}>
          <MapboxGL.Camera
            bounds={this.state.bounds}
            padding={this.state.padding}
            animationDuration={this.state.animationDuration}
            maxZoomLevel={19}
          />
        </MapboxGL.MapView>
      </TabBarPage>
    );
  }
}

export default FitBounds;
