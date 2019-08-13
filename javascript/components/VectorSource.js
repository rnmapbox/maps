import React from 'react';
import PropTypes from 'prop-types';
import {NativeModules, requireNativeComponent} from 'react-native';

import {
  cloneReactChildrenWithProps,
  viewPropTypes,
  isFunction,
  isAndroid,
} from '../utils';
import {getFilter} from '../utils/filterUtils';

import AbstractSource from './AbstractSource';
import NativeBridgeComponent from './NativeBridgeComponent';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLVectorSource';

/**
 * VectorSource is a map content source that supplies tiled vector data in Mapbox Vector Tile format to be shown on the map.
 * The location of and metadata about the tiles are defined either by an option dictionary or by an external file that conforms to the TileJSON specification.
 */
class VectorSource extends NativeBridgeComponent(AbstractSource) {
  static propTypes = {
    ...viewPropTypes,

    /**
     * A string that uniquely identifies the source.
     */
    id: PropTypes.string,

    /**
     * A URL to a TileJSON configuration file describing the source’s contents and other metadata.
     */
    url: PropTypes.string,

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

  constructor(props) {
    super(props, NATIVE_MODULE_NAME);
  }

  _setNativeRef(nativeRef) {
    this._nativeRef = nativeRef;
    super._runPendingNativeCommands(nativeRef);
  }

  /**
   * Returns all features that match the query parameters regardless of whether or not the feature is
   * currently rendered on the map. The domain of the query includes all currently-loaded vector tiles
   * and GeoJSON source tiles. This function does not check tiles outside of the visible viewport.
   *
   * @example
   * vectorSource.features(['id1', 'id2'])
   *
   * @param  {Array=} layerIDs - A set of strings that correspond to the names of layers defined in the current style. Only the features contained in these layers are included in the returned array.
   * @param  {Array=} filter - an optional filter statement to filter the returned Features.
   * @return {FeatureCollection}
   */
  async features(layerIDs = [], filter = []) {
    const res = await this._runNativeCommand('features', this._nativeRef, [
      layerIDs,
      getFilter(filter),
    ]);

    if (isAndroid()) {
      return JSON.parse(res.data);
    }

    return res.data;
  }

  render() {
    const props = {
      id: this.props.id,
      url: this.props.url,
      hitbox: this.props.hitbox,
      hasPressListener: isFunction(this.props.onPress),
      onMapboxVectorSourcePress: this.props.onPress,
      onPress: undefined,
      ref: nativeRef => this._setNativeRef(nativeRef),
      onAndroidCallback: isAndroid() ? this._onAndroidCallback : undefined,
    };
    return (
      <RCTMGLVectorSource ref="nativeSource" {...props}>
        {cloneReactChildrenWithProps(this.props.children, {
          sourceID: this.props.id,
        })}
      </RCTMGLVectorSource>
    );
  }
}

const RCTMGLVectorSource = requireNativeComponent(
  NATIVE_MODULE_NAME,
  VectorSource,
  {
    nativeOnly: {
      hasPressListener: true,
      onMapboxVectorSourcePress: true,
    },
  },
);

export default VectorSource;
