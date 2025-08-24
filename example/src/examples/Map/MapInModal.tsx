import React from 'react';
import { Button, Text } from 'react-native';
import { MapView } from '@rnmapbox/maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';

const MapInModal: React.FC<{navigation: NativeStackNavigationProp<ParamListBase, string, undefined>}> = ({navigation}) => (
  <SafeAreaView style={{ flex: 1 }}>
    <Text style={{ paddingHorizontal: 20 }}>this is a modal</Text>
    <Button
      title="close"
      onPress={navigation.goBack}
    />
    <MapView style={{ flex: 1 }} />
  </SafeAreaView>
);

export default MapInModal;