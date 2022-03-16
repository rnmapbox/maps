import React from 'react';
import {Easing, Button} from 'react-native';
import {Animated, MapView, Camera} from '@rnmapbox/maps';
import along from '@turf/along';
import length from '@turf/length';
import {point, lineString} from '@turf/helpers';

import sheet from '../../styles/sheet';
import BaseExamplePropTypes from '../common/BaseExamplePropTypes';
import Page from '../common/Page';
import Bubble from '../common/Bubble';

const blon = -73.99155;
const blat = 40.73481;
const bdelta = 0.0005;

const lon = -73.99255;
const lat = 40.73581;
const delta = 0.001;
const steps = 300;

const styles = {
  lineLayerOne: {
    lineCap: 'round',
    lineWidth: 6,
    lineOpacity: 0.84,
    lineColor: '#514ccd',
  },
  circleLayer: {
    circleOpacity: 0.8,
    circleColor: '#c62221',
    circleRadius: 20,
  },
  lineLayerTwo: {
    lineCap: 'round',
    lineWidth: 6,
    lineOpacity: 0.84,
    lineColor: '#314ccd',
  },
};

class AnimatedLine extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    const route = new Animated.RouteCoordinatesArray([
      [blon, blat],
      [blon, blat + 2 * bdelta],
      [blon + bdelta, blat + 2 * bdelta + bdelta],
      [blon + bdelta + 2 * bdelta, blat + 2 * bdelta + bdelta + bdelta],
    ]);

    this.state = {
      backgroundColor: 'blue',
      coordinates: [[-73.99155, 40.73581]],

      shape: new Animated.CoordinatesArray(
        [...Array(steps).keys()].map((v, i) => [
          lon + delta * (i / steps) * (i / steps),
          lat + (delta * i) / steps,
        ]),
      ),
      targetPoint: {
        type: 'FeatureCollection',
        features: [],
      },
      route,
      actPoint: new Animated.ExtractCoordinateFromArray(route, -1),
    };
  }

  startAnimate() {
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

  startAnimateFewPointsWithAbort() {
    const time = 3000;

    setTimeout(() => {
      this.state.shape
        .timing({
          toValue: [
            [lon + delta, lat],
            [lon, lat],
            [lon, lat + delta],
          ],
          duration: time,
          easing: Easing.linear,
        })
        .start();
    }, 2000);

    setTimeout(() => {
      this.state.shape
        .timing({
          toValue: [
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
          toValue: [
            [lon, lat],
            [lon, lat + delta],
          ],
          duration: time,
          easing: Easing.linear,
        })
        .start();
    }, 6000);
  }

  startAnimateMorphingRoute() {
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
          toValue: [
            [lon, lat],
            [lon, lat + 1 * delta],
          ],
          duration: time,
          easing: Easing.linear,
        })
        .start();
    }, time);
  }

  startAnimateRoute() {
    const vec = this.state.route.__getValue();
    const ls = {
      type: 'LineString',
      coordinates: vec,
    };
    const len = length(ls, {units: 'meters'});
    let dest = len - 89.0;
    let pt;
    if (len === 0.0) {
      const {originalRoute} = this.state.route;
      dest = length(lineString(originalRoute), {units: 'meters'});
      pt = point(originalRoute[originalRoute.length - 1]);
    } else {
      if (dest < 0) {
        dest = 0;
      }
      pt = along(ls, dest, {units: 'meters'});
    }
    this.state.route
      .timing({
        toValue: {end: {point: pt}},
        duration: 2000,
        easing: Easing.linear,
      })
      .start();
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
            id={'route'}
            shape={
              new Animated.Shape({
                type: 'LineString',
                coordinates: this.state.route,
              })
            }>
            <Animated.LineLayer id={'lineroute'} style={styles.lineLayerOne} />
          </Animated.ShapeSource>

          <Animated.ShapeSource
            id="currentLocationSource"
            shape={
              new Animated.Shape({
                type: 'Point',
                coordinates: this.state.actPoint,
              })
            }>
            <Animated.CircleLayer
              id="currentLocationCircle"
              style={styles.circleLayer}
            />
          </Animated.ShapeSource>

          <Animated.ShapeSource
            id={'shape'}
            shape={
              new Animated.Shape({
                type: 'LineString',
                coordinates: this.state.shape,
              })
            }>
            <Animated.LineLayer id={'line'} style={styles.lineLayerTwo} />
          </Animated.ShapeSource>
        </MapView>

        <Bubble>
          <Button
            title="Animate a lot of points"
            onPress={() => this.startAnimate()}
          />
          <Button
            title="Animate a few points with abort"
            onPress={() => this.startAnimateFewPointsWithAbort()}
          />
          <Button
            title="Animate route/morphing"
            onPress={() => this.startAnimateMorphingRoute()}
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
