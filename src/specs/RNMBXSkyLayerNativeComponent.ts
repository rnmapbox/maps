import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
// @ts-ignore - CI environment type resolution issue for CodegenTypes
import { Double, Int32 } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

// see https://github.com/rnmapbox/maps/wiki/FabricOptionalProp
type OptionalProp<T> = UnsafeMixed<T>;

export interface NativeProps extends ViewProps {
  id?: OptionalProp<string>;
  sourceID?: OptionalProp<string>;
  existing?: OptionalProp<boolean>;
  filter: UnsafeMixed<any[]>;

  aboveLayerID?: OptionalProp<string>;
  belowLayerID?: OptionalProp<string>;
  layerIndex?: OptionalProp<Int32>;
  reactStyle?: OptionalProp<any>;

  maxZoomLevel?: OptionalProp<Double>;
  minZoomLevel?: OptionalProp<Double>;
}

// @ts-ignore-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>(
  'RNMBXSkyLayer',
) as HostComponent<NativeProps>;
