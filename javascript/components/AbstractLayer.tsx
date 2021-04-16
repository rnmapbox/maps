/* eslint react/prop-types:0  */
import React from 'react';
import { processColor, Image } from 'react-native';

import { getFilter } from '../utils/filterUtils';
import { getStyleType } from '../utils/styleMap';
import BridgeValue from '../utils/BridgeValue';

// prettier-ignore
type ExpressionName =
  // Types
  | 'array' | 'boolean' | 'collator' | 'format' | 'literal' | 'number' | 'object' | 'string'
  | 'to-boolean' | 'to-color' | 'to-number' | 'to-string' | 'typeof'
  // Feature data
  | 'feature-state' | 'geometry-type' | 'id' | 'line-progress' | 'properties'
  // Lookup
  | 'at' | 'get' | 'has' | 'length'
  // Decision
  | '!' | '!=' | '<' | '<=' | '==' | '>' | '>=' | 'all' | 'any' | 'case' | 'match' | 'coalesce'
  // Ramps, scales, curves
  | 'interpolate' | 'interpolate-hcl' | 'interpolate-lab' | 'step'
  // Variable binding
  | 'let' | 'var'
  // String
  | 'concat' | 'downcase' | 'is-supported-script' | 'resolved-locale' | 'upcase'
  // Color
  | 'rgb' | 'rgba'
  // Math
  | '-' | '*' | '/' | '%' | '^' | '+' | 'abs' | 'acos' | 'asin' | 'atan' | 'ceil' | 'cos' | 'e'
  | 'floor' | 'ln' | 'ln2' | 'log10' | 'log2' | 'max' | 'min' | 'pi' | 'round' | 'sin' | 'sqrt' | 'tan'
  // Zoom, Heatmap
  | 'zoom' | 'heatmap-density';

export type ExpressionField =
  | string
  | number
  | boolean
  | Expression
  | ExpressionField[]
  | { [key: string]: ExpressionField };

export type Expression = [ExpressionName, ...ExpressionField[]];

interface StyleProps {
  json: any;
}

interface Props {
  id: string;
  sourceID?: string;
  sourceLayerID?: string;
  aboveLayerID?: string;
  belowLayerID?: string;
  layerIndex?: number;
  filter?: Expression;
  minZoomLevel?: number;
  maxZoomLevel?: number;
  style?: StyleProps;
}

class AbstractLayer extends React.PureComponent<Props> {
  get baseProps() {
    return {
      ...this.props,
      id: this.props.id,
      sourceID: this.props.sourceID,
      reactStyle: this.getStyle(),
      minZoomLevel: this.props.minZoomLevel,
      maxZoomLevel: this.props.maxZoomLevel,
      aboveLayerID: this.props.aboveLayerID,
      belowLayerID: this.props.belowLayerID,
      layerIndex: this.props.layerIndex,
      filter: getFilter(this.props.filter),
      style: undefined,
    };
  }

  getStyleTypeFormatter(styleType: string) {
    if (styleType === 'color') {
      return processColor;
    }
  }

  _getStyle(style: StyleProps) {
    if (!style) {
      return;
    }

    const nativeStyle = {};
    const styleProps = Object.keys(style);
    for (const styleProp of styleProps) {
      const styleType = getStyleType(styleProp);
      let rawStyle = style[styleProp];

      if (styleType === 'color' && typeof rawStyle === 'string') {
        rawStyle = processColor(rawStyle);
      } else if (styleType === 'image' && typeof rawStyle === 'number') {
        rawStyle = Image.resolveAssetSource(rawStyle) || {};
      }

      const bridgeValue = new BridgeValue(rawStyle);
      nativeStyle[styleProp] = {
        styletype: styleType,
        stylevalue: bridgeValue.toJSON(),
      };
    }

    return nativeStyle;
  }

  getStyle() {
    return this._getStyle(this.props.style);
  }

  setNativeProps(props: any) {
    if (this.refs.nativeLayer) {
      let propsToPass = props;
      if (props.style) {
        propsToPass = { ...props, reactStyle: this._getStyle(props.style) };
      }
      // TODO: properly support HostComponents
      (this.refs.nativeLayer as any).setNativeProps(propsToPass);
    }
  }
}

export default AbstractLayer;
