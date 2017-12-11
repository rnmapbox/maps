import React from 'react';
import { NativeModules, requireNativeComponent } from 'react-native';

import {
  IS_ANDROID,
} from '../utils';

import MapView from './MapView';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLAndroidTextureMapView';

/**
 * MapView backed by Mapbox Native GL
 */
class AndroidTextureMapView extends MapView {  

  render () {
    let props = {
      ...this.props,
      centerCoordinate: this._getCenterCoordinate(),
      contentInset: this._getContentInset(),
    };

    const callbacks = {
      ref: (nativeRef) => this._nativeRef = nativeRef,
      onPress: this._onPress,
      onLongPress: this._onLongPress,
      onMapChange: this._onChange,
      onAndroidCallback: IS_ANDROID ? this._onAndroidCallback : undefined,
    };

    return (
      <RCTMGLAndroidTextureMapView {...props} {...callbacks}>
        {this.props.children}
      </RCTMGLAndroidTextureMapView>
    );
  }
}

const RCTMGLAndroidTextureMapView = requireNativeComponent(NATIVE_MODULE_NAME, AndroidTextureMapView, {
  nativeOnly: { onMapChange: true, onAndroidCallback: true },
});

export default AndroidTextureMapView;
