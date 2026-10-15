import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MapView,
  Camera,
  UserTrackingMode,
  LocationPuck,
} from '@rnmapbox/maps';

import { type ExampleWithMetadata } from '../common/ExampleMetadata';

const styles = { matchParent: { flex: 1 } };

const LocationPuck3D = () => {
  return (
    <SafeAreaView style={styles.matchParent}>
      <MapView style={styles.matchParent}>
        <Camera
          defaultSettings={{
            centerCoordinate: [-77.036086, 38.910233],
            zoomLevel: 16,
            pitch: 60,
          }}
          followUserLocation={true}
          followUserMode={UserTrackingMode.FollowWithCourse}
          followZoomLevel={16}
          followPitch={60}
        />
        <LocationPuck
          puckBearingEnabled={true}
          puckBearing="course"
          model={{
            uri: require('../../assets/sportcar.glb'),
            scale: [10, 10, 10],
          }}
        />
      </MapView>
    </SafeAreaView>
  );
};

export default LocationPuck3D;

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Location Puck 3D',
  tags: ['LocationPuck', 'LocationPuck#model'],
  docs: `
  Renders the user location as a 3D model that rotates with the course
  `,
};
LocationPuck3D.metadata = metadata;
