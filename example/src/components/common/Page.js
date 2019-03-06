import React from 'react';
import {View} from 'react-native';

import sheet from '../../styles/sheet';
import colors from '../../styles/colors';

import BaseExamplePropTypes from './BaseExamplePropTypes';
import MapHeader from './MapHeader';

class Page extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  render() {
    return (
      <View style={sheet.matchParent}>
        <MapHeader
          backgroundColor={colors.primary.pink}
          statusBarColor={colors.primary.pinkDark}
          statusBarTextTheme={'light-content'}
          label={this.props.label}
          onBack={this.props.onDismissExample}
        />

        {this.props.children}
      </View>
    );
  }
}

export default Page;
