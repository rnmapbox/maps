import type { HostComponent, ViewProps, CodegenTypes } from 'react-native';
import { codegenNativeComponent } from 'react-native';

import { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  id: UnsafeMixed<string>;
  existing: UnsafeMixed<boolean>;
  url: UnsafeMixed<string>;
  tileUrlTemplates: UnsafeMixed<Array<string>>;
  minZoomLevel: UnsafeMixed<CodegenTypes.Double>;
  maxZoomLevel: UnsafeMixed<CodegenTypes.Double>;
  tileSize: UnsafeMixed<CodegenTypes.Double>;
  tms: UnsafeMixed<boolean>;
  attribution: UnsafeMixed<string>;
  sourceBounds: UnsafeMixed<Array<number>>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXRasterSource',
) as HostComponent<NativeProps>;
