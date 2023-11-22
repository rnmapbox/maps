import React from 'react';
import { NativeModules } from 'react-native';

import { FilterExpression, FillLayerStyleProps } from '../utils/MapboxStyles';
import { StyleValue } from '../utils/StyleValue';
import RNMBXFillLayerNativeComponent from '../specs/RNMBXFillLayerNativeComponent';

import AbstractLayer from './AbstractLayer';

const Mapbox = NativeModules.RNMBXModule;

// @{codepart-replace-start(LayerPropsCommon.codepart-tsx)}
type Slot = 'bottom' | 'middle' | 'top';

type LayerPropsCommon = {
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
   * The slot this layer is assigned to. If specified, and a slot with that name exists, it will be placed at that position in the layer order.
   *
   * v11 only
   */
  slot?: Slot;
};
// @{codepart-replace-end}

export type Props = LayerPropsCommon & {
  /**
   * Customizable style attributes
   */
  style?: FillLayerStyleProps;
} & React.ComponentProps<typeof AbstractLayer>;

type NativeTypeProps = Omit<Props, 'style'> & {
  reactStyle?: { [key: string]: StyleValue };
};

/**
 * FillLayer is a style layer that renders one or more filled (and optionally stroked) polygons on the map.
 */
class FillLayer extends AbstractLayer<Props, NativeTypeProps> {
  static defaultProps = {
    sourceID: Mapbox.StyleSource.DefaultSourceID,
  };

  render() {
    const props = {
      ...this.baseProps,
      sourceLayerID: this.props.sourceLayerID,
    };
    return (
      // @ts-expect-error just codegen stuff
      <RNMBXFillLayerNativeComponent ref={this.setNativeLayer} {...props} />
    );
  }
}

export default FillLayer;
