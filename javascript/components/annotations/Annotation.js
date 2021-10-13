import React from 'react';
import {Easing} from 'react-native';
import PropTypes from 'prop-types';

import SymbolLayer from '../SymbolLayer';
import Animated from '../../utils/animated/Animated';
import AnimatedMapPoint from '../../utils/animated/AnimatedPoint';

class Annotation extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    animated: PropTypes.bool,
    animationDuration: PropTypes.number,
    animationEasingFunction: PropTypes.func,
    coordinates: PropTypes.arrayOf(PropTypes.number),
    onPress: PropTypes.func,
    children: PropTypes.any,
    style: PropTypes.any,
    icon: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
  };

  static defaultProps = {
    animated: false,
    animationDuration: 1000,
    animationEasingFunction: Easing.linear,
  };

  constructor(props) {
    super(props);

    const shape = this._getShapeFromProps(props);

    this.state = {
      shape: props.animated ? new AnimatedMapPoint(shape) : shape,
    };

    this.onPress = this.onPress.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (!Array.isArray(this.props.coordinates)) {
      this.setState({shape: null});
      return;
    }

    const hasCoordChanged =
      prevProps.coordinates[0] !== this.props.coordinates[0] ||
      prevProps.coordinates[1] !== this.props.coordinates[1];

    if (!hasCoordChanged) {
      return;
    }

    if (this.props.animated && this.state.shape) {
      // flush current animations
      this.state.shape.stopAnimation();

      this.state.shape
        .timing({
          coordinates: this.props.coordinates,
          easing: this.props.animationEasingFunction,
          duration: this.props.animationDuration,
        })
        .start();
    } else if (!this.state.shape || !this.props.animated) {
      const shape = this._getShapeFromProps(this.props);

      this.setState({
        shape: this.props.animated ? new AnimatedMapPoint(shape) : shape,
      });
    }
  }

  onPress() {
    if (this.props.onPress) {
      this.props.onPress();
    }
  }

  _getShapeFromProps(props = {}) {
    const lng = props.coordinates[0] || 0;
    const lat = props.coordinates[1] || 0;
    return {type: 'Point', coordinates: [lng, lat]};
  }

  get symbolStyle() {
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
        ref="source"
        onPress={this.onPress}
        shape={this.state.shape}>
        {this.symbolStyle && (
          <SymbolLayer
            id={`${this.props.id}-symbol`}
            style={this.symbolStyle}
          />
        )}
        {this.props.children}
      </Animated.ShapeSource>
    );
  }
}

export default Annotation;
