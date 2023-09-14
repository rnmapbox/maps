import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import {
  DirectEventHandler,
  Double,
} from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

type OnMapboxVectorSourcePressEventType = { type: string; payload: string };

export interface NativeProps extends ViewProps {
  id: string;
  existing: boolean;
  url: string;
  tileUrlTemplates: Array<string>;
  attribution: string;
  maxZoomLevel: Double;
  minZoomLevel: Double;
  tms: boolean;
  hasPressListener: boolean;
  hitbox: UnsafeMixed;
  onMapboxVectorSourcePress: DirectEventHandler<OnMapboxVectorSourcePressEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'MBXVectorSource',
) as HostComponent<NativeProps>;
