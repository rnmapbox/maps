import React from 'react';
import { requireNativeComponent } from 'react-native';

import { LightLayerStyleProp } from '../utils/styleMap';
import AbstractLayer from './AbstractLayer';

export const NATIVE_MODULE_NAME = 'RCTMGLLight';

const RCTMGLLight = requireNativeComponent(NATIVE_MODULE_NAME, Light);

/**
 * Light represents the light source for extruded geometries
 */
class Light extends AbstractLayer {
  static propTypes = {
    /**
     * Customizable style attributes
     */
    style: LightLayerStyleProp,
  };

  render () {
    return <RCTMGLLight reactStyle={this.getStyle()} />;
  }
}

export default Light;
