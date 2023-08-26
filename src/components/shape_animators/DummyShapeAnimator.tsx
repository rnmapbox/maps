import React, { ReactNode, ReactElement } from 'react';
import { requireNativeComponent } from 'react-native';

import { Position } from '../../types/Position';

interface Props {
  /**
   * The center point (specified as a map coordinate) of the annotation.
   */
  from: Position;

  /**
   * The center point (specified as a map coordinate) of the annotation.
   */
  to: Position;

  /**
   * children components, only accepts ShapeSource
   */
  children?: React.ReactElement | React.ReactElement[];
}

export default class DummyShapeAnimator extends React.PureComponent<Props> {
  render(): ReactNode {
    const { props } = this;
    return (
      <RCTMGLDummyShapeAnimator {...props}>
        {props.children}
      </RCTMGLDummyShapeAnimator>
    );
  }
}

type NativeProps = {
  from: Position;
  to: Position;
};

export const NATIVE_MODULE_NAME = 'RCTMGLDummyShapeAnimator';

const RCTMGLDummyShapeAnimator =
  requireNativeComponent<NativeProps>(NATIVE_MODULE_NAME);
