import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

type OnImageMissingEventType = { type: string; payload: { imageKey: string } };

export interface NativeProps extends ViewProps {
  images: UnsafeMixed<any>;
  nativeImages: UnsafeMixed<Array<any>>;
  hasOnImageMissing: UnsafeMixed<boolean>;
  onImageMissing: DirectEventHandler<OnImageMissingEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXImages',
) as HostComponent<NativeProps>;
