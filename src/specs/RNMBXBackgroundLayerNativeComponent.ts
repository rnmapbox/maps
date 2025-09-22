import type { HostComponent, ViewProps, CodegenTypes } from 'react-native';
import { codegenNativeComponent } from 'react-native';

import type { UnsafeMixed } from './codegenUtils';

// see https://github.com/rnmapbox/maps/wiki/FabricOptionalProp
type OptionalProp<T> = UnsafeMixed<T>;

export interface NativeProps extends ViewProps {
  id: UnsafeMixed<string>;
  sourceID: UnsafeMixed<string>;
  existing?: OptionalProp<boolean>;
  filter: UnsafeMixed<any[]>;

  aboveLayerID?: OptionalProp<string>;
  belowLayerID?: OptionalProp<string>;
  layerIndex?: OptionalProp<CodegenTypes.Int32>;
  reactStyle: UnsafeMixed<any>;

  maxZoomLevel?: OptionalProp<CodegenTypes.Double>;
  minZoomLevel?: OptionalProp<CodegenTypes.Double>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXBackgroundLayer',
) as HostComponent<NativeProps>;
