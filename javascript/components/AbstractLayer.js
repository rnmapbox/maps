/* eslint react/prop-types:0  */
import React from 'react';
import { processColor } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

import { getFilter } from '../utils/filterUtils';
import { getStyleType } from '../utils/styleMap';
import BridgeValue from '../utils/BridgeValue';

class AbstractLayer extends React.PureComponent {
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

  getStyleTypeFormatter(styleType) {
    if (styleType === 'color') {
      return processColor;
    }
  }

  _getStyle(style) {
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
        rawStyle = resolveAssetSource(rawStyle) || {};
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

  setNativeProps(props) {
    if (this.refs.nativeLayer) {
      let propsToPass = props;
      if (props.style) {
        propsToPass = { ...props, reactStyle: this._getStyle(props.style) };
      }
      this.refs.nativeLayer.setNativeProps(propsToPass);
    }
  }
}

export default AbstractLayer;
