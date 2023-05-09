import React from 'react';
import {
  NativeMethods,
  NativeModules,
  requireNativeComponent,
} from 'react-native';

import { cloneReactChildrenWithProps, toJSONString } from '../utils';

import AbstractSource from './AbstractSource';
import NativeBridgeComponent from './NativeBridgeComponent';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLPointSource';

export type Props = {
  /** A string that uniquely identifies the source. */
  id: string;

  /** The point data. */
  point?: GeoJSON.Point;

  /** The duration in milliseconds to animate the point. If undefined or 0, changes are instantaneous.  */
  animationDuration?: number;

  /** One or more components to render with the point data. */
  children?: React.ReactElement | React.ReactElement[];
};

/**
 * PointSource is a map content source that supplies a GeoJSON point to be shown on the map.
 */
export class PointSource extends NativeBridgeComponent(
  AbstractSource<Props, NativeProps>,
  NATIVE_MODULE_NAME,
) {
  static defaultProps = {
    id: MapboxGL.StyleSource.DefaultSourceID,
    animationDuration: undefined,
  };

  constructor(props: Props) {
    super(props);
  }

  _setNativeRef(
    nativeRef: React.Component<NativeProps> & Readonly<NativeMethods>,
  ) {
    this.setNativeRef(nativeRef);
    super._runPendingNativeCommands(nativeRef);
  }

  setNativeProps(props: NativeProps) {
    const shallowProps = Object.assign({}, props);
    super.setNativeProps(shallowProps);
  }

  _getChildren() {
    return cloneReactChildrenWithProps(this.props.children, {
      sourceID: this.props.id,
    });
  }

  render() {
    if (!this.props.point) {
      return null;
    }

    const props: NativeProps = {
      id: this.props.id,
      point: toJSONString(this.props.point),
      animationDuration: this.props.animationDuration,
    };

    return (
      <RCTMGLPointSource {...props}>{this._getChildren()}</RCTMGLPointSource>
    );
  }
}

type NativeProps = {
  id: string;
  point?: string;
  animationDuration?: number;
};

const RCTMGLPointSource =
  requireNativeComponent<NativeProps>(NATIVE_MODULE_NAME);
