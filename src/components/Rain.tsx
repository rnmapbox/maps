import { memo, useMemo } from 'react';

import type { RainLayerStyleProps } from '../utils/MapboxStyles';
import { transformStyle } from '../utils/StyleValue';
import type { BaseProps } from '../types/BaseProps';
import RNMBXRainNativeComponent from '../specs/RNMBXRainNativeComponent';

type Props = BaseProps & {
  /** Rain particle effect style properties.
   *
   * @note The default `color` and `vignetteColor` values use `measure-light("brightness")`
   * expressions that are only available in Mapbox Standard-based styles
   * (`mapbox://styles/mapbox/standard`, `mapbox://styles/mapbox/standard-satellite`).
   * When using legacy or custom styles, set `color` and `vignetteColor` explicitly to
   * avoid "Brightness is unavailable in the current evaluation context" warnings and
   * invisible rain. For example: `color="#a8adbc" vignetteColor="#464646"`.
   */
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
