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

export const NATIVE_MODULE_NAME = 'RCTMGLLineSource';

export type Props = {
  /**
   * A string that uniquely identifies the source.
   */
  id: string;

  /**
   * The contents of the line.
   */
  lineString?: GeoJSON.LineString;

  startOffset?: number;
  endOffset?: number;

  duration?: number;

  children?: React.ReactElement | React.ReactElement[];
};

/**
 * LineSource is a map content source that supplies a GeoJSON line string to be shown on the map.
 */
export class LineSource extends NativeBridgeComponent(
  AbstractSource<Props, NativeProps>,
  NATIVE_MODULE_NAME,
) {
  static defaultProps = {
    id: MapboxGL.StyleSource.DefaultSourceID,
    startOffset: 0,
    endOffset: 0,
    duration: 1000,
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
    if (!this.props.lineString) {
      return null;
    }

    const props: NativeProps = {
      id: this.props.id,
      lineString: toJSONString(this.props.lineString),
      startOffset: this.props.startOffset,
      endOffset: this.props.endOffset,
      duration: this.props.duration,
    };

    return (
      <RCTMGLLineSource {...props}>{this._getChildren()}</RCTMGLLineSource>
    );
  }
}

type NativeProps = {
  id: string;
  lineString?: string;
  startOffset?: number;
  endOffset?: number;
  duration?: number;
};

const RCTMGLLineSource =
  requireNativeComponent<NativeProps>(NATIVE_MODULE_NAME);
