import React from 'react';
import PropTypes from 'prop-types';
import {NativeModules, requireNativeComponent} from 'react-native';

import {viewPropTypes} from '../utils';

import AbstractLayer from './AbstractLayer';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLTerrain';

/**
 * Terrain renders a terran
 */
class Terrain extends React.PureComponent {
  static propTypes = {
    ...viewPropTypes,

    /**
     * Name of a source of raster_dem type to be used for terrain elevation.
     */
    sourceID: PropTypes.string,

    /**
     * Optional number between 0 and 1000 inclusive. Defaults to 1. Supports interpolateexpressions. Transitionable.
     * Exaggerates the elevation of the terrain by multiplying the data from the DEM with this value.
     */
    exaggeration: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.array,
    ])
  };

  static defaultProps = {
    sourceID: MapboxGL.StyleSource.DefaultSourceID,
  };

  get baseProps() {
    return {
      ...this.props,
      sourceID: this.props.sourceID
    };
  }

  render() {
    const props = {
      ...this.baseProps,
      sourceID: this.props.sourceID,
    };
    console.log(`++> props: ${props} [] `, props);
    return <RCTMGLTerrain ref="nativeLayer" {...props} />;
  }
}

const RCTMGLTerrain = requireNativeComponent(NATIVE_MODULE_NAME, Terrain, {
  nativeOnly: {reactStyle: true},
});

export default Terrain;
