import { Position } from 'geojson';
import { SyntheticEvent } from 'react';

// General.

export type MapboxGLEvent<
  T extends string,
  P = GeoJSON.Feature,
  V = Element,
> = SyntheticEvent<V, { type: T; payload: P }>;

// Camera.

export type CameraStop = {
  /** Allows static check of the data type. For internal use only. */
  readonly type?: 'CameraStop';
  /** The location on which the map should center. */
  centerCoordinate?: Position;
  /** The corners of a box around which the map should bound. Contains padding props for backwards
   * compatibility; the root `padding` prop should be used instead. */
  bounds?: CameraBoundsWithPadding;
  /** The heading (orientation) of the map. */
  heading?: number;
  /** The pitch of the map. */
  pitch?: number;
  /** The zoom level of the map. */
  zoomLevel?: number;
  /** The viewport padding in points. */
  padding?: CameraPadding;
  /** The duration the map takes to animate to a new configuration. */
  animationDuration?: number;
  /** The easing or path the camera uses to animate to a new configuration. */
  animationMode?: CameraAnimationMode;
};

export type CameraFollowConfig = {
  /** The mode used to track the user location on the map. */
  followUserMode?: UserTrackingMode;
  /** Whether the map orientation follows the user location. */
  followUserLocation?: boolean;
  /** The zoom level used when following the user location. */
  followZoomLevel?: number;
  /** The pitch used when following the user location. */
  followPitch?: number;
  /** The heading used when following the user location. */
  followHeading?: number;
};

export type CameraMinMaxConfig = {
  /** The lowest allowed zoom level. */
  minZoomLevel?: number;
  /** The highest allowed zoom level. */
  maxZoomLevel?: number;
  /** The corners of a box defining the limits of where the camera can pan or zoom. */
  maxBounds?: {
    ne: Position;
    sw: Position;
  };
};

export type CameraBounds = {
  ne: Position;
  sw: Position;
};

export type CameraPadding = {
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
};

export type CameraBoundsWithPadding = Partial<CameraPadding> & CameraBounds;

export type CameraStops = {
  /** Allows static check of the data type. For internal use only. */
  readonly type: 'CameraStops';
  stops: CameraStop[];
};

export type CameraAnimationMode = 'flyTo' | 'easeTo' | 'linearTo' | 'moveTo';

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
