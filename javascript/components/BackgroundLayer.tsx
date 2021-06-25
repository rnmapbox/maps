import React from 'react';
import { NativeModules, requireNativeComponent } from 'react-native';

import { BackgroundLayerStyle } from '../../index';

import AbstractLayer from './AbstractLayer';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLBackgroundLayer';

interface BackgroundLayerProps {
  id: string;
  sourceID?: string;
  reactStyle: {};
  minZoomLevel?: number;
  maxZoomLevel?: number;
  aboveLayerID?: string;
  belowLayerID?: string;
  layerIndex?: number;
  filter?: any[];
  style: BackgroundLayerStyle;
  sourceLayerID?: string;
  children?: React.ReactNode;
}

class BackgroundLayer extends AbstractLayer {
  nativeLayer = null;

  _setNativeRef(nativeLayer: typeof NativeModules) {
    this.nativeLayer = nativeLayer;
  }

  render() {
    const bgProps: BackgroundLayerProps = {
      ...{ sourceID: MapboxGL.StyleSource.DefaultSourceID },
      ...this.baseProps,
    };

    return (
      <RCTMGLBackgroundLayer
        // @ts-ignore => FIXME: HostComponent does not have `testID` prop
        testID="rctmglBackgroundLayer"
        ref={(nativeLayer) => this._setNativeRef(nativeLayer)}
        {...bgProps}
      />
    );
  }
}

const RCTMGLBackgroundLayer = requireNativeComponent(
  NATIVE_MODULE_NAME,
  // @ts-ignore => FIXME: requireNativeComponent moved to just one argument
  BackgroundLayer,
  {
    nativeOnly: { reactStyle: true },
  },
);

export default BackgroundLayer;
