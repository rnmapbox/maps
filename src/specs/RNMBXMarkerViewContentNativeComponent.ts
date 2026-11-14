import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {}

// interfaceOnly: the shadow node is custom, see
// cpp/react/renderer/components/rnmapbox_maps_specs/RNMBXMarkerViewContentShadowNode.h
// @ts-ignore-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>('RNMBXMarkerViewContent', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
