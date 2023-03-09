import React, { ReactNode } from 'react';
import { Animated as RNAnimated, Easing } from 'react-native';
import { Point } from 'geojson';

import Animated from '../../utils/animated/Animated';
import { AnimatedPoint } from '../../classes';
import { OnPressEvent } from '../../types/OnPressEvent';
import { SymbolLayerStyle } from '../../Mapbox';
import { SymbolLayer } from '../SymbolLayer';

import WithAnimatedObject = RNAnimated.WithAnimatedObject;

export type AnnotationProps = {
  id: string;
  animated?: boolean;
  animationDuration?: number;
  animationEasingFunction?: (x: number) => number;
  coordinates: number[];
  onPress?: (event: OnPressEvent) => void;
  children: ReactNode;
  style?: object;
  icon?: string | number | object;
};

type AnnotationState = {
  shape: Point | AnimatedPoint | null;
};

class Annotation extends React.Component<AnnotationProps, AnnotationState> {
  static defaultProps = {
    animated: false,
    animationDuration: 1000,
    animationEasingFunction: Easing.linear,
  };

  constructor(props: AnnotationProps) {
    super(props);

    const shape = this._getShapeFromProps(props);

    this.state = {
      shape: props.animated ? new AnimatedPoint(shape) : shape,
    };

    this.onPress = this.onPress.bind(this);
  }

  componentDidUpdate(prevProps: AnnotationProps) {
    if (!Array.isArray(this.props.coordinates)) {
      this.setState({ shape: null });
      return;
    }

    const haveCoordinatesChanged =
      prevProps.coordinates[0] !== this.props.coordinates[0] ||
      prevProps.coordinates[1] !== this.props.coordinates[1];

    if (
      prevProps.animated !== this.props.animated ||
      (haveCoordinatesChanged && (!this.state.shape || !this.props.animated))
    ) {
      const shape = this._getShapeFromProps(this.props);

      this.setState({
        shape: this.props.animated ? new AnimatedPoint(shape) : shape,
      });
    } else if (
      haveCoordinatesChanged &&
      this.props.animated &&
      this.state.shape
    ) {
      // flush current animations
      (this.state.shape as AnimatedPoint).stopAnimation();

      (this.state.shape as AnimatedPoint)
        .timing({
          coordinates: this.props.coordinates,
          easing: this.props.animationEasingFunction,
          duration: this.props.animationDuration,
        })
        .start();
    }
  }

  onPress(event: OnPressEvent) {
    if (this.props.onPress) {
      this.props.onPress(event);
    }
  }

  _getShapeFromProps(props: Partial<AnnotationProps> = {}): Point {
    const lng = props.coordinates?.[0] || 0;
    const lat = props.coordinates?.[1] || 0;
    return { type: 'Point', coordinates: [lng, lat] };
  }

  get symbolStyle(): SymbolLayerStyle | undefined {
    if (!this.props.icon) {
      return undefined;
    }
    return Object.assign({}, this.props.style, {
      iconImage: this.props.icon,
    });
  }

  render() {
    if (!this.props.coordinates) {
      return null;
    }

    return (
      <Animated.ShapeSource
        id={this.props.id}
        onPress={this.onPress}
        shape={this.state.shape as WithAnimatedObject<Point>}
      >
        <>
          {this.symbolStyle && (
            <SymbolLayer
              id={`${this.props.id}-symbol`}
              style={this.symbolStyle as SymbolLayerStyle}
            />
          )}
          {this.props.children}
        </>
      </Animated.ShapeSource>
    );
  }
}

export default Annotation;
