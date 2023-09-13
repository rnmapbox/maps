import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Button, Text, View, SafeAreaView } from 'react-native';

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
    <SafeAreaView>
      <View>
        <Text>No map view</Text>
        <Button
          title="Back"
          onPress={() => {
            navigation.goBack();
          }}
        />
      </View>
    </SafeAreaView>
  );
}
