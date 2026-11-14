import { memo, useMemo } from 'react';

import type { SnowLayerStyleProps } from '../utils/MapboxStyles';
import { transformStyle } from '../utils/StyleValue';
import type { BaseProps } from '../types/BaseProps';
import RNMBXSnowNativeComponent from '../specs/RNMBXSnowNativeComponent';

type Props = BaseProps & {
  style?: SnowLayerStyleProps;
};

export const Snow = memo((props: Props) => {
  const baseProps = useMemo(() => {
    return {
      ...props,
      reactStyle: transformStyle(props.style),
      style: undefined,
    };
  }, [props]);

  return <RNMBXSnowNativeComponent {...baseProps} />;
});
