import type { HostComponent, ViewProps, CodegenTypes } from 'react-native';
import { codegenNativeComponent } from 'react-native';

import type { UnsafeMixed } from './codegenUtils';

type OnMapboxShapeSourcePressEventType = { type: string; payload: string };

export interface NativeProps extends ViewProps {
  id: UnsafeMixed<string>;
  existing: UnsafeMixed<boolean>;
  url: UnsafeMixed<string>;
  shape: UnsafeMixed<string>;
  cluster: UnsafeMixed<CodegenTypes.Int32>;
  clusterRadius: UnsafeMixed<CodegenTypes.Double>;
  clusterMaxZoomLevel: UnsafeMixed<CodegenTypes.Double>;
  clusterProperties: UnsafeMixed<any>;
  maxZoomLevel: UnsafeMixed<CodegenTypes.Double>;
  buffer: UnsafeMixed<CodegenTypes.Double>;
  tolerance: UnsafeMixed<CodegenTypes.Double>;
  lineMetrics: UnsafeMixed<boolean>;
  hasPressListener: UnsafeMixed<boolean>;
  hitbox: UnsafeMixed<any>;
  onMapboxShapeSourcePress: CodegenTypes.DirectEventHandler<OnMapboxShapeSourcePressEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXShapeSource',
) as HostComponent<NativeProps>;
