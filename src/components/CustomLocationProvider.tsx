import React, { memo } from 'react';

import RNMBXCustomLocationProvider from '../specs/RNMBXCustomLocationProviderNativeComponent';
import { Position } from '../types/Position';

export type Props = {
  /**
   * longitude and latitude to use for the custom location provider that gets applied to the NativeUserLocation
   */
  coordinate?: Position;

  /**
   * heading/bearing to use for custom location provider that gets applied to the NativeUserLocation
   */
  heading?: number;
};

const CustomLocationProvider = memo((props: Props) => {
  return <RNMBXCustomLocationProvider {...props} />;
});

export default CustomLocationProvider;
