import React from 'react';
import { FAB, Icon, ListItem } from '@rneui/base';
import moment from 'moment';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EarthquakesDetailsProps } from 'src/scenes/GroupAndItem';

const styles = {
  fab: {
    position: 'absolute',
    top: 10,
    right: 10,
    elevation: 9999,
    zIndex: 9999,
  }
} as const;
const EarthquakesDetailsModal: React.FC<EarthquakesDetailsProps> = ({navigation, route}) => (
  <SafeAreaView style={{ flex: 1 }}>
    <FAB
      onPress={() => {
        navigation.goBack();
      }}
      icon={<Icon name="close" />}
      size="large"
      style={styles.fab}
    />
    {route.params.selectedCluster && (
      <FlatList
        style={{ flex: 1 }}
        keyExtractor={({ properties: earthquakeInfo }) => {
          return earthquakeInfo?.code;
        }}
        data={route.params.selectedCluster.features}
        renderItem={({ item: { properties: earthquakeInfo } }) => {
          const magnitude = `Magnitude: ${earthquakeInfo?.mag}`;
          const place = `Place: ${earthquakeInfo?.place}`;
          const code = `Code: ${earthquakeInfo?.code}`;
          const time = `Time: ${moment(earthquakeInfo?.time).format(
            'MMMM Do YYYY, h:mm:ss a',
          )}`;

          return (
            <ListItem bottomDivider key={code}>
              <ListItem.Content>
                <ListItem.Title>{earthquakeInfo?.title}</ListItem.Title>
                <ListItem.Subtitle>{magnitude}</ListItem.Subtitle>
                <ListItem.Subtitle>{place}</ListItem.Subtitle>
                <ListItem.Subtitle>{code}</ListItem.Subtitle>
                <ListItem.Subtitle>{time}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          );
        }}
      />
    )}
  </SafeAreaView>
);

export default EarthquakesDetailsModal;