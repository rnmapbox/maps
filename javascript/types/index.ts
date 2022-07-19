import { SyntheticEvent } from 'react';

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
