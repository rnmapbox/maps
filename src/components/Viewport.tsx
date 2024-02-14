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
   * @default DEFAULT_FOLLOW_PUCK_VIEWPORT_STATE_ZOOM.
   */
  zoom?: number | 'keep';

  /**
   * The value to use for setting pitch. If 'keep', pitch will not be modified by the FollowPuckViewportState.
   * @default DEFAULT_FOLLOW_PUCK_VIEWPORT_STATE_PITCH degrees.
   */
  pitch?: number | 'keep';

  /**
   * Indicates how to obtain the value to use for bearing when setting the camera.
   * If set to 'keep', bearing will not be modified by the FollowPuckViewportState.
   *  - heading: sets bearing to the heading of the device
   *  - course: sets bearing based on the direction of travel
   *  - number: sets the camera bearing to the constant value on every frame
   *
   * On Android, 'heading' and 'coruse' sets the camera bearing to the same as the location puck's bearing. See
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
   * The length of the animation performed by in seconds ``OverviewViewportState`` when it starts updating
   * the camera.
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
  getState(): Promise<string>;
  idle(): Promise<void>;
  transitionTo(
    state: ViewportState,
    transition?: ViewportTransition,
  ): Promise<boolean>;
}

/**
 * provides a structured approach to organizing camera management logic into states and transitions between them.
 *
 * At any given time, the viewport is either:
 *  - idle
 *  - in a state (camera is being managed by a ViewportState)
 *  - transitioning between states
 *
 * See [android](https://docs.mapbox.com/android/maps/api/${ANDROID_SDK_VERSION}/mapbox-maps-android/com.mapbox.maps.plugin.viewport/viewport.html),
 * [ios](https://docs.mapbox.com/ios/maps/api/${IOS_SDK_VERSION}/Viewport.html#/s:10MapboxMaps8ViewportC)
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
      getState() {
        console.log(' => calling getState');
        return commands.call<string>('getState', []);
      },
      async idle() {
        return commands.call<void>('idle', []);
      },
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
