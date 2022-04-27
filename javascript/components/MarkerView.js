import React from 'react';
import PropTypes from 'prop-types';
import { Platform, NativeModules, requireNativeComponent } from 'react-native';

import { toJSONString, viewPropTypes } from '../utils';
import { makePoint } from '../utils/geoUtils';

import PointAnnotation from './PointAnnotation';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLMarkerView';

/**
 * MarkerView allows you to place a interactive react native marker to the map.
 *
 * If you have static view consider using PointAnnotation or SymbolLayer they'll offer much better performance
 * .
 * This is based on [MakerView plugin](https://docs.mapbox.com/android/plugins/overview/markerview/) on Android
 * and PointAnnotation on iOS.
 */
class MarkerView extends React.PureComponent {
  static propTypes = {
    ...viewPropTypes,

    /**
     * The center point (specified as a map coordinate) of the marker.
     * See also #anchor.
     */
    coordinate: PropTypes.arrayOf(PropTypes.number).isRequired,

    /**
     * Specifies the anchor being set on a particular point of the annotation.
     * The anchor point is specified in the continuous space [0.0, 1.0] x [0.0, 1.0],
     * where (0, 0) is the top-left corner of the image, and (1, 1) is the bottom-right corner.
     * Note this is only for custom annotations not the default pin view.
     * Defaults to the center of the view.
     */
    anchor: PropTypes.shape({
      /**
       * `x` of anchor
       */
      x: PropTypes.number.isRequired,
      /**
       * `y` of anchor
       */
      y: PropTypes.number.isRequired,
    }),

    /**
     * Expects one child - can be container with multiple elements
     */
    children: PropTypes.element.isRequired,
  };

  static defaultProps = {
    anchor: { x: 0.5, y: 0.5 },
  };

  _getCoordinate() {
    if (!this.props.coordinate) {
      return undefined;
    }
    return toJSONString(makePoint(this.props.coordinate));
  }

  render() {
    if (Platform.OS === 'ios' && !MapboxGL.MapboxV10) {
      return <PointAnnotation {...this.props} />;
    }

    const props = {
      ...this.props,
      anchor: this.props.anchor,
      coordinate: this._getCoordinate(),
    };

    return (
      <RCTMGLMarkerView {...props}>{this.props.children}</RCTMGLMarkerView>
    );
  }
}

const RCTMGLMarkerView =
  Platform.OS === 'android'
    ? requireNativeComponent(NATIVE_MODULE_NAME, MarkerView, {})
    : MapboxGL.MapboxV10
    ? requireNativeComponent(NATIVE_MODULE_NAME, MarkerView, {})
    : undefined;

export default MarkerView;
