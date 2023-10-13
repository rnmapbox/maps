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

  /**
   * The image to use as the top layer for the location indicator.
   */
  topImage?: string;

  /**
   * The image used as the middle of the location indicator.
   */
  bearingImage?: string;

  /**
   * The image that acts as a background of the location indicator.
   */
  shadowImage?: string;

  /**
   * The size of the images, as a scale factor applied to the size of the specified image.
   */
  scale?: number;
};

type NativeProps = Props;

const RNMBXNativeUserLocation =
  requireNativeComponent<NativeProps>(NATIVE_MODULE_NAME);

const NativeUserLocation = memo((props: Props) => {
  return <RNMBXNativeUserLocation {...props} />;
});

export default NativeUserLocation;
