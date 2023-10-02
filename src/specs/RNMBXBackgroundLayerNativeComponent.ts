import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import { Double, Int32 } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  id: UnsafeMixed<string>;
  sourceID: UnsafeMixed<string>;
  existing: UnsafeMixed<boolean>;
  filter: UnsafeMixed<any[]>;

  aboveLayerID: UnsafeMixed<string>;
  belowLayerID: UnsafeMixed<string>;
  layerIndex: UnsafeMixed<Int32>;
  reactStyle: UnsafeMixed<any>;

  maxZoomLevel: UnsafeMixed<Double>;
  minZoomLevel: UnsafeMixed<Double>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXBackgroundLayer',
) as HostComponent<NativeProps>;
