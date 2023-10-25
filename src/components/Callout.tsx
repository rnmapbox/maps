import React, { ReactNode } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  ViewStyle,
  ViewProps,
} from 'react-native';

import RNMBXCalloutNativeComponent from '../specs/RNMBXCalloutNativeComponent';

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

type Props = Omit<ViewProps, 'style'> & {
  /**
   * String that gets displayed in the default callout.
   */
  title: string;

  /**
   * Style property for the Animated.View wrapper, apply animations to this
   */
  style?: ViewStyle;

  /**
   * Style property for the native RNMBXCallout container, set at your own risk.
   */
  containerStyle?: ViewStyle;

  /**
   * Style property for the content bubble.
   */
  contentStyle?: ViewStyle;

  /**
   * Style property for the triangle tip under the content.
   */
  tipStyle?: ViewStyle;

  /**
   * Style property for the title in the content bubble.
   */
  textStyle?: ViewStyle;
};

/**
 *  Callout that displays information about a selected annotation near the annotation.
 */
class Callout extends React.PureComponent<Props> {
  get _containerStyle() {
    const style = [
      {
        position: 'absolute',
        zIndex: 999,
        backgroundColor: 'transparent',
      } as ViewStyle,
    ];

    if (this.props.containerStyle) {
      style.push(this.props.containerStyle);
    }

    return style;
  }

  get _hasChildren() {
    return React.Children.count(this.props.children) > 0;
  }

  _renderDefaultCallout(): ReactNode {
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

  _renderCustomCallout(): ReactNode {
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
      <RNMBXCalloutNativeComponent style={this._containerStyle}>
        {calloutContent}
      </RNMBXCalloutNativeComponent>
    );
  }
}

export default Callout;
