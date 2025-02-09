import React, { JSX } from 'react';
import { View, NativeModules } from 'react-native';

import {
  type FilterExpression,
  type SymbolLayerStyleProps,
} from '../utils/MapboxStyles';
import { type StyleValue } from '../utils/StyleValue';
import RNMBXSymbolLayerNativeComponent from '../specs/RNMBXSymbolLayerNativeComponent';

import AbstractLayer from './AbstractLayer';

export const NATIVE_MODULE_NAME = 'RNMBXSymbolLayer';

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
  style: SymbolLayerStyleProps;

  /**
   * @deprecated passed children used to create an image with id of symbol in style and also set the iconImageName property accordingly.
   * This is now deprecated, use Image component instead.
   */
  children?: JSX.Element | JSX.Element[];
};

type NativeTypeProps = Omit<Props, 'style'> & {
  snapshot: boolean;
  reactStyle?: { [key: string]: StyleValue };
};

/**
 * SymbolLayer is a style layer that renders icon and text labels at points or along lines on the map.
 */
export class SymbolLayer extends AbstractLayer<Props, NativeTypeProps> {
  static defaultProps = {
    sourceID: Mapbox.StyleSource.DefaultSourceID,
  };
  deprecationLogged: { snapshot: boolean } = { snapshot: false };

  _shouldSnapshot() {
    let isSnapshot = false;

    if (React.Children.count(this.baseProps.children) <= 0) {
      return isSnapshot;
    }

    React.Children.forEach(this.baseProps.children, (child) => {
      if (child?.type === View) {
        isSnapshot = true;
      }
    });
    if (isSnapshot && !this.deprecationLogged.snapshot) {
      console.warn(
        'SymbolLayer: passing children for symbol layer is deprecated, please use @rnmapbox/maps Image component instead. https://github.com/rnmapbox/maps/wiki/Deprecated-SymbolLayerChildren',
      );
      this.deprecationLogged.snapshot = true;
    }

    return isSnapshot;
  }

  render() {
    const props = {
      ...this.baseProps,
      snapshot: this._shouldSnapshot(),
      sourceLayerID: this.props.sourceLayerID,
    };

    return (
      // @ts-expect-error just codegen stuff
      <RNMBXSymbolLayerNativeComponent ref={this.setNativeLayer} {...props}>
        {this.props.children}
      </RNMBXSymbolLayerNativeComponent>
    );
  }
}
