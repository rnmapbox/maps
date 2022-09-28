import React from 'react';
import PropTypes from 'prop-types';
import { NativeModules, requireNativeComponent } from 'react-native';

import { viewPropTypes } from '../utils';
import { FillExtrusionLayerStyleProp } from '../utils/styleMap';

import AbstractLayer from './AbstractLayer';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLFillExtrusionLayer';

/**
 * FillExtrusionLayer is a style layer that renders one or more 3D extruded polygons on the map.
 */
class FillExtrusionLayer extends AbstractLayer {
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
      FillExtrusionLayerStyleProp,
      PropTypes.arrayOf(FillExtrusionLayerStyleProp),
    ]),
  };

  static defaultProps = {
    sourceID: MapboxGL.StyleSource.DefaultSourceID,
  };

  render() {
    const props = {
      ...this.baseProps,
      sourceLayerID: this.props.sourceLayerID,
    };
    return <RCTMGLFillExtrusionLayer ref={this.setNativeLayer} {...props} />;
  }
}

const RCTMGLFillExtrusionLayer = requireNativeComponent(
  NATIVE_MODULE_NAME,
  FillExtrusionLayer,
  {
    nativeOnly: { reactStyle: true },
  },
);

export default FillExtrusionLayer;
