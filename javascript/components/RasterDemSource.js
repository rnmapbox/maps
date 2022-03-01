import React from 'react';
import PropTypes from 'prop-types';
import {NativeModules, requireNativeComponent} from 'react-native';

import {cloneReactChildrenWithProps, viewPropTypes} from '../utils';

import AbstractSource from './AbstractSource';

const isTileTemplateUrl = url =>
  url &&
  (url.includes('{z}') || url.includes('{bbox-') || url.includes('{quadkey}'));

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLRasterDemSource';

class RasterDemSource extends AbstractSource {
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
  };

  static defaultProps = {
    id: MapboxGL.StyleSource.DefaultSourceID,
  };

  constructor(props) {
    super(props);
    if (isTileTemplateUrl(props.url)) {
      console.warn(
        `RasterDemSource 'url' property contains a Tile URL Template, but is intended for a StyleJSON URL. Please migrate your VectorSource to use: \`tileUrlTemplates=["${props.url}"]\` instead.`,
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
    };
    return (
      <RCTMGLRasterDemSource ref="nativeSource" {...props}>
        {cloneReactChildrenWithProps(this.props.children, {
          sourceID: this.props.id,
        })}
      </RCTMGLRasterDemSource>
    );
  }
}

const RCTMGLRasterDemSource = requireNativeComponent(
  NATIVE_MODULE_NAME,
  RasterDemSource,
);

export default RasterDemSource;
