import type { HostComponent, ViewProps } from 'react-native';
import { Double } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  id: string;
  existing: boolean;
  url: string;
  tileUrlTemplates: Array<string>;
  minZoomLevel: Double;
  maxZoomLevel: Double;
  tileSize: Double;
}

export default codegenNativeComponent<NativeProps>(
  'MBXRasterDemSource',
) as HostComponent<NativeProps>;
