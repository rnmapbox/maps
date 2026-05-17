import { memo } from 'react';

import RNMBXCustomLocationProvider from '../specs/RNMBXCustomLocationProviderNativeComponent';
import { Position } from '../types/Position';

export type Props = {
  /**
   * The position as a `[longitude, latitude]` pair, transmitted to the native puck as the current location.
   */
  coordinate?: Position;

  /**
   * Heading in degrees (0 = north, 90 = east, 180 = south, 270 = west).
   * Controls the rotation of the location puck when `puckBearingEnabled` is true on the `LocationPuck`.
   */
  heading?: number;
};

/**
 * Overrides the native location provider with custom coordinates and heading.
 *
 * Useful for simulating locations during development, integrating an external
 * positioning sensor, or writing tests. Must be a child of `MapView`.
 * Use together with `LocationPuck` to display the custom position on the map.
 *
 * @example
 * <MapView>
 *   <CustomLocationProvider coordinate={[-73.9857, 40.7484]} heading={90} />
 *   <LocationPuck puckBearingEnabled={true} puckBearing="heading" />
 * </MapView>
 */
const CustomLocationProvider = memo((props: Props) => {
  return <RNMBXCustomLocationProvider {...props} />;
});

export default CustomLocationProvider;
