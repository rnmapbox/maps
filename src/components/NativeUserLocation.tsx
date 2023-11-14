import React, { memo } from 'react';

import RNMBXNativeUserLocation, {
  type NativeProps,
} from '../specs/RNMBXNativeUserLocationNativeComponent';
import type { Expression } from '../utils/MapboxStyles';

type Value<T> = T | Expression;

export type Props = {
  /**
   * Android render mode.
   *
   *  - normal: just a circle
   *  - compass: triangle with heading
   *  - gps: large arrow
   *
   * @deprecated use `puckBearing` for source and `bearingImage` for image
   * @platform android
   */
  androidRenderMode?: 'normal' | 'compass' | 'gps';

  /**
   * The bearing of the puck.
   *
   *  - heading: Orients the puck to match the direction in which the device is facing.
   *  - course: Orients the puck to match the direction in which the device is moving.
   */
  puckBearing?: 'heading' | 'course';

  /**
   * Whether the puck rotates to track the bearing source.
   */
  puckBearingEnabled?: boolean;

  /**
   * iOS only. A Boolean value indicating whether the user location annotation may display a permanent heading indicator.
   *
   * @platform ios
   * @deprecated use `puckBearingEnabled={true} puckBrearing="heading"` instead
   */
  iosShowsUserHeadingIndicator?: boolean;

  /**
   * The name of image to use as the top layer for the location indicator. Images component should define this image.
   */
  topImage?: string;

  /**
   * The name of image to use as the middle layer for the location indicator. Images component should define this image.
   */
  bearingImage?: string;

  /**
   * The name of image to use as the background for the location indicator. Images component should define this image.
   */
  shadowImage?: string;

  /**
   * The size of the images, as a scale factor applied to the size of the specified image. Supports expressions based on zoom.
   *
   * @example
   * ["interpolate",["linear"], ["zoom"], 10.0, 1.0, 20.0, 4.0]]
   * @example
   * 2.0
   */
  scale?: Value<number>;

  /**
   * Whether location icon is visible, defaults to true
   */
  visible?: boolean;
};

const defaultProps = {
  visible: true,
} as const;

const NativeUserLocation = memo((props: Props) => {
  const { iosShowsUserHeadingIndicator, ...rest } = props;
  let baseProps: NativeProps = { ...defaultProps };
  if (iosShowsUserHeadingIndicator) {
    console.warn(
      'NativeUserLocation: iosShowsUserHeadingIndicator is deprecated, use puckBearingEnabled={true} puckBearing="heading" instead',
    );
    baseProps = {
      ...baseProps,
      puckBearingEnabled: true,
      puckBearing: 'heading',
    };
  }
  const actualProps = { ...baseProps, ...rest };
  return <RNMBXNativeUserLocation {...actualProps} />;
});

export default NativeUserLocation;
