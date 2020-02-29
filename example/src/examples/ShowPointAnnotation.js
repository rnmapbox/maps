/* eslint-disable react/prop-types */
/* eslint-disable fp/no-mutating-methods */
import React from 'react';
import {Animated, View, Text, StyleSheet, Image} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../styles/sheet';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';
import Bubble from './common/Bubble';

const ANNOTATION_SIZE = 45;

const styles = StyleSheet.create({
  annotationContainer: {
    width: ANNOTATION_SIZE,
    height: ANNOTATION_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: ANNOTATION_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.45)',
    overflow: 'hidden',
  },
  annotationFill: {
    width: ANNOTATION_SIZE - 3,
    height: ANNOTATION_SIZE - 3,
    borderRadius: (ANNOTATION_SIZE - 3) / 2,
    backgroundColor: 'orange',
    transform: [{scale: 0.6}],
  },
});

class AnnotationWithRemoteImage extends React.Component {
  annotationRef = null;

  render() {
    const {id, coordinate, title} = this.props;
    return (
      <MapboxGL.PointAnnotation
        id={id}
        coordinate={coordinate}
        title={title}
        ref={ref => (this.annotationRef = ref)}>
        <View style={styles.annotationContainer}>
          <Image
            source={{uri: 'https://reactnative.dev/img/tiny_logo.png'}}
            style={{width: ANNOTATION_SIZE, height: ANNOTATION_SIZE}}
            onLoad={() => this.annotationRef.refresh()}
          />
        </View>
        <MapboxGL.Callout title="This is a sample" />
      </MapboxGL.PointAnnotation>
    );
  }
}

class ShowPointAnnotation extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this.state = {
      activeAnnotationIndex: -1,
      previousActiveAnnotationIndex: -1,

      backgroundColor: 'blue',
      coordinates: [[-73.99155, 40.73581]],
    };

    this._scaleIn = null;
    this._scaleOut = null;

    this.onPress = this.onPress.bind(this);
  }

  onPress(feature) {
    const coords = Object.assign([], this.state.coordinates);
    coords.push(feature.geometry.coordinates);
    this.setState({coordinates: coords});
  }

  onAnnotationSelected(activeIndex, feature) {
    if (this.state.activeIndex === activeIndex) {
      return;
    }

    this._scaleIn = new Animated.Value(0.6);
    Animated.timing(this._scaleIn, {toValue: 1.0, duration: 200}).start();
    this.setState({activeAnnotationIndex: activeIndex});

    if (this.state.previousActiveAnnotationIndex !== -1) {
      this._map.moveTo(feature.geometry.coordinates, 500);
    }
  }

  onAnnotationDeselected(deselectedIndex) {
    const nextState = {};

    if (this.state.activeAnnotationIndex === deselectedIndex) {
      nextState.activeAnnotationIndex = -1;
    }

    this._scaleOut = new Animated.Value(1);
    Animated.timing(this._scaleOut, {toValue: 0.6, duration: 200}).start();
    nextState.previousActiveAnnotationIndex = deselectedIndex;
    this.setState(nextState);
  }

  renderAnnotations() {
    const items = [];

    for (let i = 0; i < this.state.coordinates.length; i++) {
      const coordinate = this.state.coordinates[i];

      const title = `Lon: ${coordinate[0]} Lat: ${coordinate[1]}`;
      const id = `pointAnnotation${i}`;

      const animationStyle = {};
      if (i === this.state.activeAnnotationIndex) {
        animationStyle.transform = [{scale: this._scaleIn}];
      } else if (i === this.state.previousActiveAnnotationIndex) {
        animationStyle.transform = [{scale: this._scaleOut}];
      }

      if ((i % 2) === 1) {
        items.push(
          <AnnotationWithRemoteImage
            key={id}
            id={id}
            coordinate={coordinate}
            title={title} />
        );

      } else {
        items.push(
          <MapboxGL.PointAnnotation
            key={id}
            id={id}
            coordinate={coordinate}
            title={title}>
            <View style={styles.annotationContainer} />
            <MapboxGL.Callout title="This is a sample with image" />
          </MapboxGL.PointAnnotation>,
        );
      }
    }

    return items;
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

          {this.renderAnnotations()}
        </MapboxGL.MapView>

        <Bubble>
          <Text>Click to add a point annotation</Text>
        </Bubble>
      </Page>
    );
  }
}

export default ShowPointAnnotation;
