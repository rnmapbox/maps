import React from 'react';
import { NativeModules } from 'react-native';

import RNMBXRasterDemSourceNativeComponent from '../specs/RNMBXRasterDemSourceNativeComponent';
import { cloneReactChildrenWithProps } from '../utils';

import AbstractSource from './AbstractSource';

const isTileTemplateUrl = (url?: string): url is string =>
  !!url &&
  (url.includes('{z}') || url.includes('{bbox-') || url.includes('{quadkey}'));

const MapboxGL = NativeModules.RNMBXModule;

type Props = {
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
   * Mapbox urls default to 256, all others default to 512.
   */
  tileSize?: number;

  children?: React.ReactElement | React.ReactElement[];
};

type NativeProps = Props;

class RasterDemSource extends AbstractSource<Props, NativeProps> {
  static defaultProps = {
    id: MapboxGL.StyleSource.DefaultSourceID,
  };

  constructor(props: Props) {
    super(props);
    if (isTileTemplateUrl(props.url)) {
      console.warn(
        `RasterDemSource 'url' property contains a Tile URL Template, but is intended for a StyleJSON URL. Please migrate your VectorSource to use: \`tileUrlTemplates=["${props.url}"]\` instead.`,
      );
    }
  }

  render() {
    let { url } = this.props;
    let { tileUrlTemplates } = this.props;

    // Swapping url for tileUrlTemplates to provide backward compatibility
    // when RasterSource supported only tile url as url prop
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
      <RNMBXRasterDemSourceNativeComponent ref={this.setNativeRef} {...props}>
        {cloneReactChildrenWithProps(this.props.children, {
          sourceID: this.props.id,
        })}
      </RNMBXRasterDemSourceNativeComponent>
    );
  }
}

export default RasterDemSource;
