import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import type { Position } from '../types/Position';

import { UnsafeMixed } from './codegenUtils';

// see https://github.com/rnmapbox/maps/wiki/FabricOptionalProp
type OptionalProp<T> = UnsafeMixed<T>;

export interface NativeProps extends ViewProps {
  coordinate?: OptionalProp<Position>;
  heading?: OptionalProp<number>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXCustomLocationProvider',
) as HostComponent<NativeProps>;
