import React from 'react';
import {
  Platform,
  NativeModules,
  requireNativeComponent,
  HostComponent,
} from 'react-native';

import { toJSONString } from '../utils';
import { makePoint } from '../utils/geoUtils';

import PointAnnotation from './PointAnnotation';

const Mapbox = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLMarkerView';

/**
 * MarkerView allows you to place a interactive react native marker to the map.
 *
 * If you have static view consider using PointAnnotation or SymbolLayer they'll offer much better performance
 * .
 * This is based on [MakerView plugin](https://docs.mapbox.com/android/plugins/overview/markerview/) on Android
 * and PointAnnotation on iOS.
 */
class MarkerView extends React.PureComponent<{
  /**
   * The center point (specified as a map coordinate) of the marker.
   * See also #anchor.
   */
  coordinate: [number, number];

  /**
   * Specifies the anchor being set on a particular point of the annotation.
   * The anchor point is specified in the continuous space [0.0, 1.0] x [0.0, 1.0],
   * where (0, 0) is the top-left corner of the image, and (1, 1) is the bottom-right corner.
   * Note this is only for custom annotations not the default pin view.
   * Defaults to the center of the view.
   */
  anchor: {
    /**
     * `x` of anchor
     */
    x: number;
    /**
     * `y` of anchor
     */
    y: number;
  };

  /**
   * Expects one child - can be container with multiple elements
   */
  children: React.ComponentType;
}> {
  static defaultProps = {
    anchor: { x: 0.5, y: 0.5 },
  };

  render() {
    const { props } = this;
    if (Platform.OS === 'ios' && !MapboxGL.MapboxV10) {
      return <PointAnnotation {...props} />;
    }

    function _getCoordinate(coordinate: [number, number]): string | undefined {
      if (!coordinate) {
        return undefined;
      }
      return toJSONString(makePoint(coordinate));
    }

    const { anchor = { x: 0.5, y: 0.5 } } = props;
    const { children } = props;

    const actProps = {
      anchor,
      coordinate: _getCoordinate(props.coordinate),
    };

    const wrapChildern =
      RCTMGLMarkerViewWrapper === undefined
        ? (child: React.ComponentType) => child
        : (child: React.ComponentType) => (
            <RCTMGLMarkerViewWrapper>{child}</RCTMGLMarkerViewWrapper>
          );

    if (RCTMGLMarkerView === undefined) {
      throw new Error(
        'internal error RCTMGLMarkerView should not be null on v10 or non ios',
      );
    }
    return (
      <RCTMGLMarkerView {...actProps}>
        {wrapChildern(children)}
      </RCTMGLMarkerView>
    );
  }
}

const RCTMGLMarkerView:
  | HostComponent<{
      anchor: { x: number; y: number };
      coordinate: string | undefined;
    }>
  | undefined =
  Platform.OS === 'android'
    ? requireNativeComponent(NATIVE_MODULE_NAME)
    : Mapbox.MapboxV10
    ? requireNativeComponent(NATIVE_MODULE_NAME)
    : undefined;

const RCTMGLMarkerViewWrapper: HostComponent<unknown> | undefined =
  Mapbox.MapboxV10
    ? requireNativeComponent('RCTMGLMarkerViewWrapper')
    : undefined;

export default MarkerView;
