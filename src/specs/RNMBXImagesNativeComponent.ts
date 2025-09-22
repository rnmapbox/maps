import type { HostComponent, ViewProps, CodegenTypes } from 'react-native';
import { codegenNativeComponent } from 'react-native';

import type { UnsafeMixed } from './codegenUtils';

type OnImageMissingEventType = {
  type: string;
  payloadRenamed: { imageKey: string };
};

export interface NativeProps extends ViewProps {
  images: UnsafeMixed<any>;
  nativeImages: UnsafeMixed<Array<any>>;
  hasOnImageMissing: UnsafeMixed<boolean>;
  onImageMissing: CodegenTypes.DirectEventHandler<OnImageMissingEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXImages',
) as HostComponent<NativeProps>;
