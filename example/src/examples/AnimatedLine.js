import React from 'react';
import {Easing, Button} from 'react-native';
import {
  Animated,
  MapView,
  Camera,
  LineJoin,
} from '@react-native-mapbox-gl/maps';

import sheet from '../styles/sheet';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';
import Bubble from './common/Bubble';

const lon = -73.99255;
const lat = 40.73581;
const delta = 0.001;
const steps = 300;

class AnimatedLine extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this.state = {
      backgroundColor: 'blue',
      coordinates: [[-73.99155, 40.73581]],

      shape: new Animated.CoordinatesArray(
        [...Array(steps).keys()].map((v, i) => [
          lon + delta * (i / steps) * (i / steps),
          lat + (delta * i) / steps,
        ]),
      ),
    };
  }

  startAnimate2() {
    setTimeout(() => {
      this.state.shape
        .timing({
          toValue: [...Array(steps).keys()].map((v, i) => [
            lon - (delta * i) / steps,
            lat + (2.0 * (delta * i)) / steps,
          ]),
          duration: 1000,
          easing: Easing.linear,
        })
        .start();
    }, 2000);
    setTimeout(() => {
      this.state.shape
        .timing({
          toValue: [...Array(steps).keys()].map((v, i) => [
            lon + (delta * i) / steps,
            lat + delta * (i / steps) * (i / steps),
          ]),
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
          toValue: [[lon + delta, lat], [lon, lat], [lon, lat + delta]],
          duration: time,
          easing: Easing.linear,
        })
        .start();
    }, 2000);

    setTimeout(() => {
      this.state.shape
        .timing({
          toValue: [[lon + delta, lat], [lon, lat], [lon + delta, lat + delta]],
          duration: time,
          easing: Easing.linear,
        })
        .start();
    }, 4000);

    setTimeout(() => {
      this.state.shape
        .timing({
          toValue: [[lon, lat], [lon, lat + delta]],
          duration: time,
          easing: Easing.linear,
        })
        .start();
    }, 6000);
  }

  startAnimateRoute() {
    const time = 3000;

    setTimeout(() => {
      this.state.shape
        .timing({
          toValue: [
            [lon, lat],
            [lon, lat + 2 * delta],
            [lon + delta, lat + 2 * delta + delta],
            [lon + delta + 2 * delta, lat + 2 * delta + delta + delta],
          ],
          duration: time,
          easing: Easing.linear,
        })
        .start();
    }, 0);

    setTimeout(() => {
      this.state.shape
        .timing({
          toValue: [[lon, lat], [lon, lat + 1 * delta]],
          duration: time,
          easing: Easing.linear,
        })
        .start();
    }, time);
  }

  render() {
    return (
      <Page {...this.props}>
        <MapView
          ref={c => (this._map = c)}
          onPress={this.onPress}
          onDidFinishLoadingMap={this.onDidFinishLoadingMap}
          style={sheet.matchParent}>
          <Camera zoomLevel={16} centerCoordinate={this.state.coordinates[0]} />

          <Animated.ShapeSource
            id={'shape'}
            shape={
              new Animated.Shape({
                type: 'LineString',
                coordinates: this.state.shape,
              })
            }>
            <Animated.LineLayer
              id={'line'}
              style={{
                lineCap: LineJoin.Round,
                lineWidth: 6,
                lineOpacity: 0.84,
                lineColor: '#314ccd',
              }}
            />
          </Animated.ShapeSource>
        </MapView>

        <Bubble>
          <Button
            title="Animate a lot of points"
            onPress={() => this.startAnimate2()}
          />
          <Button
            title="Animate a few points with abort"
            onPress={() => this.startAnimate3()}
          />
          <Button
            title="Animate route"
            onPress={() => this.startAnimateRoute()}
          />
        </Bubble>
      </Page>
    );
  }
}

export default AnimatedLine;
