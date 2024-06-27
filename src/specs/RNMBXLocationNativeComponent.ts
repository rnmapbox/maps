/***
rnmbxcodegen: true
javapkg: com.rnmapbox.rnmbx.components.location
***/
import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import { Double } from 'react-native/Libraries/Types/CodegenTypes';

export type OnLocationChangeEventType = {
  altitude: Double;
  longitude: Double;
  latitude: Double;
  timestamp: Double;
};

export type OnBearingChangeEventType = {
  direction: Double; // The bearing direction (measured in degrees) relative to true or magnetic north.
  accuracy?: Double; // The maximum deviation (measured in degrees) between the reported bearing and the true geomagnetic bearing.
  timestamp: Double; // The time at which this heading was determined.
};

export interface NativeProps extends ViewProps {
  onBearingChange?: DirectEventHandler<OnBearingChangeEventType>;
  hasOnBearingChange: boolean;
  onLocationChange?: DirectEventHandler<OnLocationChangeEventType>;
  hasOnLocationChange: boolean;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXLocation',
) as HostComponent<NativeProps>;
