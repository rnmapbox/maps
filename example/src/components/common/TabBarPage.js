import React from 'react';
import PropTypes from 'prop-types';

import { View, StyleSheet, Text } from 'react-native';
import { ButtonGroup } from 'react-native-elements';

import BaseExamplePropTypes from './BaseExamplePropTypes';
import Page from './Page';

import sheet from '../../styles/sheet';
import colors from '../../styles/colors';

const styles = StyleSheet.create({
  buttonGroup: {
    height: 60,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    backgroundColor: colors.secondary.white,
  },
});

const TabBarPageOptionShape = PropTypes.shape({
  label: PropTypes.string,
  data: PropTypes.any,
});

class TabBarPage extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
    options: PropTypes.arrayOf(TabBarPageOptionShape).isRequired,
    initialIndex: PropTypes.number.isRequired,
    onOptionPress: PropTypes.func,
  };

  static defaultProps = {
    initialIndex: 0,
  };

  constructor (props) {
    super(props);

    this.state = {
      currentIndex: props.initialIndex,
    };

    this.onOptionPress = this.onOptionPress.bind(this);
  }

  onOptionPress (index) {
    this.setState({ currentIndex: index });

    if (typeof this.props.onOptionPress === 'function') {
      const option = this.props.options[index];
      this.props.onOptionPress(index, option.data);
    }
  }

  render () {
    return (
      <Page {...this.props}>
        {this.props.children}

        <ButtonGroup
          selectedBackgroundColor={colors.primary.grayFaint}
          containerBorderRadius={0}
          onPress={this.onOptionPress}
          selectedIndex={this.state.currentIndex}
          buttons={this.props.options.map((o) => o.label)}
          containerStyle={styles.buttonGroup} />
      </Page>
    );
  }
}

export default TabBarPage;
