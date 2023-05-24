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

export const NATIVE_MODULE_NAME = 'RCTMGLAnimatedLineSource';

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

/**
 * AnimatedLineSource is a map content source that supplies an animatable GeoJSON line string to be shown on the map.
 */
export class AnimatedLineSource extends NativeBridgeComponent(
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
      lineStringSerialized: undefined,
    };
  }

  componentDidMount() {
    this.setLineStringSerialized();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.lineString !== prevProps.lineString) {
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
    // @ts-expect-error State is not typed.
    if (!this.state.lineStringSerialized) {
      return null;
    }

    return (
      <RCTMGLAnimatedLineSource
        id={this.props.id}
        // @ts-expect-error State is not typed.
        lineString={this.state.lineStringSerialized}
        startOffset={this.props.startOffset}
        endOffset={this.props.endOffset}
        animationDuration={this.props.animationDuration}
      >
        {cloneReactChildrenWithProps(this.props.children, {
          sourceID: this.props.id,
        })}
      </RCTMGLAnimatedLineSource>
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

const RCTMGLAnimatedLineSource =
  requireNativeComponent<NativeProps>(NATIVE_MODULE_NAME);
