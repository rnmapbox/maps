import React, { ReactNode, useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ButtonGroup } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '../../styles/colors';

import { BaseExampleProps } from './BaseExamplePropTypes';
import Page from './Page';

const TAB_BAR_HEIGHT = 64;

const styles = StyleSheet.create({
  buttonGroup: {
    backgroundColor: colors.secondary.white,
    height: TAB_BAR_HEIGHT,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
  },
  scrollableButton: {
    paddingHorizontal: 24,
  },
});

type TabBarPageProps<DataT> = BaseExampleProps & {
  children: ReactNode;
  scrollable?: boolean;
  options: { label: string; data: DataT }[];
  onOptionPress: (index: number, data: DataT) => void;
  initialIndex?: number;
};

const TabBarPage = <DataT,>({
  children,
  scrollable = false,
  options,
  onOptionPress,
  initialIndex,
  ...baseProps
}: TabBarPageProps<DataT>) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePress = (index: number) => {
    setCurrentIndex(index);
    onOptionPress(index, options[index].data);
  };

  const buttonGroupProps = {
    selectedBackgroundColor: colors.primary.grayFaint,
    containerBorderRadius: 0,
    onPress: handlePress,
    selectedIndex: currentIndex,
    buttons: options.map((o) => o.label),
    containerStyle: styles.buttonGroup,
    buttonGroupProps: scrollable ? styles.scrollableButton : undefined,
  };

  return (
    <Page {...baseProps}>
      {children}

      <SafeAreaView edges={['right', 'bottom', 'left']}>
        {scrollable ? (
          <ScrollView horizontal style={{ maxHeight: TAB_BAR_HEIGHT }}>
            <ButtonGroup {...buttonGroupProps} />
          </ScrollView>
        ) : (
          <ButtonGroup {...buttonGroupProps} />
        )}
      </SafeAreaView>
    </Page>
  );
};

export default TabBarPage;
