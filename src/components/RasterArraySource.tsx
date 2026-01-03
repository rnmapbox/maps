import React from 'react';
import { NativeModules } from 'react-native';

import { cloneReactChildrenWithProps } from '../utils';
import { BaseProps } from '../types/BaseProps';
import RNMBXRasterArraySourceNativeComponent from '../specs/RNMBXRasterArraySourceNativeComponent';

import AbstractSource from './AbstractSource';

const Mapbox = NativeModules.RNMBXModule;

const isTileTemplateUrl = (url?: string): url is string =>
  !!url &&
  (url.includes('{z}') || url.includes('{bbox-') || url.includes('{quadkey}'));

type Props = BaseProps & {
  /**
   * A string that uniquely identifies the source.
   */
  id: string;

  /**
   * The id refers to an existing source in the style. Does not create a new source.
   */
  existing?: boolean;

  /**
   * A URL to a TileJSON configuration file describing the source's contents and other metadata.
   */
  url?: string;

  /**
   * An array of tile URL templates. If multiple endpoints are specified, clients may use any combination of endpoints.
   * Example: https://example.com/raster-tiles/{z}/{x}/{y}.png
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
   * Size of the map tiles.
   * Defaults to 512.
   *
   * @platform android
   * Note: This property is not supported on iOS due to SDK limitations.
   * On iOS, tileSize will be derived from the TileJSON when using url, or use the default value.
   * If you need custom tile size on iOS, include it in your TileJSON response.
   */
  tileSize?: number;

  children?: React.ReactElement | React.ReactElement[];

  /**
   * An array containing the longitude and latitude of the southwest and northeast corners of
   * the source's bounding box in the following order: `[sw.lng, sw.lat, ne.lng, ne.lat]`.
   * When this property is included in a source, no tiles outside of the given bounds are requested by Mapbox GL.
   *
   * @platform android
   * Note: This property is not supported on iOS due to SDK limitations.
   * On iOS, bounds will be derived from the TileJSON when using url.
   * If you need custom bounds on iOS, include them in your TileJSON response.
   */
  sourceBounds?: number[];
};

type NativeProps = Props;

/**
 * RasterArraySource is a map content source that supplies raster array image tiles to be shown on the map.
 * This is typically used for particle animations like wind or precipitation patterns.
 * The location of and metadata about the tiles are defined either by an option dictionary
 * or by an external file that conforms to the TileJSON specification.
 *
 * @experimental This component requires Mapbox Maps SDK v11.4.0 or later
 */
class RasterArraySource extends AbstractSource<Props, NativeProps> {
  static defaultProps: Props = {
    id: Mapbox.StyleSource.DefaultSourceID,
  };

  constructor(props: Props) {
    super(props);
    if (isTileTemplateUrl(props.url)) {
      console.warn(
        `RasterArraySource 'url' property contains a Tile URL Template, but is intended for a StyleJSON URL. Please migrate your RasterArraySource to use: \`tileUrlTemplates=["${props.url}"]\` instead.`,
      );
    }
  }

  render() {
    let { url } = this.props;
    let { tileUrlTemplates } = this.props;

    // Swapping url for tileUrlTemplates to provide backward compatibility
    // when RasterArraySource supported only tile url as url prop
    if (isTileTemplateUrl(url)) {
      tileUrlTemplates = [url];
      url = undefined;
    }

    const props = {
      ...this.props,
      id: this.props.id,
      existing: this.props.existing,
      url,
      tileUrlTemplates,
      minZoomLevel: this.props.minZoomLevel,
      maxZoomLevel: this.props.maxZoomLevel,
      tileSize: this.props.tileSize,
    };
    return (
      // @ts-expect-error just codegen stuff
      <RNMBXRasterArraySourceNativeComponent ref={this.setNativeRef} {...props}>
        {cloneReactChildrenWithProps(this.props.children, {
          sourceID: this.props.id,
        })}
      </RNMBXRasterArraySourceNativeComponent>
    );
  }
}

export default RasterArraySource;
