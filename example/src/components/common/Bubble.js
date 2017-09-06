import React from 'react';
import { View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  containter: {
    borderRadius: 30,
    position: 'absolute',
    bottom: 16,
    left: 48,
    right: 48,
    paddingVertical: 16,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
});

class Bubble extends React.PureComponent {
  render () {
    return (
      <View style={styles.containter}>
        {this.props.children}
      </View>
    );
  }
}

export default Bubble;
