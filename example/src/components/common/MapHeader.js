import React from 'react';
import PropTypes from 'prop-types';
import {Text, StyleSheet} from 'react-native';
import {Icon, Header} from 'react-native-elements';

import colors from '../../styles/colors';

const styles = StyleSheet.create({
  label: {
    fontSize: 24,
    color: colors.secondary.white,
  },
  baseHeader: {
    position: 'relative',
    height: 72,
  },
  hideHeaderBorder: {
    zIndex: 100,
    borderBottomWidth: 0,
  },
  iOSboxShadow: {
    shadowOpacity: 0.3,
    shadowRadius: 1,
    shadowOffset: {
      width: 1,
      height: 2,
    },
  },
});

class MapHeader extends React.PureComponent {
  static propTypes = {
    label: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string,
    statusBarColor: PropTypes.string,
    statusBarTextTheme: PropTypes.string,
    onBack: PropTypes.func,
  };

  static defaultProps = {
    statusBarTextTheme: 'light-content',
    statusBarColor: colors.primary.blueDark,
    backgroundColor: colors.primary.blue,
  };

  renderBackIcon() {
    if (!this.props.onBack) {
      return null;
    }
    return (
      <Icon
        size={32}
        iconStyle={{position: 'relative', top: 2}}
        onPress={this.props.onBack}
        color={colors.secondary.white}
        underlayColor={'rgba(255, 255, 255, 0.4)'}
        name="keyboard-backspace"
      />
    );
  }

  renderTitle() {
    return <Text style={styles.label}>{this.props.label}</Text>;
  }

  render() {
    const statusBarProps = {
      barStyle: this.props.statusBarTextTheme,
      backgroundColor: this.props.statusBarColor,
    };

    const containerStyle = [styles.hideHeaderBorder, styles.iOSboxShadow];
    if (this.props.relative) {
      containerStyle.push(styles.baseHeader);
    }

    return (
      <Header
        backgroundColor={this.props.backgroundColor}
        statusBarProps={statusBarProps}
        elevation={2}
        outerContainerStyles={containerStyle}
        leftComponent={this.renderBackIcon()}
        centerComponent={this.renderTitle()}
      />
    );
  }
}

export default MapHeader;
