import React from 'react';
import { View, NativeModules, requireNativeComponent } from 'react-native';
import PropTypes from 'prop-types';

import { viewPropTypes } from '../utils';
import { SymbolLayerStyleProp } from '../utils/styleMap';

import AbstractLayer from './AbstractLayer';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLSymbolLayer';

/**
 * SymbolLayer is a style layer that renders icon and text labels at points or along lines on the map.
 */
class SymbolLayer extends AbstractLayer {
  static propTypes = {
    ...viewPropTypes,

    /**
     * A string that uniquely identifies the source in the style to which it is added.
     */
    id: PropTypes.string.isRequired,

    /**
     * The source from which to obtain the data to style.
     * If the source has not yet been added to the current style, the behavior is undefined.
     * Inferred from parent source only if the layer is a direct child to it.
     */
    sourceID: PropTypes.string,

    /**
     * Identifier of the layer within the source identified by the sourceID property from which the receiver obtains the data to style.
     */
    sourceLayerID: PropTypes.string,

    /**
     * Inserts a layer above aboveLayerID.
     */
    aboveLayerID: PropTypes.string,

    /**
     * Inserts a layer below belowLayerID
     */
    belowLayerID: PropTypes.string,

    /**
     * Inserts a layer at a specified index
     */
    layerIndex: PropTypes.number,

    /**
     *  Filter only the features in the source layer that satisfy a condition that you define
     */
    filter: PropTypes.array,

    /**
     * The minimum zoom level at which the layer gets parsed and appears.
     */
    minZoomLevel: PropTypes.number,

    /**
     * The maximum zoom level at which the layer gets parsed and appears.
     */
    maxZoomLevel: PropTypes.number,

    /**
     * Customizable style attributes
     */
    style: PropTypes.oneOfType([
      SymbolLayerStyleProp,
      PropTypes.arrayOf(SymbolLayerStyleProp),
    ]),
  };

  static defaultProps = {
    sourceID: MapboxGL.StyleSource.DefaultSourceID,
  };

  _shouldSnapshot() {
    let isSnapshot = false;

    if (React.Children.count(this.props.children) <= 0) {
      return isSnapshot;
    }

    React.Children.forEach(this.props.children, (child) => {
      if (child.type === View) {
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
      <RCTMGLSymbolLayer ref="nativeLayer" {...props}>
        {this.props.children}
      </RCTMGLSymbolLayer>
    );
  }
}

const RCTMGLSymbolLayer = requireNativeComponent(
  NATIVE_MODULE_NAME,
  SymbolLayer,
  {
    nativeOnly: { reactStyle: true, snapshot: true },
  },
);

export default SymbolLayer;
