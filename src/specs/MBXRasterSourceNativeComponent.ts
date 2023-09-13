import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import { Double } from 'react-native/Libraries/Types/CodegenTypes';

export interface NativeProps extends ViewProps {
  id: string;
  existing: boolean;
  url: string;
  tileUrlTemplates: Array<string>;
  tileSize: Double;
  maxZoomLevel: Double;
  minZoomLevel: Double;
  tms: boolean;
  attribution: string;
}

export default codegenNativeComponent<NativeProps>(
  'MBXRasterSource',
) as HostComponent<NativeProps>;
