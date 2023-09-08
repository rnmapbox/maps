import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import { Double, Int32 } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  id: string;
  sourceID: string;
  filter: UnsafeMixed[];

  aboveLayerID: string;
  belowLayerID: string;
  layerIndex: Int32;
  reactStyle: UnsafeMixed;

  maxZoomLevel: Double;
  minZoomLevel: Double;
  sourceLayerID: string;
}

export default codegenNativeComponent<NativeProps>(
  'MBXFillExtrusionLayer',
) as HostComponent<NativeProps>;
