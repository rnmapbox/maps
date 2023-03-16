import React from 'react';
import { View, NativeModules, requireNativeComponent } from 'react-native';

import { Expression, type SymbolLayerStyleProps } from '../utils/MapboxStyles';
import { type StyleValue } from '../utils/StyleValue';

import AbstractLayer from './AbstractLayer';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLSymbolLayer';

export type Props = {
  /**
   * A string that uniquely identifies the layer in the style to which it is added.
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
  filter?: Expression;

  /**
   * The minimum zoom level at which the layer gets parsed and appears.
   */
  minZoomLevel?: number;

  /**
   * The maximum zoom level at which the layer gets parsed and appears.
   */
  maxZoomLevel?: number;

  style?: SymbolLayerStyleProps;

  children?: JSX.Element | JSX.Element[];
};

type NativeTypeProps = Omit<Props, 'style'> & {
  snapshot: boolean;
  reactStyle?: { [key: string]: StyleValue };
};

const RCTMGLSymbolLayer =
  requireNativeComponent<NativeTypeProps>(NATIVE_MODULE_NAME);

/**
 * SymbolLayer is a style layer that renders icon and text labels at points or along lines on the map.
 */
export class SymbolLayer extends AbstractLayer<Props, NativeTypeProps> {
  static defaultProps = {
    sourceID: MapboxGL.StyleSource.DefaultSourceID,
  };

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

    return isSnapshot;
  }

  render() {
    const props = {
      ...this.baseProps,
      snapshot: this._shouldSnapshot(),
      sourceLayerID: this.props.sourceLayerID,
    };

    return (
      <RCTMGLSymbolLayer ref={this.setNativeLayer} {...props}>
        {this.props.children}
      </RCTMGLSymbolLayer>
    );
  }
}
