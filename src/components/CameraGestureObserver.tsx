import { memo } from 'react';
import type { ViewProps } from 'react-native';
import RNMBXCameraGestureObserverNativeComponent, {
  type OnCameraChangedEvent,
  type OnMapSteadyEvent,
} from '../specs/RNMBXCameraGestureObserverNativeComponent';

type Props = ViewProps & {
  /**
   * Time in milliseconds to wait after last camera change before emitting 'steady' event.
   * Default is 200ms.
   */
  quietPeriodMs?: number;

  /**
   * Maximum time in milliseconds before emitting 'timeout' event during continuous activity.
   */
  maxIntervalMs?: number;

  /**
   * Callback when the map reaches a steady state (no active gestures or animations).
   */
  onMapSteady?: (event: { nativeEvent: OnMapSteadyEvent }) => void;

  /**
   * Callback on every camera change. The state matches MapView#onCameraChanged, plus `properties.isUserInteraction`.
   *
   * `properties.isUserInteraction` is true while a user gesture is active or the map is still
   * animating from one (fling/deceleration, double-tap zoom). Camera changes from your own code,
   * like Camera#setCamera or a following Viewport, are not user interaction.
   */
  onCameraChanged?: (event: { nativeEvent: OnCameraChangedEvent }) => void;
};

/**
 * CameraGestureObserver
 *
 * Unified native observer optimized for onMapSteady and onCameraChanged.
 */
export default memo((props: Props) => {
  return (
    <RNMBXCameraGestureObserverNativeComponent
      {...props}
      hasOnMapSteady={props.onMapSteady ? true : false}
      hasOnCameraChanged={props.onCameraChanged ? true : false}
    />
  );
});
