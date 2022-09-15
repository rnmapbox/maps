import React from 'react';
import { Text, View, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type StackParamsList = {
  ScreenWithoutMap: Record<string, never>;
};

type ScreenWithoutMapProps = NativeStackScreenProps<
  StackParamsList,
  'ScreenWithoutMap'
>;

/**
 * A simple component without any mapview, just for testing navigation away from a mapbview
 */
export function ScreenWithoutMap({
  navigation,
}: {
  navigation: ScreenWithoutMapProps['navigation'];
}): JSX.Element {
  return (
    <View>
      <Text>No map view</Text>
      <Button
        title="Back"
        onPress={() => {
          navigation.goBack();
        }}
      />
    </View>
  );
}
