import React, { memo, useMemo } from 'react';
import { requireNativeComponent } from 'react-native';

import type { TerrainLayerStyleProps, Value } from '../utils/MapboxStyles';
import { StyleValue, transformStyle } from '../utils/StyleValue';
import type { BaseProps } from '../types/BaseProps';

export const NATIVE_MODULE_NAME = 'RCTMGLTerrain';

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

type NativeProps = Omit<Props, 'style'> & {
  reactStyle?: { [key: string]: StyleValue };
};

export const Terrain = memo((props: Props) => {
  let { style = {} } = props;

  if (props.exaggeration) {
    console.warn(
      `Tarrain: exaggeration property is deprecated pls use style.exaggeration instead!`,
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

  return <RCTMGLTerrain {...baseProps} />;
});

const RCTMGLTerrain = requireNativeComponent<NativeProps>(NATIVE_MODULE_NAME);
