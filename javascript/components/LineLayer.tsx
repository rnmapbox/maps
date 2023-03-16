import React from 'react';
import { NativeModules, requireNativeComponent } from 'react-native';

import { FilterExpression, LineLayerStyleProps } from '../utils/MapboxStyles';
import { StyleValue } from '../utils/StyleValue';

import AbstractLayer from './AbstractLayer';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLLineLayer';

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
   * Inferred from parent source only if the layer is a direct child to it.
   */
  sourceID?: string;

  /**
   * Identifier of the layer within the source identified by the sourceID property from which the receiver obtains the data to style.
   */
  sourceLayerID?: string;

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
   * The minimum zoom level at which the layer gets parsed and appears.
   */
  minZoomLevel?: number;

  /**
   * The maximum zoom level at which the layer gets parsed and appears.
   */
  maxZoomLevel?: number;

  /**
   * Customizable style attributes
   */
  style?: LineLayerStyleProps;
};

type NativeTypeProps = Omit<Props, 'style'> & {
  reactStyle?: { [key: string]: StyleValue };
};

/**
 * LineLayer is a style layer that renders one or more stroked polylines on the map.
 */
class LineLayer extends AbstractLayer<Props, NativeTypeProps> {
  static defaultProps = {
    sourceID: MapboxGL.StyleSource.DefaultSourceID,
  };

  render() {
    const props = {
      ...this.baseProps,
      sourceLayerID: this.props.sourceLayerID,
    };
    return <RCTMGLLineLayer ref={this.setNativeLayer} {...props} />;
  }
}

const RCTMGLLineLayer =
  requireNativeComponent<NativeTypeProps>(NATIVE_MODULE_NAME);

export default LineLayer;
