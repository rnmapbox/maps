import React from 'react';
import PropTypes from 'prop-types';
import {NativeModules, requireNativeComponent} from 'react-native';

import {cloneReactChildrenWithProps, viewPropTypes} from '../utils';

import AbstractSource from './AbstractSource';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLRasterSource';

const isTileTemplateUrl = url =>
  url &&
  (url.includes('{z}') || url.includes('{bbox-') || url.includes('{quadkey}'));

/**
 * RasterSource is a map content source that supplies raster image tiles to be shown on the map.
 * The location of and metadata about the tiles are defined either by an option dictionary
 * or by an external file that conforms to the TileJSON specification.
 */
class RasterSource extends AbstractSource {
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
     * Example: https://example.com/raster-tiles/{z}/{x}/{y}.png
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
     * Size of the map tiles.
     * Mapbox urls default to 256, all others default to 512.
     */
    tileSize: PropTypes.number,

    /**
     * Influences the y direction of the tile coordinates. (tms inverts y axis)
     */
    tms: PropTypes.bool,

    /**
     * An HTML or literal text string defining the buttons to be displayed in an action sheet when the
     * source is part of a map view’s style and the map view’s attribution button is pressed.
     */
    attribution: PropTypes.string,
  };

  static defaultProps = {
    id: MapboxGL.StyleSource.DefaultSourceID,
  };

  constructor(props) {
    super(props);
    if (isTileTemplateUrl(props.url)) {
      console.warn(
        `RasterSource 'url' property contains a Tile URL Template, but is intended for a StyleJSON URL. Please migrate your VectorSource to use: \`tileUrlTemplates=["${props.url}"]\` instead.`,
      );
    }
  }

  render() {
    let {url} = this.props;
    let {tileUrlTemplates} = this.props;

    // Swapping url for tileUrlTemplates to provide backward compatiblity
    // when RasterSource supported only tile url as url prop
    if (isTileTemplateUrl(url)) {
      tileUrlTemplates = [url];
      url = undefined;
    }

    const props = {
      ...this.props,
      id: this.props.id,
      url,
      tileUrlTemplates,
      minZoomLevel: this.props.minZoomLevel,
      maxZoomLevel: this.props.maxZoomLevel,
      tileSize: this.props.tileSize,
      tms: this.props.tms,
      attribution: this.props.attribution,
    };
    return (
      <RCTMGLRasterSource ref="nativeSource" {...props}>
        {cloneReactChildrenWithProps(this.props.children, {
          sourceID: this.props.id,
        })}
      </RCTMGLRasterSource>
    );
  }
}

const RCTMGLRasterSource = requireNativeComponent(
  NATIVE_MODULE_NAME,
  RasterSource,
);

export default RasterSource;
