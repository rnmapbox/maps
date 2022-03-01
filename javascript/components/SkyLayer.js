import React from 'react';
import PropTypes from 'prop-types';
import {NativeModules, requireNativeComponent} from 'react-native';

import {viewPropTypes} from '../utils';
import {SkyLayerStyleProp} from '../utils/styleMap';

import AbstractLayer from './AbstractLayer';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLSkyLayer';

/**
 * SkyLayer is a spherical dome around the map that is always rendered behind all other layers
 */
class SkyLayer extends AbstractLayer {
  static propTypes = {
    ...viewPropTypes,

    /**
     * A string that uniquely identifies the source in the style to which it is added.
     */
    id: PropTypes.string.isRequired,

    /**
     * The source from which to obtain the data to style.
     * If the source has not yet been added to the current style, the behavior is undefined.
     */
    sourceID: PropTypes.string,

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
     * Customizable style attributes
     */
    style: PropTypes.oneOfType([
      SkyLayerStyleProp,
      PropTypes.arrayOf(SkyLayerStyleProp),
    ]),
  };

  static defaultProps = {
    sourceID: MapboxGL.StyleSource.DefaultSourceID,
  };

  render() {
    return (
      <RCTMGLSkyLayer
        testID="rctmglSkyLayer"
        ref="nativeLayer"
        {...this.baseProps}
      />
    );
  }
}

const RCTMGLSkyLayer = requireNativeComponent(NATIVE_MODULE_NAME, SkyLayer, {
  nativeOnly: {reactStyle: true},
});

export default SkyLayer;
