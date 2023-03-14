import React from 'react';
import { NativeModules, requireNativeComponent } from 'react-native';

import { FilterExpression, SkyLayerStyleProps } from '../utils/MapboxStyles';
import { StyleValue } from '../utils/StyleValue';

import AbstractLayer from './AbstractLayer';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLSkyLayer';

export type Props = {
  /**
   * A string that uniquely identifies the source in the style to which it is added.
   */
  id: string;

  /**
   * The id refers to en existing layer in the style. Does not create a new layer.
   */
  existing?: boolean;

  /**
   * The source from which to obtain the data to style.
   * If the source has not yet been added to the current style, the behavior is undefined.
   */
  sourceID?: string;

  /**
   * Inserts a layer above aboveLayerID.
   */
  aboveLayerID?: string;

  /**
   * Inserts a layer below belowLayerID
   */
  belowLayerID?: string;

  /**
   * Inserts a layer at a specified index
   */
  layerIndex?: number;

  /**
   *  Filter only the features in the source layer that satisfy a condition that you define
   */
  filter?: FilterExpression;

  /**
   * Customizable style attributes
   */
  style?: SkyLayerStyleProps;
} & React.ComponentProps<typeof AbstractLayer>;

type NativeTypeProps = Omit<Props, 'style'> & {
  reactStyle?: { [key: string]: StyleValue };
};
/**
 * SkyLayer is a spherical dome around the map that is always rendered behind all other layers
 */
class SkyLayer extends AbstractLayer<Props, NativeTypeProps> {
  static defaultProps = {
    sourceID: MapboxGL.StyleSource.DefaultSourceID,
  };

  render() {
    return <RCTMGLSkyLayer ref={this.setNativeLayer} {...this.baseProps} />;
  }
}

const RCTMGLSkyLayer =
  requireNativeComponent<NativeTypeProps>(NATIVE_MODULE_NAME);

export default SkyLayer;
