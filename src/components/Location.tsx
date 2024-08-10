import React from 'react';
import { NativeSyntheticEvent } from 'react-native';

import NativeLocation from '../specs/RNMBXLocationNativeComponent';
import type {
  OnLocationChangeEventType,
  OnHeadingChangeEventType
} from '../specs/RNMBXLocationNativeComponent';


type Props = {
  onHeadingChange: (event: OnHeadingChangeEventType['payload']) => void;
  onLocationChange: (event: OnLocationChangeEventType['payload']) => void;
};

export default function Location(props: Props) {
  const { onHeadingChange, onLocationChange, ...restOfProps } = props;
  const callbacks = {
    hasOnHeadingChange: false,
    hasOnLocationChange: false,
    ...(onHeadingChange != null
      ? {
          onHeadingChange: (
            event: NativeSyntheticEvent<OnHeadingChangeEventType>,
          ) => onHeadingChange(event.nativeEvent.payload),
          hasOnHeadingChange: true,
        }
      : {}),
    ...(onLocationChange != null
      ? {
          onLocationChange: (
            event: NativeSyntheticEvent<OnLocationChangeEventType>,
          ) => onLocationChange(event.nativeEvent),
          hasOnLocationChange: true,
        }
      : {}),
  };
  const actProps = { ...restOfProps, ...callbacks };
  console.log(' => actProps', actProps);
  return <NativeLocation {...actProps} />;
}
