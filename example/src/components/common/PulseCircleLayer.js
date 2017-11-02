import React from 'react';
import PropTypes from 'prop-types';
import { Animated } from 'react-native';

import MapboxGL from '@mapbox/react-native-mapbox-gl';

const styles = MapboxGL.StyleSheet.create({
  innerCircle: {
    circleStrokeWidth: 1,
    circleStrokeColor: 'white',
    circleColor: '#4264fb',
  },
  outerCircle: {
    circleOpacity: 0.40,
    circleColor: '#c6d2e1',
  },
});

class PulseCircleLayer extends React.Component {
  static propTypes = {
    radius: PropTypes.number,
    pulseRadius: PropTypes.number,
    duration: PropTypes.number,

    innerCircleStyle: PropTypes.any,
    outerCircleStyle: PropTypes.any,
    shape: PropTypes.any,

    aboveLayerID: PropTypes.string,
  }

  static defaultProps = {
    radius: 6,
    pulseRadius: 20,
    duration: 1000,
  };

  constructor (props) {
    super(props);

    this.state = {
      pulseRadius: new Animated.Value(props.radius),
    };

    this._loopAnim = null;
  }

  componentDidMount () {
    this._loopAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.pulseRadius, {
          toValue: this.props.pulseRadius,
          duration: this.props.duration,
        }),
        Animated.timing(this.state.pulseRadius, {
          toValue: this.props.radius,
          duration: this.props.duration,
        }),
      ]),
    );
    this._loopAnim.start();
  }

  componentWillUnmount () {
    this._loopAnim.stop();
  }

  render () {
    if (!this.props.shape) {
      return null;
    }

    const innerCircleStyle = [
      styles.innerCircle,
      this.props.innerCircleStyle,
      { circleRadius: this.props.radius },
    ];

    const outerCircleStyle = [
      styles.outerCircle,
      this.props.outerCircleStyle,
      { circleRadius: this.state.pulseRadius },
    ];

    return (
      <MapboxGL.Animated.ShapeSource id='pulseCircleSource' shape={this.props.shape}>
        <MapboxGL.Animated.CircleLayer id='pulseOuterCircle' style={outerCircleStyle} aboveLayerID={this.props.aboveLayerID} />
        <MapboxGL.CircleLayer id='pulseInnerCircle' style={innerCircleStyle} aboveLayerID='pulseOuterCircle' />
      </MapboxGL.Animated.ShapeSource>
    );
  }
}

export default Animated.createAnimatedComponent(PulseCircleLayer);
