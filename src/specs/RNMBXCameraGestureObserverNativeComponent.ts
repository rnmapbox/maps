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

export type OnMapCameraChangeEvent = {
  properties: {
    // [longitude, latitude]
    center: Double[];
    bounds: {
      // northeast corner [longitude, latitude]
      ne: Double[];
      // southwest corner [longitude, latitude]
      sw: Double[];
    };
    zoom: Double;
    heading: Double;
    pitch: Double;
  };
  // true if the camera change was initiated by user interaction (e.g., gesture)
  isUserInteraction: boolean;
  // Unix epoch in milliseconds
  timestamp?: Double;
};

export interface NativeProps extends ViewProps {
  quietPeriodMs?: UnsafeMixed<number>;
  maxIntervalMs?: UnsafeMixed<number>;

  hasOnMapSteady: UnsafeMixed<boolean>;
  onMapSteady?: DirectEventHandler<OnMapSteadyEvent>;
  hasOnMapCameraChange: UnsafeMixed<boolean>;
  onMapCameraChange?: DirectEventHandler<OnMapCameraChangeEvent>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXCameraGestureObserver',
);
