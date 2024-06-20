import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import { Double } from 'react-native/Libraries/Types/CodegenTypes';

type OnHeadingChangeEventType = {
  type: string;
  direction: Double; // The heading direction (measured in degrees) relative to true or magnetic north.
  accuracy: Double; // The maximum deviation (measured in degrees) between the reported heading and the true geomagnetic heading.
  timestamp: Double; // The time at which this heading was determined.
};

export interface NativeProps extends ViewProps {
  onHeadingChange?: DirectEventHandler<OnHeadingChangeEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXLocation',
) as HostComponent<NativeProps>;
