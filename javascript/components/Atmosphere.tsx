import React, { memo, useMemo } from 'react';
import { HostComponent, requireNativeComponent } from 'react-native';

import type { AtmosphereLayerStyleProps } from '../utils/MapboxStyles';
import { StyleValue, transformStyle } from '../utils/StyleValue';

export const NATIVE_MODULE_NAME = 'RCTMGLAtmosphere';

type Props = {
  style: AtmosphereLayerStyleProps;
};

const Atmosphere = memo((props: Props) => {
  const baseProps = useMemo(() => {
    return {
      ...props,
      reactStyle: transformStyle(props.style),
      style: undefined,
    };
  }, [props]);

  return <RCTMGLAtmosphere {...baseProps} />;
});

const RCTMGLAtmosphere: HostComponent<{
  reactStyle?: { [key: string]: StyleValue };
  style?: undefined;
}> = requireNativeComponent(NATIVE_MODULE_NAME);

export default Atmosphere;
