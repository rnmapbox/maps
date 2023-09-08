import React, { memo, useMemo } from 'react';

import type { AtmosphereLayerStyleProps } from '../utils/MapboxStyles';
import { transformStyle } from '../utils/StyleValue';
import type { BaseProps } from '../types/BaseProps';
import MBXAtmosphereNativeComponent from '../specs/MBXAtmosphereNativeComponent';

type Props = BaseProps & {
  style: AtmosphereLayerStyleProps;
};

export const Atmosphere = memo((props: Props) => {
  const baseProps = useMemo(() => {
    return {
      ...props,
      reactStyle: transformStyle(props.style),
      style: undefined,
    };
  }, [props]);

  return <MBXAtmosphereNativeComponent {...baseProps} />;
});
