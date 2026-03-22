import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
// @ts-ignore - CI environment type resolution issue for CodegenTypes
import { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

type OnAnnotationPositionEvent = {
  x: number;
  y: number;
};

export interface NativeProps extends ViewProps {
  // Fired by native when Mapbox repositions the annotation via setTranslationX/Y.
  // JS uses this to keep the Fabric shadow tree transform in sync so that
  // UIManager.measure returns the correct on-screen position for Pressable hit-testing.
  onAnnotationPosition?: DirectEventHandler<OnAnnotationPositionEvent>;
}

// @ts-ignore-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>(
  'RNMBXMarkerViewContent',
) as HostComponent<NativeProps>;
