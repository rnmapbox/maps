import { memo } from 'react';
import type { ViewProps } from 'react-native';
import RNMBXCameraGestureObserverNativeComponent, {
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
};

/**
 * CameraGestureObserver
 *
 * Unified native observer optimized for onMapSteady.
 */
export default memo((props: Props) => {
  return (
    <RNMBXCameraGestureObserverNativeComponent
      {...props}
      hasOnMapSteady={props.onMapSteady ? true : false}
    />
  );
});
