import React, {ReactNode} from 'react';
import {View} from 'react-native';

import sheet from '../../styles/sheet';
import colors from '../../styles/colors';

import {BaseExampleProps} from './BaseExamplePropTypes';
import MapHeader from './MapHeader';

export type PageProps = BaseExampleProps & {children: ReactNode};

const Page = ({children, label, onDismissExample}: PageProps) => {
  return (
    <View style={sheet.matchParent}>
      <MapHeader
        backgroundColor={colors.primary.pink}
        statusBarColor={colors.primary.pinkDark}
        statusBarTextTheme={'light-content'}
        label={label}
        onBack={onDismissExample}
      />

      {children}
    </View>
  );
};

export default Page;
