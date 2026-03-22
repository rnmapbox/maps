import { memo, useMemo } from 'react';

import type { RainLayerStyleProps } from '../utils/MapboxStyles';
import { transformStyle } from '../utils/StyleValue';
import type { BaseProps } from '../types/BaseProps';
import RNMBXRainNativeComponent from '../specs/RNMBXRainNativeComponent';

type Props = BaseProps & {
  style?: RainLayerStyleProps;
};

export const Rain = memo((props: Props) => {
  const baseProps = useMemo(() => {
    return {
      ...props,
      reactStyle: transformStyle(props.style),
      style: undefined,
    };
  }, [props]);

  return <RNMBXRainNativeComponent {...baseProps} />;
});
