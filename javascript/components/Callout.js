import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Animated,
  requireNativeComponent,
  StyleSheet,
} from 'react-native';

import { viewPropTypes } from '../utils';

export const NATIVE_MODULE_NAME = 'RCTMGLCallout';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    zIndex: 9999999,
  },
  tip: {
    zIndex: 1000,
    marginTop: -2,
    elevation: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 16,
    borderRightWidth: 8,
    borderBottomWidth: 0,
    borderLeftWidth: 8,
    borderTopColor: 'white',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  content: {
    position: 'relative',
    padding: 8,
    flex: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    backgroundColor: 'white',
  },
  title: {
    color: 'black',
    textAlign: 'center',
  },
});

/**
 *  Callout that displays information about a selected annotation near the annotation.
 */
class Callout extends React.PureComponent {
  static propTypes = {
    ...viewPropTypes,

    /**
     * String that get's displayed in the default callout.
     */
    title: PropTypes.string,

    /**
     * Style property for the Animated.View wrapper, apply animations to this
     */
    style: PropTypes.any,

    /**
     * Style property for the native RCTMGLCallout container, set at your own risk.
     */
    containerStyle: PropTypes.any,

    /**
     * Style property for the content bubble.
     */
    contentStyle: PropTypes.any,

    /**
     * Style property for the triangle tip under the content.
     */
    tipStyle: PropTypes.any,

    /**
     * Style property for the title in the content bubble.
     */
    textStyle: PropTypes.any,
  };

  get _containerStyle() {
    return [
      {
        position: 'absolute',
        zIndex: 999,
        backgroundColor: 'transparent',
      },
      this.props.containerStyle,
    ];
  }

  get _hasChildren() {
    return React.Children.count(this.props.children) > 0;
  }

  _renderDefaultCallout() {
    return (
      <Animated.View style={[styles.container, this.props.style]}>
        <View style={[styles.content, this.props.contentStyle]}>
          <Text style={[styles.title, this.props.textStyle]}>
            {this.props.title}
          </Text>
        </View>
        <View style={[styles.tip, this.props.tipStyle]} />
      </Animated.View>
    );
  }

  _renderCustomCallout() {
    return (
      <Animated.View {...this.props} style={this.props.style}>
        {this.props.children}
      </Animated.View>
    );
  }

  render() {
    const calloutContent = this._hasChildren
      ? this._renderCustomCallout()
      : this._renderDefaultCallout();
    return (
      <RCTMGLCallout style={this._containerStyle}>
        {calloutContent}
      </RCTMGLCallout>
    );
  }
}

const RCTMGLCallout = requireNativeComponent(NATIVE_MODULE_NAME, Callout);

export default Callout;
