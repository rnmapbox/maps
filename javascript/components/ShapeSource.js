import React from 'react';
import PropTypes from 'prop-types';
import {NativeModules, requireNativeComponent} from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

import {
  toJSONString,
  cloneReactChildrenWithProps,
  viewPropTypes,
  isFunction,
} from '../utils';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLShapeSource';

/**
 * ShapeSource is a map content source that supplies vector shapes to be shown on the map.
 * The shape may be a url or a GeoJSON object
 */
class ShapeSource extends React.Component {
  static NATIVE_ASSETS_KEY = 'assets';

  static propTypes = {
    ...viewPropTypes,

    /**
     * A string that uniquely identifies the source.
     */
    id: PropTypes.string,

    /**
     * An HTTP(S) URL, absolute file URL, or local file URL relative to the current application’s resource bundle.
     */
    url: PropTypes.string,

    /**
     * The contents of the source. A shape can represent a GeoJSON geometry, a feature, or a feature colllection.
     */
    shape: PropTypes.object,

    /**
     * Enables clustering on the source for point shapes.
     */
    cluster: PropTypes.bool,

    /**
     * Specifies the radius of each cluster if clustering is enabled.
     * A value of 512 produces a radius equal to the width of a tile.
     * The default value is 50.
     */
    clusterRadius: PropTypes.number,

    /**
     * Specifies the maximum zoom level at which to cluster points if clustering is enabled.
     * Defaults to one zoom level less than the value of maxZoomLevel so that, at the maximum zoom level,
     * the shapes are not clustered.
     */
    clusterMaxZoomLevel: PropTypes.number,

    /**
     * Specifies the maximum zoom level at which to create vector tiles.
     * A greater value produces greater detail at high zoom levels.
     * The default value is 18.
     */
    maxZoomLevel: PropTypes.number,

    /**
     * Specifies the size of the tile buffer on each side.
     * A value of 0 produces no buffer. A value of 512 produces a buffer as wide as the tile itself.
     * Larger values produce fewer rendering artifacts near tile edges and slower performance.
     * The default value is 128.
     */
    buffer: PropTypes.number,

    /**
     * Specifies the Douglas-Peucker simplification tolerance.
     * A greater value produces simpler geometries and improves performance.
     * The default value is 0.375.
     */
    tolerance: PropTypes.number,

    /**
     * Specifies the external images in key-value pairs required for the shape source.
     * If you have an asset under Image.xcassets on iOS and the drawables directory on android
     * you can specify an array of string names with assets as the key `{ assets: ['pin'] }`.
     */
    images: PropTypes.object,

    /**
     * Source press listener, gets called when a user presses one of the children layers only
     * if that layer has a higher z-index than another source layers
     */
    onPress: PropTypes.func,

    /**
     * Overrides the default touch hitbox(44x44 pixels) for the source layers
     */
    hitbox: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }),
  };

  static defaultProps = {
    id: MapboxGL.StyleSource.DefaultSourceID,
  };

  _getShape() {
    if (!this.props.shape) {
      return;
    }
    return toJSONString(this.props.shape);
  }

  _getImages() {
    if (!this.props.images) {
      return;
    }

    const images = {};
    let nativeImages = [];

    const imageNames = Object.keys(this.props.images);
    for (const imageName of imageNames) {
      if (
        imageName === ShapeSource.NATIVE_ASSETS_KEY &&
        Array.isArray(this.props.images[ShapeSource.NATIVE_ASSETS_KEY])
      ) {
        nativeImages = this.props.images[ShapeSource.NATIVE_ASSETS_KEY];
        continue;
      }

      const res = resolveAssetSource(this.props.images[imageName]);
      if (res && res.uri) {
        images[imageName] = res.uri;
      }
    }

    return {
      images,
      nativeImages,
    };
  }

  render() {
    const props = {
      id: this.props.id,
      url: this.props.url,
      shape: this._getShape(),
      hitbox: this.props.hitbox,
      hasPressListener: isFunction(this.props.onPress),
      onMapboxShapeSourcePress: this.props.onPress,
      cluster: this.props.cluster ? 1 : 0,
      clusterRadius: this.props.clusterRadius,
      clusterMaxZoomLevel: this.props.clusterMaxZoomLevel,
      maxZoomLevel: this.props.maxZoomLevel,
      buffer: this.props.buffer,
      tolerance: this.props.tolerance,
      ...this._getImages(),
      onPress: undefined,
    };
    return (
      <RCTMGLShapeSource {...props}>
        {cloneReactChildrenWithProps(this.props.children, {
          sourceID: this.props.id,
        })}
      </RCTMGLShapeSource>
    );
  }
}

const RCTMGLShapeSource = requireNativeComponent(
  NATIVE_MODULE_NAME,
  ShapeSource,
  {
    nativeOnly: {
      nativeImages: true,
      hasPressListener: true,
      onMapboxShapeSourcePress: true,
    },
  },
);

export default ShapeSource;
