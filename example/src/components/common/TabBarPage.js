import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, ScrollView} from 'react-native';
import {ButtonGroup} from 'react-native-elements';

import colors from '../../styles/colors';

import BaseExamplePropTypes from './BaseExamplePropTypes';
import Page from './Page';

const TAB_BAR_HEIGHT = 70;

const styles = StyleSheet.create({
  buttonGroup: {
    height: TAB_BAR_HEIGHT,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    backgroundColor: colors.secondary.white,
  },
  scrollableButton: {
    paddingHorizontal: 24,
  },
});

const TabBarPageOptionShape = PropTypes.shape({
  label: PropTypes.string,
  data: PropTypes.any,
});

class TabBarPage extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
    scrollable: PropTypes.bool,
    options: PropTypes.arrayOf(TabBarPageOptionShape).isRequired,
    initialIndex: PropTypes.number.isRequired,
    onOptionPress: PropTypes.func,
  };

  static defaultProps = {
    initialIndex: 0,
    scrollable: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      currentIndex: props.initialIndex,
    };

    this.onOptionPress = this.onOptionPress.bind(this);
  }

  onOptionPress(index) {
    this.setState({currentIndex: index});

    if (typeof this.props.onOptionPress === 'function') {
      const option = this.props.options[index];
      this.props.onOptionPress(index, option.data);
    }
  }

  render() {
    const buttonGroupProps = {
      selectedBackgroundColor: colors.primary.grayFaint,
      containerBorderRadius: 0,
      onPress: this.onOptionPress,
      selectedIndex: this.state.currentIndex,
      buttons: this.props.options.map(o => o.label),
      containerStyle: styles.buttonGroup,
    };

    if (this.props.scrollable) {
      buttonGroupProps.buttonStyle = styles.scrollableButton;
    }

    const view = this.props.scrollable ? (
      <ScrollView horizontal style={{maxHeight: TAB_BAR_HEIGHT}}>
        <ButtonGroup {...buttonGroupProps} />
      </ScrollView>
    ) : (
      <ButtonGroup {...buttonGroupProps} />
    );

    return (
      <Page {...this.props}>
        {this.props.children}
        {view}
      </Page>
    );
  }
}

export default TabBarPage;
