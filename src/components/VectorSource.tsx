import React from 'react';
import {
  NativeMethods,
  NativeModules,
  NativeSyntheticEvent,
  requireNativeComponent,
} from 'react-native';

import { cloneReactChildrenWithProps, isFunction, isAndroid } from '../utils';
import { getFilter } from '../utils/filterUtils';
import { copyPropertiesAsDeprecated } from '../utils/deprecation';
import { OnPressEvent } from '../types/OnPressEvent';

import AbstractSource from './AbstractSource';
import NativeBridgeComponent from './NativeBridgeComponent';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLVectorSource';

interface Props {
  /**
   * A string that uniquely identifies the source.
   */
  id: string;

  /**
   * The id refers to en existing source in the style. Does not create a new source.
   */
  existing?: boolean;

  /**
   * A URL to a TileJSON configuration file describing the source’s contents and other metadata.
   */
  url?: string;

  /**
   * An array of tile URL templates. If multiple endpoints are specified, clients may use any combination of endpoints.
   * Example: https://example.com/vector-tiles/{z}/{x}/{y}.pbf
   */
  tileUrlTemplates?: string[];

  /**
   * An unsigned integer that specifies the minimum zoom level at which to display tiles from the source.
   * The value should be between 0 and 22, inclusive, and less than
   * maxZoomLevel, if specified. The default value for this option is 0.
   */
  minZoomLevel?: number;

  /**
   *
   * An unsigned integer that specifies the maximum zoom level for which tiles
   * are available, as in the TileJSON spec. Data from tiles at the maxzoom are
   * used when displaying the map at higher zoom levels.
   *
   * The value should be between 0 and 22, inclusive, and less than
   * minZoomLevel, if specified. The default value for this option is 22.
   */
  maxZoomLevel?: number;

  /**
   * Influences the y direction of the tile coordinates. (tms inverts y axis)
   */
  tms?: boolean;

  /**
   * An HTML or literal text string defining the buttons to be displayed in an action sheet when the
   * source is part of a map view’s style and the map view’s attribution button is pressed.
   */
  attribution?: string;

  /**
   * Source press listener, gets called when a user presses one of the children layers only
   * if that layer has a higher z-index than another source layers
   *
   * @param {Object} event
   * @param {Object[]} event.features - the geojson features that have hit by the press (might be multiple)
   * @param {Object} event.coordinates - the coordinates of the click
   * @param {Object} event.point - the point of the click
   */
  onPress?: (event: OnPressEvent) => void;

  /**
   * Overrides the default touch hitbox(44x44 pixels) for the source layers
   */
  hitbox?: {
    /**
     * `width` of hitbox
     */
    width: number;
    /**
     * `height` of hitbox
     */
    height: number;
  };

  children?: React.ReactElement | React.ReactElement[];
}

//interface NativeProps extends Omit<Props, 'children'> {}
type NativeProps = Props; // Omit<Props, 'children'>;
/**
 * VectorSource is a map content source that supplies tiled vector data in Mapbox Vector Tile format to be shown on the map.
 * The location of and metadata about the tiles are defined either by an option dictionary or by an external file that conforms to the TileJSON specification.
 */
class VectorSource extends NativeBridgeComponent(
  AbstractSource<Props, NativeProps>,
  NATIVE_MODULE_NAME,
) {
  static defaultProps = {
    id: MapboxGL.StyleSource.DefaultSourceID,
  };

  constructor(props: Props) {
    super(props);
  }

  _setNativeRef(
    nativeRef: (React.Component<NativeProps> & Readonly<NativeMethods>) | null,
  ) {
    if (nativeRef) {
      this.setNativeRef(nativeRef);
      // this._nativeRef = nativeRef;
      super._runPendingNativeCommands(nativeRef);
    }
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
    const res: { data: string } = await this._runNativeCommand(
      'features',
      this._nativeRef,
      [layerIDs, getFilter(filter)],
    );

    if (isAndroid()) {
      return JSON.parse(res.data);
    }

    return res.data;
  }

  onPress(
    event: NativeSyntheticEvent<{
      payload: OnPressEvent;
    }>,
  ) {
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
        nativeEvent: (origNativeEvent: unknown) => ({
          ...(origNativeEvent as OnPressEvent),
          payload: features[0],
        }),
      },
    );
    const { onPress } = this.props;
    if (onPress) {
      onPress(newEvent);
    }
  }

  render() {
    const props = {
      id: this.props.id,
      existing: this.props.existing,
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
      onAndroidCallback: isAndroid() ? this._onAndroidCallback : undefined,
    };
    return (
      <RCTMGLVectorSource ref={(r) => this._setNativeRef(r)} {...props}>
        {cloneReactChildrenWithProps(this.props.children, {
          sourceID: this.props.id,
        })}
      </RCTMGLVectorSource>
    );
  }
}

const RCTMGLVectorSource =
  requireNativeComponent<NativeProps>(NATIVE_MODULE_NAME);

export default VectorSource;
