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
  id: string;
  existing: boolean;
  url: string;
  shape: string;
  cluster: Int32;
  clusterRadius: Double;
  clusterMaxZoomLevel: Double;
  clusterProperties: UnsafeMixed;
  maxZoomLevel: Double;
  buffer: Double;
  tolerance: Double;
  lineMetrics: boolean;
  images: UnsafeMixed; // unused ??
  nativeImages: Array<UnsafeMixed>; // unused ??
  hasPressListener: boolean;
  hitbox: UnsafeMixed;
  onMapboxShapeSourcePress: DirectEventHandler<OnMapboxShapeSourcePressEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'MBXShapeSource',
) as HostComponent<NativeProps>;
