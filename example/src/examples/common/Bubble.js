import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    bottom: 16,
    justifyContent: 'center',
    left: 48,
    minHeight: 60,
    paddingVertical: 16,
    position: 'absolute',
    right: 48,
  },
});

class Bubble extends React.PureComponent {
  static propTypes = {
    onPress: PropTypes.func,
    children: PropTypes.any,
    style: PropTypes.any,
  };

  render() {
    let innerChildView = this.props.children;

    if (this.props.onPress) {
      innerChildView = (
        <TouchableOpacity onPress={this.props.onPress}>
          {this.props.children}
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.container, this.props.style]}>{innerChildView}</View>
    );
  }
}

export default Bubble;
