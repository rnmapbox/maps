import RNMBXCameraGestureObserverNativeComponent, {
  NativeProps,
} from '../specs/RNMBXCameraGestureObserverNativeComponent';

type Props = NativeProps;

/**
 * CameraGestureObserver
 *
 * Unified native observer optimized for onMapSteady.
 */
export default function CameraGestureObserver(props: Props) {
  return (
    <RNMBXCameraGestureObserverNativeComponent
      {...props}
      hasOnMapSteady={props.onMapSteady ? true : false}
    />
  );
}
