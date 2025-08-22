import type { HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';
import type { Double, Int32 } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

// see https://github.com/rnmapbox/maps/wiki/FabricOptionalProp
type OptionalProp<T> = UnsafeMixed<T>;

export interface NativeProps extends ViewProps {
  id?: OptionalProp<string>;
  sourceID?: OptionalProp<string>;
  existing?: OptionalProp<boolean>;
  filter: UnsafeMixed<Array<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
  
  aboveLayerID?: OptionalProp<string>;
  belowLayerID?: OptionalProp<string>;
  layerIndex?: OptionalProp<Int32>;
  reactStyle?: OptionalProp<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  maxZoomLevel?: OptionalProp<Double>;
  minZoomLevel?: OptionalProp<Double>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXSkyLayer',
) as HostComponent<NativeProps>;
