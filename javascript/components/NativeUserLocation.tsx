import React, { memo } from 'react';
import { HostComponent, requireNativeComponent } from 'react-native';

const NATIVE_MODULE_NAME = 'RCTMGLNativeUserLocation';

export type Props = {
  /**
   * Android render mode.
   *
   *  - normal: just a circle
   *  - compass: triangle with heading
   *  - gps: large arrow
   *
   * @platform android
   */
  androidRenderMode?: 'normal' | 'compass' | 'gps';

  /**
   * iOS only. A Boolean value indicating whether the user location annotation may display a permanent heading indicator.
   *
   * @platform ios
   */
  iosShowsUserHeadingIndicator?: boolean;
};

const RCTMGLNativeUserLocation: HostComponent<Props> =
  requireNativeComponent(NATIVE_MODULE_NAME);

const NativeUserLocation = memo((props: Props) => {
  return <RCTMGLNativeUserLocation {...props} />;
});

export default NativeUserLocation;
