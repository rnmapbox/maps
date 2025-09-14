import type { HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NativeProps extends ViewProps {}

export default codegenNativeComponent<NativeProps>(
  'RNMBXMarkerViewContent',
) as HostComponent<ViewProps>;
