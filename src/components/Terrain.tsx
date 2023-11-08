import React, { memo, useMemo } from 'react';

import type { TerrainLayerStyleProps, Value } from '../utils/MapboxStyles';
import { transformStyle } from '../utils/StyleValue';
import type { BaseProps } from '../types/BaseProps';
import RNMBXATerrainNativeComponent from '../specs/RNMBXTerrainNativeComponent';

type Props = BaseProps & {
  /**
   * Name of a source of raster_dem type to be used for terrain elevation.
   */
  sourceID?: string;

  /**
   * Deprecated, use exaggeration in style instead
   */
  exaggeration?: Value<number, ['zoom']>;

  /**
   * Customizable style attributes
   */
  style?: TerrainLayerStyleProps;
};

export const Terrain = memo((props: Props) => {
  let { style = {} } = props;

  if (props.exaggeration) {
    console.warn(
      `Terrain: exaggeration property is deprecated pls use style.exaggeration instead!`,
    );
    style = { exaggeration: props.exaggeration, ...style };
  }

  const baseProps = useMemo(() => {
    return {
      ...props,
      reactStyle: transformStyle(style),
      style: undefined,
    };
  }, [props, style]);

  return <RNMBXATerrainNativeComponent {...baseProps} />;
});
