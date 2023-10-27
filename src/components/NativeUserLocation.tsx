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

  /**
   * The name of native image asset to use as the top layer for the location indicator. Native asset are under Image.xcassets on iOS and the drawables directory on android
   */
  topImageAsset?: string;

  /**
   * The name of native image asset to use as the middle layer for the location indicator. Native asset are under Image.xcassets on iOS and the drawables directory on android
   */
  bearingImageAsset?: string;

  /**
   * The name of native image asset to use as the background0 for the location indicator. Native asset are under Image.xcassets on iOS and the drawables directory on android
   */
  shadowImageAsset?: string;

  /**
   * The size of the images, as a scale factor applied to the size of the specified image.
   */
  scale?: number;

  /**
   * Whether location icon is visible
   */
  visible?: boolean;
};

const NativeUserLocation = memo((props: Props) => {
  const {
    bearingImageAsset: bearingImage,
    shadowImageAsset: shadowImage,
    topImageAsset: topImage,
    androidRenderMode,
    iosShowsUserHeadingIndicator,
    scale,
    visible,
  } = props;

  if (visible === false) {
    return null;
  }

  return (
    <RNMBXNativeUserLocationNativeComponent
      bearingImage={bearingImage}
      shadowImage={shadowImage}
      topImage={topImage}
      androidRenderMode={androidRenderMode}
      iosShowsUserHeadingIndicator={iosShowsUserHeadingIndicator}
      scale={scale}
    />
  );
});

export default NativeUserLocation;
