import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
// @ts-ignore - CI environment type resolution issue for CodegenTypes
import { Double } from 'react-native/Libraries/Types/CodegenTypes';

import type { Position } from '../types/Position';

import { UnsafeMixed } from './codegenUtils';

// see https://github.com/rnmapbox/maps/wiki/FabricOptionalProp
type OptionalProp<T> = UnsafeMixed<T>;

export interface NativeProps extends ViewProps {
  coordinate?: OptionalProp<Position>;
  heading?: OptionalProp<Double>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXCustomLocationProvider',
) as unknown as HostComponent<NativeProps>;
