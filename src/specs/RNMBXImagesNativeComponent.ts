import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
// @ts-ignore - CI environment type resolution issue for CodegenTypes
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

type OnImageMissingEventType = {
  type: string;
  payloadRenamed: { imageKey: string };
};

export interface NativeProps extends ViewProps {
  images: UnsafeMixed<any>;
  nativeImages: UnsafeMixed<Array<any>>;
  hasOnImageMissing: UnsafeMixed<boolean>;
  onImageMissing: DirectEventHandler<OnImageMissingEventType>;
}

// @ts-ignore-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>(
  'RNMBXImages',
) as HostComponent<NativeProps>;
