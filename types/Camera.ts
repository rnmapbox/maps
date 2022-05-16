import type { MapboxGLEvent } from 'index';

export type CameraAnimationMode =
  | 'flyTo'
  | 'easeTo'
  | 'linearTo'
  | 'none'
  | 'moveTo';

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
