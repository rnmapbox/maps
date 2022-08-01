/* eslint react/prop-types:0  */
import React from 'react';
import { processColor } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

import { getFilter } from '../utils/filterUtils';
import { getStyleType } from '../utils/styleMap';
import BridgeValue from '../utils/BridgeValue';
import { transformStyle } from '../utils/StyleValue';

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

  getStyle() {
    return transformStyle(this.props.style);
  }

  setNativeProps(props) {
    if (this.refs.nativeLayer) {
      let propsToPass = props;
      if (props.style) {
        propsToPass = { ...props, reactStyle: this.getStyle(props.style) };
      }
      this.refs.nativeLayer.setNativeProps(propsToPass);
    }
  }
}

export default AbstractLayer;
