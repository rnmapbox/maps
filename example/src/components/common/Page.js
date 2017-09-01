import React from 'react';
import { View } from 'react-native';

import BaseExamplePropTypes from './BaseExamplePropTypes';
import MapHeader from './MapHeader';

import sheet from '../../styles/sheet';
import colors from '../../styles/colors';

class Page extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  render () {
    return (
      <View style={sheet.matchParent}>
        {this.props.children}

        <MapHeader
          backgroundColor={colors.primary.pink}
          statusBarColor={colors.primary.pinkDark}
          statusBarTextTheme={'light-content'}
          label={this.props.label}
          onBack={this.props.onDismissExample} />
      </View>
    )
  }
}

export default Page;
