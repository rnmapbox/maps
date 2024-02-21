import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import { TurboModuleRegistry } from 'react-native';

type ViewRef = Int32 | null;

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
  mode?: NativeAnimationMode;
}

type Stop =
  | {
      stops: NativeCameraStop[];
    }
  | NativeCameraStop;

type NativeAnimationMode = 'flight' | 'ease' | 'linear' | 'none' | 'move';

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars
type ObjectOr<T> = Object;

export interface Spec extends TurboModule {
  updateCameraStop(viewRef: ViewRef, stop: ObjectOr<Stop>): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNMBXCameraModule');
