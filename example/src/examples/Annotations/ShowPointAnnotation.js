import React from 'react';
import {Animated, View, Text, StyleSheet, Image} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import PropTypes from 'prop-types';

import sheet from '../../styles/sheet';
import BaseExamplePropTypes from '../common/BaseExamplePropTypes';
import Page from '../common/Page';
import Bubble from '../common/Bubble';

const ANNOTATION_SIZE = 45;

const styles = StyleSheet.create({
  annotationContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: ANNOTATION_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    height: ANNOTATION_SIZE,
    justifyContent: 'center',
    overflow: 'hidden',
    width: ANNOTATION_SIZE,
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
        draggable
        onDrag={e =>
          console.log('onDrag:', e.properties.id, e.geometry.coordinates)
        }
        onDragStart={e =>
          console.log('onDragStart:', e.properties.id, e.geometry.coordinates)
        }
        onDragEnd={e =>
          console.log('onDragEnd:', e.properties.id, e.geometry.coordinates)
        }
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
AnnotationWithRemoteImage.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  coordinate: PropTypes.arrayOf(PropTypes.number),
};

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

      if (i % 2 === 1) {
        items.push(
          <AnnotationWithRemoteImage
            key={id}
            id={id}
            coordinate={coordinate}
            title={title}
          />,
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
