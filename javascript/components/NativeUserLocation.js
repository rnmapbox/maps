import React from 'react';
import { requireNativeComponent } from 'react-native';
import PropTypes from 'prop-types';

const NATIVE_MODULE_NAME = 'RCTMGLNativeUserLocation';

class NativeUserLocation extends React.Component {
  static propTypes = {
    /**
     * Android render mode.
     *
     *  - normal: just a circle
     *  - compass: triangle with heading
     *  - gps: large arrow
     *
     * @platform android
     */
    androidRenderMode: PropTypes.oneOf(['normal', 'compass', 'gps']),

    /**
     * iOS only. A Boolean value indicating whether the user location annotation may display a permanent heading indicator.
     *
     * @platform ios
     */
    iosShowsUserHeadingIndicator: PropTypes.bool,
  };

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
