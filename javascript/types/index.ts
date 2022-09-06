import { SyntheticEvent } from 'react';
import { Animated } from 'react-native';
import { GeoJsonObject } from 'geojson';

// General.

export type MapboxGLEvent<
  T extends string,
  P = GeoJSON.Feature,
  V = Element,
> = SyntheticEvent<V, { type: T; payload: P }>;

// Camera.

export type UserTrackingMode = 'normal' | 'compass' | 'course';

export type UserTrackingModeChangeCallback = (
  event: MapboxGLEvent<
    'usertrackingmodechange',
    {
      followUserLocation: boolean;
      followUserMode: UserTrackingMode | null;
    }
  >,
) => void;

// Animated.

export interface AnimatedPoint extends GeoJsonObject {
  readonly type: 'Point';
  coordinates: (Animated.Value | number)[];
}

export interface AnimatedShape extends GeoJsonObject {
  readonly type: 'LineString';
  coordinates: (Animated.Value | number)[][];
}
