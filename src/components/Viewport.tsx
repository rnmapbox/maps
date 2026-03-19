import React, {
  Component,
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { type NativeMethods, type NativeSyntheticEvent } from 'react-native';

import NativeViewport, {
  type NativeViewportReal,
  type OnStatusChangedEventTypeReal,
} from '../specs/RNMBXViewportNativeComponent';
import RNMBXViewportModule from '../specs/NativeRNMBXViewportModule';
import { NativeCommands } from '../utils/NativeCommands';

type FollowPuckOptions = {
  /**
   * The value to use for setting zoom. If 'keep', zoom will not be modified by the FollowPuckViewportState.
   * @default ~16.35 (DEFAULT_FOLLOW_PUCK_VIEWPORT_STATE_ZOOM)
   */
  zoom?: number | 'keep';

  /**
   * The value to use for setting pitch. If 'keep', pitch will not be modified by the FollowPuckViewportState.
   * @default 0 degrees (top-down view)
   */
  pitch?: number | 'keep';

  /**
   * Indicates how to obtain the value to use for bearing when setting the camera.
   * If set to 'keep', bearing will not be modified by the FollowPuckViewportState.
   *  - heading: sets bearing to the heading (compass direction) of the device — the direction the device is facing
   *  - course: sets bearing to the course (direction of travel) — the direction the device is moving
   *  - number: sets the camera bearing to a constant value in degrees on every frame
   *
   * On Android, 'heading' and 'course' both set the camera bearing to the same as the location puck's bearing. See
   * [syncWithLocationPuck](https://docs.mapbox.com/android/maps/api/11.0.0/mapbox-maps-android/com.mapbox.maps.plugin.viewport.data/-follow-puck-viewport-state-bearing/-sync-with-location-puck/)
   *
   * @default 'heading'
   */
  bearing?: 'heading' | 'course' | number | 'keep';

  /**
   * The value to use for setting CameraOptions.padding. If 'keep', padding will not be modified by the FollowPuckViewportState.
   *
   * @default 0 padding
   */
  padding?:
    | {
        top?: number;
        left?: number;
        bottom?: number;
        right?: number;
      }
    | 'keep';
};

type OverviewOptions = {
  /**
   * The geometry that the ``OverviewViewportState`` should use when calculating its camera.
   */
  geometry: GeoJSON.Geometry;

  /**
   * The padding that ``OverviewViewportState`` should use when calculating its camera.
   *
   * @default 0 padding
   */
  padding?: {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
  };

  /**
   * The bearing that ``OverviewViewportState`` should use when calcualting its camera.
   */
  bearing?: number;

  /**
   * The pitch that ``OverviewViewportState`` should use when calculating its camera.
   */
  pitch?: number;

  /**
   * The length of the animation in seconds performed by ``OverviewViewportState`` when it starts updating
   * the camera. Defaults to 0.
   */
  animationDuration?: number;
};

type ViewportState =
  | {
      kind: 'followPuck';
      options?: FollowPuckOptions;
    }
  | {
      kind: 'overview';
      options?: OverviewOptions;
    };

type ViewportStatus =
  | {
      kind: 'idle';
    }
  | {
      kind: 'transition';
      toState: ViewportState;
      transition: ViewportTransition;
    };

type ViewportTransition =
  | {
      kind: 'immediate';
    }
  | {
      kind: 'default';
      maxDurationMs?: number;
    };

type ViewportStatusChangeReason =
  | 'TransitionStarted'
  | 'TransitionSucceeded'
  | 'IdleRequested'
  | 'UserInteraction';

type ViewportStatusChangedEvent = {
  from: ViewportStatus;
  to: ViewportStatus;
  reason: ViewportStatusChangeReason;
};

type Props = {
  /**
   * Indicates whether the Viewport should idle when the MapView receives touch input.
   *
   * Set this property to false to enable building custom ViewportStates that can work simultaneously with certain types of gestures.
   *
   * Defaults to true.
   */
  transitionsToIdleUponUserInteraction?: boolean;

  /**
   * Subscribes to status changes, will be called when the status changes.
   *
   * Observers are notified of status changes asynchronously on the main queue.
   * This means that by the time the notification is delivered, the status may have already changed again.
   * This behavior is necessary to allow observers to trigger further transitions while avoiding out-of-order
   * delivery of status changed notifications.
   *
   */
  onStatusChanged?: (event: ViewportStatusChangedEvent) => void;
};

export interface Ref {
  /**
   * Returns the current state of the viewport as a JSON string.
   *
   * @return {Promise<string>} The current viewport state.
   *
   * @example
   * const state = await viewport.current.getState();
   */
  getState(): Promise<string>;

  /**
   * Sets the viewport to idle, stopping any active state or transition.
   * When idle, the viewport does not manage the camera. If
   * `transitionsToIdleUponUserInteraction` is true (default), this is
   * also called automatically when the user interacts with the map.
   *
   * @example
   * await viewport.current.idle();
   */
  idle(): Promise<void>;

  /**
   * Transitions the viewport to a new state with an optional transition animation.
   *
   * @param {ViewportState} state The target state — either `{ kind: 'followPuck', options }` or `{ kind: 'overview', options }`.
   * @param {ViewportTransition} transition The transition to use — `{ kind: 'immediate' }` or `{ kind: 'default', maxDurationMs }`. Defaults to `{ kind: 'default' }`.
   * @return {Promise<boolean>} Resolves to `true` if the transition completes successfully, `false` if interrupted.
   *
   * @example
   * // Follow user location
   * await viewport.current.transitionTo(
   *   { kind: 'followPuck', options: { zoom: 16, bearing: 'heading' } },
   *   { kind: 'default', maxDurationMs: 1000 }
   * );
   *
   * @example
   * // Overview a route geometry
   * await viewport.current.transitionTo(
   *   { kind: 'overview', options: { geometry: routeGeoJSON, padding: { top: 50, bottom: 50, left: 50, right: 50 } } },
   *   { kind: 'immediate' }
   * );
   */
  transitionTo(
    state: ViewportState,
    transition?: ViewportTransition,
  ): Promise<boolean>;
}

/**
 * Provides a structured approach to organizing camera management logic into states and transitions between them.
 *
 * Viewport is the modern alternative to Camera's `followUserLocation` for tracking the user's position.
 * It supports two built-in states:
 *  - `followPuck`: tracks the user's location with configurable zoom, pitch, and bearing
 *  - `overview`: frames a given geometry with configurable padding, bearing, and pitch
 *
 * At any given time, the viewport is either:
 *  - idle (not managing the camera)
 *  - in a state (camera is actively managed by a ViewportState)
 *  - transitioning between states
 *
 * See [Android Viewport](https://docs.mapbox.com/android/maps/api/11.0.0/mapbox-maps-android/com.mapbox.maps.plugin.viewport/viewport.html),
 * [iOS Viewport](https://docs.mapbox.com/ios/maps/api/11.0.0/Viewport.html)
 */
export const Viewport = memo(
  forwardRef<Ref, Props>((props: Props, ref: React.ForwardedRef<Ref>) => {
    const commands = useMemo(() => new NativeCommands(RNMBXViewportModule), []);
    const nativeViewport = useRef<RNMBXViewportRefType>(null);
    useEffect(() => {
      if (nativeViewport.current) {
        commands.setNativeRef(nativeViewport.current);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [commands, nativeViewport.current]);

    useImperativeHandle(ref, () => ({
      /**
       * Returns the current state of the viewport as a JSON string.
       * @return {Promise<string>} The current viewport state.
       */
      getState() {
        console.log(' => calling getState');
        return commands.call<string>('getState', []);
      },
      /**
       * Sets the viewport to idle, stopping any active state or transition.
       */
      async idle() {
        return commands.call<void>('idle', []);
      },
      /**
       * Transitions the viewport to a new state with an optional transition animation.
       * @param {ViewportState} state The target state (followPuck or overview).
       * @param {ViewportTransition} transition The transition to use (immediate or default).
       * @return {Promise<boolean>} true if completed, false if interrupted.
       */
      transitionTo(state, transition) {
        return commands.call<boolean>('transitionTo', [state, transition]);
      },
    }));

    const onStatusChangedNative = useMemo(() => {
      const propsOnStatusChanged = props.onStatusChanged;
      if (propsOnStatusChanged != null) {
        return (event: NativeSyntheticEvent<OnStatusChangedEventTypeReal>) => {
          propsOnStatusChanged(event.nativeEvent.payload);
        };
      } else {
        return undefined;
      }
    }, [props.onStatusChanged]);

    return (
      <RNMBXViewport
        {...props}
        hasStatusChanged={props.onStatusChanged != null}
        // @ts-ignore - DirectEventHandler type signature mismatch with React Native's event system
        // The handler function signature is correct but doesn't match the strict DirectEventHandler type
        onStatusChanged={onStatusChangedNative}
        ref={nativeViewport}
      />
    );
  }),
);
export type Viewport = Ref;

type NativeProps = Omit<Props, 'onStatusChanged'> & {
  hasStatusChanged: boolean;
  onStatusChanged?: (
    event: NativeSyntheticEvent<{
      type: string;
      payload: ViewportStatusChangedEvent;
    }>,
  ) => void;
};

type RNMBXViewportRefType = Component<NativeProps> & Readonly<NativeMethods>;

const RNMBXViewport = NativeViewport as NativeViewportReal;
