import React from 'react';
import { NativeMethods, processColor } from 'react-native';

import { getFilter } from '../utils/filterUtils';
import { AllLayerStyleProps, FilterExpression } from '../utils/MapboxStyles';
import { StyleValue, transformStyle } from '../utils/StyleValue';
import type { BaseProps } from '../types/BaseProps';

type PropsBase = BaseProps & {
  id: string;
  existing?: boolean;
  sourceID?: string;
  minZoomLevel?: number;
  maxZoomLevel?: number;
  aboveLayerID?: string;
  belowLayerID?: string;
  layerIndex?: number;
  filter?: FilterExpression;
  style?: AllLayerStyleProps;
};

class AbstractLayer<
  PropsType extends PropsBase,
  NativePropsType,
> extends React.PureComponent<PropsType> {
  get baseProps(): Omit<PropsType, 'style'> & {
    reactStyle?: { [key: string]: StyleValue };
  } {
    return {
      ...this.props,
      id: this.props.id,
      existing: this.props.existing,
      sourceID: this.props.sourceID,
      reactStyle: this.getStyle(this.props.style),
      minZoomLevel: this.props.minZoomLevel,
      maxZoomLevel: this.props.maxZoomLevel,
      aboveLayerID: this.props.aboveLayerID,
      belowLayerID: this.props.belowLayerID,
      layerIndex: this.props.layerIndex,
      filter: getFilter(this.props.filter),
      style: undefined,
    };
  }

  nativeLayer:
    | (React.Component<NativePropsType> & Readonly<NativeMethods>)
    | null = null;

  setNativeLayer = (
    instance:
      | (React.Component<NativePropsType> & Readonly<NativeMethods>)
      | null,
  ) => {
    this.nativeLayer = instance;
  };

  getStyleTypeFormatter(styleType: string) {
    if (styleType === 'color') {
      return processColor;
    }
    return undefined;
  }

  getStyle(
    style: AllLayerStyleProps | undefined,
  ): { [key: string]: StyleValue } | undefined {
    return transformStyle(style);
  }

  setNativeProps(props: { [key: string]: unknown }) {
    if (this.nativeLayer) {
      let propsToPass = props;
      if (props.style) {
        propsToPass = {
          ...props,
          reactStyle: this.getStyle(props.style as AllLayerStyleProps),
        };
      }
      this.nativeLayer?.setNativeProps(propsToPass);
    }
  }
}

export default AbstractLayer;
