import type { HostComponent, ViewProps, CodegenTypes } from 'react-native';
import { codegenNativeComponent } from 'react-native';

import type { UnsafeMixed } from './codegenUtils';

type OnMapboxVectorSourcePressEventType = { type: string; payload: string };

export interface NativeProps extends ViewProps {
  id: UnsafeMixed<string>;
  existing: UnsafeMixed<boolean>;
  url: UnsafeMixed<string>;
  tileUrlTemplates: UnsafeMixed<Array<string>>;
  attribution: UnsafeMixed<string>;
  maxZoomLevel: UnsafeMixed<CodegenTypes.Double>;
  minZoomLevel: UnsafeMixed<CodegenTypes.Double>;
  tms: UnsafeMixed<boolean>;
  hasPressListener: UnsafeMixed<boolean>;
  hitbox: UnsafeMixed<any>;
  onMapboxVectorSourcePress: CodegenTypes.DirectEventHandler<OnMapboxVectorSourcePressEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXVectorSource',
) as HostComponent<NativeProps>;
