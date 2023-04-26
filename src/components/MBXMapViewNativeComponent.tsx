import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import {
  WithDefault,
  DirectEventHandler,
} from 'react-native/Libraries/Types/CodegenTypes';

/// see
// https://github.com/react-native-webview/react-native-webview/blob/681aac4fe7e35834264daa01b67a9893c4a9ebe7/src/RNCWebViewNativeComponent.ts#L4
// for complex example

type OnPressEventType = { payload: string };
type OnWillStartLoadingType = { payload: boolean };

export interface NativeProps extends ViewProps {
  // add other props here
  contentInset?: ReadonlyArray<number>;

  projection?: WithDefault<'mercator' | 'globe', 'mercator'>;

  styleURL?: string;

  onWillStartLoadingMap?: DirectEventHandler<OnWillStartLoadingType>;

  onPress?: DirectEventHandler<OnPressEventType>;
  //
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXMapView',
) as HostComponent<NativeProps>;
