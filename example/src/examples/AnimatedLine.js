import React from 'react';
import {StyleSheet, Easing, Button} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../styles/sheet';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';
import Bubble from './common/Bubble';

const lon = -73.99255;
const lat = 40.73581;
const delta = 0.001;

class AnimatedLine extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this.state = {
      backgroundColor: 'blue',
      coordinates: [[-73.99155, 40.73581]],

      shape: new MapboxGL.AnimatedLineString({
        coordinates: [[lon + delta, lat], [lon, lat], [lon, lat + delta]], //  [[lon, lat], [lon + delta, lat + delta]], ///
      }),
    };
  }

  startAnimate2() {
    setTimeout(() => {
      this.state.shape
        .timing({
          coordinates: [[lon, lat], [lon, lat + delta]],
          duration: 1000,
          easing: Easing.linear,
        })
        .start();
    }, 2000);
    setTimeout(() => {
      this.state.shape
        .timing({
          coordinates: [
            [lon + delta, lat + delta],
            [lon + delta, lat + delta + delta],
          ],
          duration: 1000,
          easing: Easing.linear,
        })
        .start();
    }, 4000);
  }

  startAnimate3() {
    const time = 3000;

    setTimeout(() => {
      this.state.shape
        .timing({
          coordinates: [[lon + delta, lat], [lon, lat], [lon, lat + delta]],
          duration: time,
          easing: Easing.linear,
        })
        .start();
    }, 2000);

    setTimeout(() => {
      this.state.shape
        .timing({
          coordinates: [
            [lon + delta, lat],
            [lon, lat],
            [lon + delta, lat + delta],
          ],
          duration: time,
          easing: Easing.linear,
        })
        .start();
    }, 4000);

    setTimeout(() => {
      this.state.shape
        .timing({
          coordinates: [[lon, lat], [lon, lat + delta]],
          duration: time,
          easing: Easing.linear,
        })
        .start();
    }, 6000);
  }

  render() {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
          ref={c => (this._map = c)}
          onPress={this.onPress}
          onDidFinishLoadingMap={this.onDidFinishLoadingMap}
          style={sheet.matchParent}>
          <MapboxGL.Camera
            zoomLevel={16}
            centerCoordinate={this.state.coordinates[0]}
          />

          <MapboxGL.Animated.ShapeSource id={'shape'} shape={this.state.shape}>
            <MapboxGL.Animated.LineLayer
              id={'line'}
              style={{
                lineCap: MapboxGL.LineJoin.Round,
                lineWidth: 6,
                lineOpacity: 0.84,
                lineColor: '#314ccd',
              }}
            />
          </MapboxGL.Animated.ShapeSource>
        </MapboxGL.MapView>

        <Bubble>
          <Button title="Animate 2" onPress={() => this.startAnimate2()} />
          <Button title="Animate 3" onPress={() => this.startAnimate3()} />
        </Bubble>
      </Page>
    );
  }
}

export default AnimatedLine;
