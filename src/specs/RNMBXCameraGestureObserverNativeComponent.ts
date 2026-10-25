import type { ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
// @ts-ignore - CI environment type resolution issue for CodegenTypes
import { DirectEventHandler, Double, } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

export type OnMapSteadyEvent = {
  reason: 'steady' | 'timeout';
  // ms since last camera change when reason === 'steady'
  idleDurationMs?: Double;
  // e.g., 'pan' | 'pinch' | 'rotate' | 'pitch'
  lastGestureType?: string | null | undefined;
  // Unix epoch in milliseconds
  timestamp: Double;
};

export type OnCameraChangedEvent = {
  properties: {
    center: Double[];
    bounds: {
      ne: Double[];
      sw: Double[];
    };
    zoom: Double;
    heading: Double;
    pitch: Double;
    isUserInteraction: boolean;
  };
  gestures: {
    isGestureActive: boolean;
  };
  // Unix epoch in milliseconds
  timestamp: Double;
};

export interface NativeProps extends ViewProps {
  quietPeriodMs?: UnsafeMixed<number>;
  maxIntervalMs?: UnsafeMixed<number>;

  hasOnMapSteady: UnsafeMixed<boolean>;
  onMapSteady?: DirectEventHandler<OnMapSteadyEvent>;

  hasOnCameraChanged: UnsafeMixed<boolean>;
  onCameraChanged?: DirectEventHandler<OnCameraChangedEvent>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXCameraGestureObserver',
);
