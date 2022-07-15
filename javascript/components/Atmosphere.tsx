import React from 'react';
import { HostComponent, requireNativeComponent } from 'react-native';

import type { AtmosphereLayerStyleProps } from '../utils/MapboxStyles';
import { StyleValue, transformStyle } from '../utils/StyleValue';

export const NATIVE_MODULE_NAME = 'RCTMGLAtmosphere';

class Atmosphere extends React.PureComponent<{
  style: AtmosphereLayerStyleProps;
}> {
  getStyle(): { [key: string]: StyleValue } | undefined {
    return transformStyle(this.props.style);
  }

  get baseProps() {
    return {
      ...this.props,
      reactStyle: this.getStyle(),
      style: undefined,
    };
  }

  render() {
    const props = {
      ...this.baseProps,
    };
    return <RCTMGLAtmosphere {...props} />;
  }
}

const RCTMGLAtmosphere: HostComponent<{
  reactStyle?: { [key: string]: StyleValue };
  style?: undefined;
}> = requireNativeComponent(NATIVE_MODULE_NAME);

export default Atmosphere;
