import React, { memo } from 'react';

import RNMBXCustomLocationProvider from '../specs/RNMBXCustomLocationProviderNativeComponent';
import { Position } from '../types/Position';

export type Props = {
  coordinate?: Position;
};

const CustomLocationProvider = memo((props: Props) => {
  return <RNMBXCustomLocationProvider {...props} />;
});

export default CustomLocationProvider;
