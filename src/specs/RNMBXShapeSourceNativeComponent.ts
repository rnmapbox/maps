import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import {
  DirectEventHandler,
  Double,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

type OnMapboxShapeSourcePressEventType = { type: string; payload: string };

export interface NativeProps extends ViewProps {
  id: UnsafeMixed<string>;
  existing: UnsafeMixed<boolean>;
  url: UnsafeMixed<string>;
  shape: UnsafeMixed<string>;
  cluster: UnsafeMixed<Int32>;
  clusterRadius: UnsafeMixed<Double>;
  clusterMaxZoomLevel: UnsafeMixed<Double>;
  clusterProperties: UnsafeMixed<any>;
  maxZoomLevel: UnsafeMixed<Double>;
  buffer: UnsafeMixed<Double>;
  tolerance: UnsafeMixed<Double>;
  lineMetrics: UnsafeMixed<boolean>;
  hasPressListener: UnsafeMixed<boolean>;
  hitbox: UnsafeMixed<any>;
  onMapboxShapeSourcePress: DirectEventHandler<OnMapboxShapeSourcePressEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXShapeSource',
) as HostComponent<NativeProps>;
