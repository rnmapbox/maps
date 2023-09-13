import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  iosShowsUserHeadingIndicator?: boolean;
}

export default codegenNativeComponent<NativeProps>(
  'MBXNativeUserLocation',
) as HostComponent<NativeProps>;
