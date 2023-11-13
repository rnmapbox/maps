import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import type { Expression } from '../utils/MapboxStyles';

import { UnsafeMixed } from './codegenUtils';

type Value<T> = T | Expression;

// see https://github.com/rnmapbox/maps/wiki/FabricOptionalProp
type OptionalProp<T> = UnsafeMixed<T>;

export interface NativeProps extends ViewProps {
  androidRenderMode?: OptionalProp<string>;
  puckBearing?: OptionalProp<'heading' | 'course'>;
  puckBearingEnabled?: OptionalProp<boolean>;
  bearingImage?: OptionalProp<string>;
  shadowImage?: OptionalProp<string>;
  topImage?: OptionalProp<string>;
  scale?: UnsafeMixed<Value<number>>;
  visible?: boolean;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXNativeUserLocation',
) as HostComponent<NativeProps>;
