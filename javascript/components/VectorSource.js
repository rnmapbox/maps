import React from 'react';
import PropTypes from 'prop-types';
import { NativeModules, requireNativeComponent } from 'react-native';

import {
  cloneReactChildrenWithProps,
  viewPropTypes,
  isFunction,
  isAndroid,
} from '../utils';
import { getFilter } from '../utils/filterUtils';
import { copyPropertiesAsDeprecated } from '../utils/deprecation';

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
    id: PropTypes.string.isRequired,

    /**
     * A URL to a TileJSON configuration file describing the source’s contents and other metadata.
     */
    url: PropTypes.string,

    /**
     * An array of tile URL templates. If multiple endpoints are specified, clients may use any combination of endpoints.
     * Example: https://example.com/vector-tiles/{z}/{x}/{y}.pbf
     */
    tileUrlTemplates: PropTypes.arrayOf(PropTypes.string),

    /**
     * An unsigned integer that specifies the minimum zoom level at which to display tiles from the source.
     * The value should be between 0 and 22, inclusive, and less than
     * maxZoomLevel, if specified. The default value for this option is 0.
     */
    minZoomLevel: PropTypes.number,

    /**
     * An unsigned integer that specifies the maximum zoom level at which to display tiles from the source.
     * The value should be between 0 and 22, inclusive, and less than
     * minZoomLevel, if specified. The default value for this option is 22.
     */
    maxZoomLevel: PropTypes.number,

    /**
     * Influences the y direction of the tile coordinates. (tms inverts y axis)
     */
    tms: PropTypes.bool,

    /**
     * An HTML or literal text string defining the buttons to be displayed in an action sheet when the
     * source is part of a map view’s style and the map view’s attribution button is pressed.
     */
    attribution: PropTypes.string,

    /**
     * Source press listener, gets called when a user presses one of the children layers only
     * if that layer has a higher z-index than another source layers
     *
     * @param {Object} event
     * @param {Object[]} event.features - the geojson features that have hit by the press (might be multiple)
     * @param {Object} event.coordinates - the coordinates of the click
     * @param {Object} event.point - the point of the click
     */
    onPress: PropTypes.func,

    /**
     * Overrides the default touch hitbox(44x44 pixels) for the source layers
     */
    hitbox: PropTypes.shape({
      /**
       * `width` of hitbox
       */
      width: PropTypes.number.isRequired,
      /**
       * `height` of hitbox
       */
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

  onPress(event) {
    const {
      nativeEvent: {
        payload: { features, coordinates, point },
      },
    } = event;
    let newEvent = {
      features,
      coordinates,
      point,
    };
    newEvent = copyPropertiesAsDeprecated(
      event,
      newEvent,
      (key) => {
        console.warn(
          `event.${key} is deprecated on VectorSource#onPress, please use event.features`,
        );
      },
      {
        nativeEvent: (origNativeEvent) => ({
          ...origNativeEvent,
          payload: features[0],
        }),
      },
    );
    this.props.onPress(newEvent);
  }

  render() {
    const props = {
      id: this.props.id,
      url: this.props.url,
      tileUrlTemplates: this.props.tileUrlTemplates,
      minZoomLevel: this.props.minZoomLevel,
      maxZoomLevel: this.props.maxZoomLevel,
      tms: this.props.tms,
      attribution: this.props.attribution,
      hitbox: this.props.hitbox,
      hasPressListener: isFunction(this.props.onPress),
      onMapboxVectorSourcePress: this.onPress.bind(this),
      onPress: undefined,
      ref: (nativeRef) => this._setNativeRef(nativeRef),
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
