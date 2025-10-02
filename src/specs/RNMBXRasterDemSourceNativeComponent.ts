import type { HostComponent, ViewProps } from 'react-native';
// @ts-ignore - CI environment type resolution issue for CodegenTypes
import { Double } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  id: UnsafeMixed<string>;
  existing: UnsafeMixed<boolean>;
  url: UnsafeMixed<string>;
  tileUrlTemplates: UnsafeMixed<Array<string>>;
  minZoomLevel: UnsafeMixed<Double>;
  maxZoomLevel: UnsafeMixed<Double>;
  tileSize: UnsafeMixed<Double>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXRasterDemSource',
) as unknown as HostComponent<NativeProps>;
