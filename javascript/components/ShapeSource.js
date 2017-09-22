import React from 'react';
import PropTypes from 'prop-types';
import { NativeModules, requireNativeComponent } from 'react-native';
import { toJSONString, cloneReactChildrenWithProps } from '../utils';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLShapeSource';

const RCTMGLShapeSource = requireNativeComponent(NATIVE_MODULE_NAME, ShapeSource);

/**
 * ShapeSource is a map content source that supplies vector shapes to be shown on the map.
 * The shape may be a url or a GeoJSON object
 */
class ShapeSource extends React.Component {
  static propTypes = {
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
  };

  static defaultProps = {
    id: MapboxGL.StyleSource.DefaultSourceID,
  };

  _getShape() {
    if (!this.props.shape) {
      return;
    }
    // TODO: Add turf validation and throw exeception
    return toJSONString(this.props.shape);
  }

  render () {
    const props = {
      id: this.props.id,
      url: this.props.url,
      shape: this._getShape(),
      cluster: this.props.cluster ? 1 : 0,
      clusterRadius: this.props.clusterRadius,
      clusterMaxZoomLevel: this.props.clusterMaxZoomLevel,
      maxZoomLevel: this.props.maxZoomLevel,
      buffer: this.props.buffer,
      tolerance: this.props.tolerance,
    };
    return (
      <RCTMGLShapeSource {...props}>
        {cloneReactChildrenWithProps(this.props.children, { sourceID: this.props.id })}
      </RCTMGLShapeSource>
    );
  }
}

export default ShapeSource;
