import React from 'react';
import { NativeModules, NativeSyntheticEvent } from 'react-native';

import RNMBXVectorSourceNativeComponent from '../specs/RNMBXVectorSourceNativeComponent';
import { cloneReactChildrenWithProps, isFunction } from '../utils';
import { copyPropertiesAsDeprecated } from '../utils/deprecation';
import { OnPressEvent } from '../types/OnPressEvent';

import AbstractSource from './AbstractSource';

const MapboxGL = NativeModules.RNMBXModule;

export const NATIVE_MODULE_NAME = 'RNMBXVectorSource';

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
   * An unsigned integer that specifies the maximum zoom level at which to display tiles from the source.
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
class VectorSource extends AbstractSource<Props, NativeProps> {
  static defaultProps = {
    id: MapboxGL.StyleSource.DefaultSourceID,
  };

  constructor(props: Props) {
    super(props);
  }

  _decodePayload(payload: OnPressEvent | string): OnPressEvent {
    // we check whether the payload is a string, since the strict type safety is enforced only on iOS on the new arch
    // on Android, on both archs, the payload is an object
    if (typeof payload === 'string') {
      return JSON.parse(payload);
    } else {
      return payload;
    }
  }

  onPress(
    event: NativeSyntheticEvent<{
      payload: OnPressEvent | string;
    }>,
  ) {
    const payload = this._decodePayload(event.nativeEvent.payload);
    const { features, coordinates, point } = payload;
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
    };
    return (
      // @ts-expect-error just codegen stuff
      <RNMBXVectorSourceNativeComponent ref={this.setNativeRef} {...props}>
        {cloneReactChildrenWithProps(this.props.children, {
          sourceID: this.props.id,
        })}
      </RNMBXVectorSourceNativeComponent>
    );
  }
}

export default VectorSource;
