import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { View, StyleSheet } from 'react-native';
import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';
import PulseCircleLayer from './common/PulseCircleLayer';
import { Button } from 'react-native-elements';
import RouteSimulator from '../utils/RouteSimulator';

import MapboxClient from '../MapboxClient';

import sheet from '../styles/sheet';
import { SF_OFFICE_COORDINATE } from '../utils';
import { lineString as makeLineString } from '@turf/helpers';

const SF_ZOO_COORDINATE = [-122.505412, 37.737463];

const styles = StyleSheet.create({
  buttonCnt: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  button: {
    borderRadius: 3,
    backgroundColor: 'blue',
  },
});

const layerStyles = MapboxGL.StyleSheet.create({
  origin: {
    circleRadius: 8,
    circleColor: '#b43b71',
    circleStrokeWidth: 1,
  },
  destination: {
    circleRadius: 8,
    circleColor: '#ba3b3f',
    circleStrokeWidth: 1,
  },
  route: {
    lineColor: 'white',
    lineWidth: 2,
    lineOpacity: 0.84,
  },
});

class DriveTheLine extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor (props) {
    super(props);

    this.state = {
      route: null,
      currentPoint: null,
      routeSimulator: null,
    };

    this.onStart = this.onStart.bind(this);
  }

  onStart () {
    const routeSimulator = new RouteSimulator(this.state.route);
    routeSimulator.addListener((currentPoint) => this.setState({ currentPoint: currentPoint }));
    routeSimulator.start();
    this.setState({ routeSimulator: routeSimulator });
  }

  async componentDidMount () {
    const res = await MapboxClient.getDirections([
      { latitude: SF_OFFICE_COORDINATE[1], longitude: SF_OFFICE_COORDINATE[0] },
      { latitude: SF_ZOO_COORDINATE[1], longitude: SF_ZOO_COORDINATE[0] },
    ], { profile: 'walking', geometry: 'polyline' });

    this.setState({
      route: makeLineString(res.entity.routes[0].geometry.coordinates),
    });
  }

  componentWillUnmount () {
    if (this.state.routeSimulator) {
      this.state.routeSimulator.stop();
    }
  }

  renderRoute () {
    if (!this.state.route) {
      return null;
    }

    return (
      <MapboxGL.ShapeSource id='routeSource' shape={this.state.route}>
        <MapboxGL.LineLayer id='routeFill' style={layerStyles.route} belowLayerID='originInnerCircle' />
      </MapboxGL.ShapeSource>
    );
  }

  renderProgress () {
    if (!this.state.currentPoint) {
      return;
    }
    return (
      <PulseCircleLayer
        shape={this.state.currentPoint}
        aboveLayerID='destinationInnerCircle' />
    );
  }

  renderActions () {
    if (this.state.routeSimulator) {
      return null;
    }
    return (
      <View style={styles.buttonCnt}>
        <Button
          raised
          title='Start'
          onPress={this.onStart}
          style={styles.button}
          disabled={!this.state.route} />
      </View>
    );
  }

  render () {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
            zoomLevel={11}
            ref={(c) => this._map = c}
            centerCoordinate={[-122.452652, 37.762963]}
            style={sheet.matchParent}
            styleURL={MapboxGL.StyleURL.Dark}>

            <MapboxGL.ShapeSource id='origin' shape={MapboxGL.geoUtils.makePoint(SF_OFFICE_COORDINATE)}>
              <MapboxGL.CircleLayer id='originInnerCircle' style={layerStyles.origin} />
            </MapboxGL.ShapeSource>

            {this.renderRoute()}
            {this.renderProgress()}

            <MapboxGL.ShapeSource id='destination' shape={MapboxGL.geoUtils.makePoint(SF_ZOO_COORDINATE)}>
              <MapboxGL.CircleLayer id='destinationInnerCircle' style={layerStyles.destination} />
            </MapboxGL.ShapeSource>
        </MapboxGL.MapView>

        {this.renderActions()}
      </Page>
    );
  }
}

export default DriveTheLine;
