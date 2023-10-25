import React, { forwardRef, memo, useImperativeHandle, useRef } from 'react';

import RNMBXLightNativeComponent from '../specs/RNMBXLightNativeComponent';
import { LightLayerStyleProps } from '../utils/MapboxStyles';
import { type BaseProps } from '../types/BaseProps';
import { transformStyle } from '../utils/StyleValue';
import nativeRef from '../utils/nativeRef';

type Props = BaseProps & {
  /**
   * Customizable style attributes
   */
  style: LightLayerStyleProps;
};

interface LightMethods {
  setNativeProps(props: { [key: string]: unknown }): void;
}

/**
 * Light represents the light source for extruded geometries
 */
function Light(props: Props, ref: React.ForwardedRef<LightMethods>) {
  const { style, ...propWithoutStyle } = props;

  const nativeLightRef = nativeRef(useRef(null));

  useImperativeHandle(ref, () => ({
    setNativeProps(_props: { [key: string]: unknown }) {
      let propsToPass = _props;
      if (_props.style) {
        propsToPass = {
          ..._props,
          reactStyle: transformStyle(_props.style),
        };
      }
      nativeLightRef.current?.setNativeProps(propsToPass);
    },
  }));

  return (
    <RNMBXLightNativeComponent
      // @ts-expect-error just codegen stuff
      ref={nativeLightRef}
      testID="RNMBXLight"
      {...propWithoutStyle}
      reactStyle={transformStyle(style)}
    />
  );
}

export default memo(forwardRef(Light));
