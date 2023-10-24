import React, { memo } from 'react';

import RNMBXNativeUserLocationNativeComponent from '../specs/RNMBXNativeUserLocationNativeComponent';

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

const NativeUserLocation = memo((props: Props) => {
  return <RNMBXNativeUserLocationNativeComponent {...props} />;
});

export default NativeUserLocation;
