import React from 'react';
import { Button, Text } from 'react-native';
import { MapView } from '@rnmapbox/maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { type ParamListBase } from '@react-navigation/native';

type MapInModalProps = {
  navigation?: NativeStackNavigationProp<ParamListBase, string, undefined>;
  dismiss?: () => void;
};
const MapInModal: React.FC<MapInModalProps> = ({ navigation, dismiss }) => (
  <SafeAreaView style={{ flex: 1 }}>
    <Text style={{ paddingHorizontal: 20, textAlign: 'center' }}>
      this is a modal
    </Text>
    <Button title="close" onPress={navigation?.goBack ?? dismiss} />
    <MapView style={{ flex: 1 }} />
  </SafeAreaView>
);

export default MapInModal;
