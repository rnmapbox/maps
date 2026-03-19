import type { HostComponent, ViewProps, CodegenTypes } from 'react-native';
import { codegenNativeComponent } from 'react-native';

import type { Position } from '../types/Position';

import { UnsafeMixed } from './codegenUtils';

// see https://github.com/rnmapbox/maps/wiki/FabricOptionalProp
type OptionalProp<T> = UnsafeMixed<T>;

export interface NativeProps extends ViewProps {
  coordinate?: OptionalProp<Position>;
  heading?: OptionalProp<CodegenTypes.Double>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXCustomLocationProvider',
) as HostComponent<NativeProps>;
