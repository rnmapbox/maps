import React, { PropTypes } from 'react';
import {
  View,
  requireNativeComponent,
  StyleSheet,
  Platform,
  NativeModules,
  Animated,
  findNodeHandle,
} from 'react-native';

import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

const viewConfig = {
  uiViewClassName: 'RCTMapboxAnnotation',
  validAttributes: {
    coordinate: true,
  },
};

const propTypes = {
  ...View.propTypes,
  
  title: PropTypes.string,
  subtitle: PropTypes.string,
  coordinate: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }).isRequired,
  
};

class MapboxAnnotation extends React.Component {
   
  render() {
    return (
      <RCTMapboxAnnotation
        ref={ref => { this.marker = ref; }}
        {...this.props}
        style={[styles.marker, this.props.style]}
      />
    );
  }
}

MapboxAnnotation.propTypes = propTypes;
MapboxAnnotation.viewConfig = viewConfig;

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});

const RCTMapboxAnnotation = requireNativeComponent('RCTMapboxAnnotation', MapboxAnnotation);
module.exports = MapboxAnnotation;
