/*
import React from 'react';
import PropTypes from 'prop-types';
import { NativeModules, requireNativeComponent } from 'react-native';

import { viewPropTypes } from '../utils';

import AbstractLayer from './AbstractLayer';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLTerrain';

**
 * A global modifier that elevates layers and markers based on a DEM data source.
 *
class Terrain extends React.PureComponent {
  static propTypes = {
    ...viewPropTypes,

     **
     * Name of a source of raster_dem type to be used for terrain elevation.
     *
    sourceID: PropTypes.string,

     **
     * Optional number between 0 and 1000 inclusive. Defaults to 1. Supports interpolateexpressions. Transitionable.
     * Exaggerates the elevation of the terrain by multiplying the data from the DEM with this value.
     *
    exaggeration: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
  };

  static defaultProps = {
    sourceID: MapboxGL.StyleSource.DefaultSourceID,
  };

  get baseProps() {
    return {
      ...this.props,
      sourceID: this.props.sourceID,
    };
  }

  render() {
    const props = {
      ...this.baseProps,
      sourceID: this.props.sourceID,
    };
    return <RCTMGLTerrain ref="nativeLayer" {...props} />;
  }
}

const RCTMGLTerrain = requireNativeComponent(NATIVE_MODULE_NAME, Terrain, {
  nativeOnly: { reactStyle: true },
});

export default Terrain;
*/

import React, { memo, useMemo } from 'react';
import { HostComponent, requireNativeComponent } from 'react-native';

import type { TerrainLayerStyleProps, Value } from '../utils/MapboxStyles';
import { StyleValue, transformStyle } from '../utils/StyleValue';

export const NATIVE_MODULE_NAME = 'RCTMGLTerrain';

type Props = {
  /**
   * Name of a source of raster_dem type to be used for terrain elevation.
   */
  sourceID: string;

  /**
   * Deprecated, use exaggeration in style instead
   */
  exaggeration?: Value<number, ['zoom']>;

  /**
   * Customizable style attributes
   */
  style: TerrainLayerStyleProps;
};

export const Terrain = memo((props: Props) => {
  let { style = {} } = props;

  if (props.exaggeration) {
    console.warn(
      `Tarrain: exaggeration property is deprecated pls use style.exaggeration instead!`,
    );
    style = { exaggeration: props.exaggeration, ...style };
  }

  console.log('STYLE:', style);
  const baseProps = useMemo(() => {
    return {
      ...props,
      reactStyle: transformStyle(style),
      style: undefined,
    };
  }, [props, style]);
  console.log('BASE PROPS', baseProps);

  return <RCTMGLTerrain {...baseProps} />;
});

const RCTMGLTerrain: HostComponent<{
  sourceID: string;
  reactStyle?: { [key: string]: StyleValue };
  style?: undefined;
}> = requireNativeComponent(NATIVE_MODULE_NAME);
