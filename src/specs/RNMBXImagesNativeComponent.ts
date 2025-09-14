import type { HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

type OnImageMissingEventType = { type: string; payload: { imageKey: string } };

export interface NativeProps extends ViewProps {
  images: UnsafeMixed;
  nativeImages: UnsafeMixed<Array<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
  hasOnImageMissing: UnsafeMixed<boolean>;
  onImageMissing: DirectEventHandler<OnImageMissingEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXImages',
) as HostComponent<NativeProps>;
