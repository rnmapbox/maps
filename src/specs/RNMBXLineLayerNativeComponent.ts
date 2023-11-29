import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import { Double, Int32 } from 'react-native/Libraries/Types/CodegenTypes';

import { FilterExpression } from '../utils/MapboxStyles';

import type { UnsafeMixed } from './codegenUtils';

// @{codepart-replace-start(CommonLayerNativeComponentsProps.codepart-ts)}
// see https://github.com/rnmapbox/maps/wiki/FabricOptionalProp
type OptionalProp<T> = UnsafeMixed<T>;
type Slot = 'bottom' | 'middle' | 'top';

type CommonProps = {
  sourceID?: OptionalProp<string>;
  existing?: OptionalProp<boolean>;
  filter?: UnsafeMixed<FilterExpression>;

  aboveLayerID?: OptionalProp<string>;
  belowLayerID?: OptionalProp<string>;
  layerIndex?: OptionalProp<Int32>;

  maxZoomLevel?: OptionalProp<Double>;
  minZoomLevel?: OptionalProp<Double>;
  sourceLayerID?: OptionalProp<string>;
  slot?: OptionalProp<Slot>;
};
// @{codepart-replace-end}

export interface NativeProps extends ViewProps, CommonProps {
  id?: OptionalProp<string>;
  reactStyle: UnsafeMixed<any>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXLineLayer',
) as HostComponent<NativeProps>;
