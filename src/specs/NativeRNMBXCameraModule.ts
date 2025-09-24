import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

type ViewRef = CodegenTypes.Int32 | null;

interface NativeCameraStop {
  centerCoordinate?: string;
  bounds?: string;
  heading?: number;
  pitch?: number;
  zoom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  duration?: number;
  mode?: number;
}

type Stop =
  | {
      stops: NativeCameraStop[];
    }
  | NativeCameraStop;

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars
type ObjectOr<T> = Object;

export interface Spec extends TurboModule {
  updateCameraStop(viewRef: ViewRef, stop: ObjectOr<Stop>): Promise<void>;
  moveBy: (
    viewRef: ViewRef,
    x: number,
    y: number,
    animationMode: number,
    animationDuration: number,
  ) => Promise<void>;
  scaleBy: (
    viewRef: ViewRef,
    x: number,
    y: number,
    animationMode: number,
    animationDuration: number,
    scaleFactor: number,
  ) => Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNMBXCameraModule');
