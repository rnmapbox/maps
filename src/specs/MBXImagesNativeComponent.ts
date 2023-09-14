import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

type OnImageMissingEventType = { type: string; payload: { imageKey: string } };

export interface NativeProps extends ViewProps {
  images: UnsafeMixed;
  nativeImages: Array<UnsafeMixed>;
  onImageMissing: DirectEventHandler<OnImageMissingEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'MBXImages',
) as HostComponent<NativeProps>;
