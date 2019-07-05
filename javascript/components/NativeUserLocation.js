import React from 'react';
import {requireNativeComponent} from 'react-native';

const NATIVE_MODULE_NAME = 'RCTMGLNativeUserLocation';

class NativeUserLocation extends React.Component {
  render() {
    return <RCTMGLNativeUserLocation {...this.props} />;
  }
}

const RCTMGLNativeUserLocation = requireNativeComponent(
  NATIVE_MODULE_NAME,
  NativeUserLocation,
  {
    nativeOnly: {},
  },
);

export default NativeUserLocation;
