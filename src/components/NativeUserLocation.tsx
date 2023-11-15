import React, { memo } from 'react';
import { requireNativeComponent } from 'react-native';

const NATIVE_MODULE_NAME = 'RNMBXNativeUserLocation';

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

type NativeProps = Props;

const RNMBXNativeUserLocation =
  requireNativeComponent<NativeProps>(NATIVE_MODULE_NAME);

const NativeUserLocation = memo((props: Props) => {
  return <RNMBXNativeUserLocation {...props} />;
});

export default NativeUserLocation;
