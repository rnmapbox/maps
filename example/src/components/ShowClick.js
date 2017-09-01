import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapboxGL from 'react-native-mapbox-gl';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';
import Bubble from './common/Bubble';

import sheet from '../styles/sheet';
import colors from '../styles/colors';

import { DEFAULT_CENTER_COORDINATE } from '../utils';

const styles = StyleSheet.create({
  containter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastClickBanner: {
    borderRadius: 30,
    position: 'absolute',
    bottom: 16,
    left: 48,
    right: 48,
    paddingVertical: 16,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
});

class ShowClick extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor (props) {
    super(props);

    this.state = {
      latitude: undefined,
      longitude: undefined,
      screenPointX: undefined,
      screenPointY: undefined,
    };

    this.onPress = this.onPress.bind(this);
  }

  get hasValidLastClick () {
    return typeof this.state.latitude === 'number' && typeof this.state.longitude === 'number';
  }

  onPress (event) {
    const { geometry, properties } = event;

    this.setState({
      latitude: geometry.coordinates[1],
      longitude: geometry.coordinates[0],
      screenPointX: properties.screenPointX,
      screenPointY: properties.screenPointY,
    });
  }

  renderLastClicked () {
    let childView;

    if (!this.hasValidLastClick) {
      return (
        <Bubble>
          <Text>Click the map!</Text>
        </Bubble>
      );
    }

    return (
      <Bubble>
        <Text>Latitude: {this.state.latitude}</Text>
        <Text>Longitude: {this.state.longitude}</Text>
        <Text>Screen Point X: {this.state.screenPointX}</Text>
        <Text>Screen Point Y: {this.state.screenPointY}</Text>
      </Bubble>
    );
  }

  render () {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
          centerCoordinate={DEFAULT_CENTER_COORDINATE}
          style={sheet.matchParent}
          onPress={this.onPress} />

        {this.renderLastClicked()}
      </Page>
    );
  }
}

export default ShowClick;
