import React, { useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import {
  MapView,
  Camera,
  UserTrackingMode,
  NativeUserLocation,
} from '@rnmapbox/maps';
import {
  Feature,
  LineString,
  Properties,
  lineString as makeLineString,
} from '@turf/helpers';

import { directionsClient } from '../../MapboxClient';
import { DEFAULT_CENTER_COORDINATE, SF_OFFICE_COORDINATE } from '../../utils';
import { ExampleWithMetadata } from '../common/ExampleMetadata';

const styles = { matchParent: { flex: 1 } };
const SF_ZOO_COORDINATE = [-122.505412, 37.737463];

const UserLocationNativeAnimated = () => {
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    const ref = mapRef.current;
    const reqOptions = {
      waypoints: [
        { coordinates: SF_OFFICE_COORDINATE },
        { coordinates: SF_ZOO_COORDINATE },
      ],
      profile: 'driving',
      geometries: 'geojson',
    };

    let timer: NodeJS.Timeout | null = null;
    let route: Feature<LineString, Properties> | null = null;
    let idx = 0;

    const setPosition = () => {
      if (route == null) {
        console.error('no route given');
        return;
      }
      if (idx + 1 > route.geometry.coordinates.length) {
        idx = 0;
      }
      const coordinates = route.geometry.coordinates[idx++];
      ref?.setCustomLocation(coordinates[1], coordinates[0]);
      timer = setTimeout(setPosition, 1000);
    };

    directionsClient
      .getDirections(reqOptions)
      .send()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      /* @ts-ignore */
      .then((res) => {
        route = makeLineString(res.body.routes[0].geometry.coordinates);
        setPosition();
      });

    return () => {
      ref?.removeCustomLocationProvider();
      if (timer != null) {
        clearTimeout(timer);
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.matchParent}>
      <MapView style={styles.matchParent} ref={mapRef}>
        <Camera
          defaultSettings={{
            centerCoordinate: DEFAULT_CENTER_COORDINATE,
            zoomLevel: 14,
          }}
          followUserLocation={true}
          followUserMode={UserTrackingMode.Follow}
          followZoomLevel={14}
        />
        <NativeUserLocation
          iosShowsUserHeadingIndicator={true}
          androidRenderMode="compass"
          topImageAsset="pin"
        />
      </MapView>
    </SafeAreaView>
  );
};

export default UserLocationNativeAnimated;

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'User Location Native Animated',
  tags: [
    'UserLocation',
    'UserLocation#nativeTopImage',
    'MapView#setCustomLocation',
    'MapView#removeCustomLocationProvider',
  ],
  docs: `
  Demonstrates native UserLocation being natively animated using a custom location provider
  `,
};
UserLocationNativeAnimated.metadata = metadata;
