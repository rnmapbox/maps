import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactElement } from 'react';

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
}): ReactElement {
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
