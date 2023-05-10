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
  /** A string that uniquely identifies the source. */
  id: string;

  /** The line data. */
  lineString?: GeoJSON.LineString;

  /** The distance in meters to remove from the start of the line. */
  startOffset?: number;

  /** The distance in meters to remove from the end of the line. */
  endOffset?: number;

  /** The duration in milliseconds to animate the offsets. If undefined or 0, changes are instantaneous.  */
  animationDuration?: number;

  /** One or more components to render with the line data. */
  children?: React.ReactElement | React.ReactElement[];
};

type State = {
  lineStringSerialized: string;
};

/**
 * LineSource is a map content source that supplies a GeoJSON line string to be shown on the map.
 */
export class LineSource extends NativeBridgeComponent<Props, State, any>(
  AbstractSource<Props, NativeProps>,
  NATIVE_MODULE_NAME,
) {
  static defaultProps = {
    id: MapboxGL.StyleSource.DefaultSourceID,
    startOffset: 0,
    endOffset: 0,
    animationDuration: undefined,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      lineStringSerialized: '',
    };
  }

  componentDidMount() {
    this.setLineStringSerialized();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.lineString !== this.props.lineString) {
      this.setLineStringSerialized();
    }
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

  setLineStringSerialized() {
    this.setState({
      lineStringSerialized: toJSONString(this.props.lineString),
    });
  }

  render() {
    if (!this.props.lineString) {
      return null;
    }

    return (
      <RCTMGLLineSource
        id={this.props.id}
        lineString={this.state.lineStringSerialized}
        startOffset={this.props.startOffset}
        endOffset={this.props.endOffset}
        animationDuration={this.props.animationDuration}
      >
        {cloneReactChildrenWithProps(this.props.children, {
          sourceID: this.props.id,
        })}
      </RCTMGLLineSource>
    );
  }
}

type NativeProps = {
  id: string;
  lineString?: string;
  startOffset?: number;
  endOffset?: number;
  animationDuration?: number;
  children?: React.ReactElement | React.ReactElement[];
};

const RCTMGLLineSource =
  requireNativeComponent<NativeProps>(NATIVE_MODULE_NAME);
