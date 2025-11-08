import { StyleSheet, View } from 'react-native';

import React, { useCallback, useRef } from 'react';
import Mapbox, {
  LocationPuck,
  Gestures,
  CameraAnimationsManager,
  CameraGestureObserver,
} from '@rnmapbox/maps';

//Mapbox.setAccessToken('');

const App = () => {
  // Logging helpers
  const t0Ref = useRef(Date.now());
  const log = useCallback((...args) => {
    console.log(
      '[CGO][JS]',
      String(Date.now() - t0Ref.current).padStart(6, ' '),
      ...args,
    );
  }, []);

  // Parameters we use for native observer (dup here for reference in logs)
  const QUIET_MS = 200;
  const TIMEOUT_MS = 5000;

  // Simple userland "steady" detector: when no gesture is active, no camera animation is running, and map is idle.
  const gestureActiveRef = useRef(false);
  const cameraAnimatingRef = useRef(false);
  const lastMapIdleTsRef = useRef(0);
  const lastCameraChangeTsRef = useRef(0);
  const steadyTimerRef = useRef(null);

  const scheduleSteadyCheck = useCallback(() => {
    if (steadyTimerRef.current) {
      clearTimeout(steadyTimerRef.current);
      steadyTimerRef.current = null;
    }
    // small debounce to allow any trailing tiles to render
    steadyTimerRef.current = setTimeout(() => {
      const now = Date.now();
      const isSteady =
        !gestureActiveRef.current &&
        !cameraAnimatingRef.current &&
        lastMapIdleTsRef.current >= now - 200 &&
        lastCameraChangeTsRef.current <= now - 100; // ensure we haven't seen camera changes very recently
      if (isSteady) {
        log('onMapSteady (userland)');
      }
    }, 150);
  }, []);

  const onMapIdle = useCallback(() => {
    lastMapIdleTsRef.current = Date.now();
    log('onMapIdle');
    scheduleSteadyCheck();
  }, [scheduleSteadyCheck, log]);

  const onCameraAnimationChange = useCallback(
    ({ nativeEvent }) => {
      log(
        'onCameraAnimationChange',
        nativeEvent.owner,
        nativeEvent.phase,
        nativeEvent.timestamp,
      );
      if (nativeEvent.phase === 'started') {
        cameraAnimatingRef.current = true;
      } else if (
        nativeEvent.phase === 'finished' ||
        nativeEvent.phase === 'cancelled'
      ) {
        cameraAnimatingRef.current = false;
      }
      scheduleSteadyCheck();
    },
    [scheduleSteadyCheck, log],
  );

  const onGestureStateChange = useCallback(
    ({ nativeEvent }) => {
      log(
        'onGestureStateChange',
        nativeEvent.phase,
        nativeEvent.gestureType,
        nativeEvent.willAnimate,
      );
      if (nativeEvent.phase === 'start') {
        gestureActiveRef.current = true;
      } else if (
        nativeEvent.phase === 'end' ||
        nativeEvent.phase === 'animationEnd'
      ) {
        gestureActiveRef.current = false;
      }
      scheduleSteadyCheck();
    },
    [scheduleSteadyCheck, log],
  );

  // Camera changes fire frequently during gestures and programmatic moves; useful to observe mid-gesture updates
  const onCameraChanged = useCallback(
    (state) => {
      // MapView delivers decoded MapState object on v10; includes timestamp and gestures.isGestureActive
      const ts = state?.timestamp ?? Date.now();
      lastCameraChangeTsRef.current = ts;
      const isGestureActive = state?.gestures?.isGestureActive;
      log('onCameraChanged', { ts, isGestureActive });
    },
    [log],
  );

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Mapbox.MapView
          style={styles.map}
          onCameraChanged={onCameraChanged}
          onMapIdle={onMapIdle}
        >
          <CameraGestureObserver
            quietPeriodMs={QUIET_MS}
            maxIntervalMs={TIMEOUT_MS}
            onMapSteady={({ nativeEvent }) => {
              log('## onMapSteady (native)', nativeEvent);
            }}
          />
          <CameraAnimationsManager
            onCameraAnimationChange={onCameraAnimationChange}
          />
          <Gestures onGestureStateChange={onGestureStateChange} />
          <LocationPuck pulsing={'default'} />
        </Mapbox.MapView>
      </View>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: '100%',
    width: '100%',
  },
  map: {
    flex: 1,
  },
});

/*
import React from 'react';
import { MapView, Camera, VectorSource, LineLayer } from '@rnmapbox/maps';
import { View } from 'react-native';
const styles = {
  mapView: { flex: 1 },
  lineLayer: {
    lineCap: 'round',
    lineJoin: 'round',
    lineOpacity: 0.6,
    lineColor: 'rgb(255,0, 109)',
    lineWidth: 2.0,
  },
};

const defaultCameraSettings = {
  centerCoordinate: [-87.622088, 41.878781],
  zoomLevel: 10,
};

const tileUrlTemplates = [
  'https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token=MLY|4142433049200173|72206abe5035850d6743b23a49c41333'.replaceAll(
    '|',
    '%7C',
  ),
];

function App() {
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <MapView
        style={styles.mapView}
        onPress={() => console.log('MapView onPress')}
      >
        <Camera defaultSettings={defaultCameraSettings} />
        <VectorSource id="mapillary" tileUrlTemplates={tileUrlTemplates}>
          <LineLayer
            id="mapillary-lines"
            sourceLayerID="sequence"
            style={styles.lineLayer}
          />
        </VectorSource>
      </MapView>
    </View>
  );
}

export default App;
*/
/* import Mapbox from '@rnmapbox/maps';

const App = () => {
  return (
    <>
      <Mapbox.MapView
        styleURL={Mapbox.StyleURL.SatelliteStreet}
        style={{ flex: 1 }}
        testID={'show-map'}
      >
        <Mapbox.Camera followZoomLevel={12} followUserLocation />

        <Mapbox.CustomLocationProvider coordinate={[-71, -30]} heading={75} />
        <Mapbox.LocationPuck />
      </Mapbox.MapView>
    </>
  );
};

export default App; */
/*
import React from 'react';
import { StyleSheet, View } from 'react-native';

import Mapbox, { LocationPuck, MapView } from '@rnmapbox/maps';

import headingArrow from '../assets/compass2.png';
//Mapbox.setAccessToken("sk.someAccessToken");

const SomeScreen = () => {
  return (
    <>
      <View style={{ backgroundColor: 'red', width: 10, height: 15 }} />
      <MapView style={{ flex: 1 }}>
        <Mapbox.Images images={{ headingArrow }} />

        <LocationPuck
          puckBearingEnabled
          puckBearing="heading"
          // Setting either `topImage` or `bearingImage` causes the error
          topImage="headingArrow" // RNMapbox v11: `topImage` causes the error
          bearingImage="headingArrow" // RNMapbox v11: `bearingImage` causes the error
        />
      </MapView>
    </>
  );
};

export default SomeScreen;
*/
/*
import { StyleSheet, View } from 'react-native';
import React, { useRef } from 'react';
import Mapbox from '@rnmapbox/maps';

//Mapbox.setAccessToken('pk.ey...');

export default function HomeScreen() {
  const mapViewRef = useRef(null);

  const handleOnPress = async () => {
    const features = await mapViewRef.current?.queryRenderedFeaturesInRect(
      [],
      null,
      [
        'poi-scalerank1',
        'poi-parks-scalerank1',
        'poi-scalerank2',
        'poi-parks-scalerank2',
        'poi-scalerank3',
        'poi-parks-scalerank3',
        'poi-scalerank4-l1',
        'poi-scalerank4-l15',
        'poi-parks_scalerank4',
      ],
    );
    console.log(features);
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Mapbox.MapView
          ref={mapViewRef}
          style={styles.map}
          styleURL="mapbox://styles/mapbox/streets-v12"
          testID={'show-map'}
          onPress={handleOnPress}
        >
          <Mapbox.Camera zoomLevel={17} centerCoordinate={[19.06, 47.5]} />
        </Mapbox.MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: 'tomato',
  },
  map: {
    flex: 1,
  },
});
*/
/*
import React from 'react';
import Mapbox, { Camera, MapView, SymbolLayer } from '@rnmapbox/maps';

export default function App() {
  return (
    <MapView
      style={{
        flex: 1,
        width: '100%',
        height: 200,
      }}
      scrollEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      compassEnabled={false}
      scaleBarEnabled={false}
      gestureSettings={{
        rotateEnabled: false,
        simultaneousRotateAndPinchZoomEnabled: false,
        rotateDecelerationEnabled: false,
        pinchPanEnabled: false,
        doubleTouchToZoomOutEnabled: false,
        doubleTapToZoomInEnabled: true,
        panEnabled: false,
      }}
    >
      <Camera
        defaultSettings={{
          centerCoordinate: [-21.827774, 64.128288],
          heading: 0,
          pitch: 0,
        }}
        animationMode="none"
        animationDuration={0}
        zoomLevel={10}
        heading={0}
        pitch={0}
        minZoomLevel={8}
        maxZoomLevel={18}
      />

      <SymbolLayer id="poi-labels" style={{ visibility: 'none' }} />
    </MapView>
  );
}
  */
/* import React from 'react';
import MapBox from '@rnmapbox/maps';
import { View } from 'react-native';

export default function ZeroScreen() {
  return (
    <View style={{ flex: 1 }}>
      <MapBox.MapView
        style={{ flex: 1 }}
        attributionEnabled={false}
        compassEnabled={false}
        logoEnabled={false}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
      />
    </View>
  );
}
*/
/*
import React, { useRef } from 'react';
import { Button } from 'react-native';
import {
  Images,
  MapView,
  ShapeSource,
  SymbolLayer,
  CircleLayer,
  Camera,
} from '@rnmapbox/maps';

const styles = {
  mapView: { width: '100%', height: 500 },
  cluster: {
    circleRadiusTransition: { duration: 5000, delay: 0 },
    circleColor: '#ff0000',
  },
};

const features = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'a-feature',
      properties: {
        icon: 'example',
      },
      geometry: {
        type: 'Point',
        coordinates: [-74.00597, 40.71427],
      },
    },
    {
      type: 'Feature',
      id: 'b-feature',
      properties: {
        icon: 'example',
      },
      geometry: {
        type: 'Point',
        coordinates: [-74.001097, 40.71527],
      },
    },
    {
      type: 'Feature',
      id: 'c-feature',
      properties: {
        icon: 'example',
      },
      geometry: {
        type: 'Point',
        coordinates: [-74.00697, 40.72427],
      },
    },
  ],
};

const BugReportExample = () => {
  const mapView = useRef(null);
  const shapeSourceMarkers = useRef(null);

  const getVisibleMarkers = async () => {
    let visibleMarkers = [];
    const arrFeatures = await mapView.current?.queryRenderedFeaturesInRect(
      [],
      [],
      ['marker', 'cluster'],
    );
    console.log('arrFeatures', arrFeatures);
    if (!arrFeatures) {
      return visibleMarkers;
    }
    for (let index = 0; index < arrFeatures.features.length; index++) {
      const feature = arrFeatures.features[index];
      console.log('feature', feature);
      const properties = feature.properties;
      if (!properties) {
        continue;
      }

      if (properties.cluster) {
        try {
          // ====> THE FOLLOWING LINE CRASHES THE WHOLE APP <====
          console.log('AAAOOOO');
          const collection = await shapeSourceMarkers.current?.getClusterLeaves(
            feature,
            properties.point_count,
            0,
          );
          console.log;
          ('collection', collection);
          collection.features.forEach((f) => {
            visibleMarkers.push(f);
          });
        } catch (error) {
          console.debug('error', error);
        }
      } else {
        visibleMarkers.push(feature);
      }
    }
    console.debug('visibleMarkers', visibleMarkers);
    return visibleMarkers;
  };

  const circleLayerStyle = {
    ...styles.cluster,
    ...{ circleRadius: 15 },
  };

  return (
    <>
      <MapView style={styles.mapView} ref={mapView}>
        <Camera
          defaultSettings={{
            centerCoordinate: [-74.001097, 40.71527],
            zoomLevel: 10,
          }}
        />
        <Images
          images={{
            example: {
              uri: 'https://27crags-sandbox.s3.amazonaws.com/v6-icon.png',
            },
          }}
        />
        <ShapeSource
          id={'shape-source-markers'}
          ref={shapeSourceMarkers}
          shape={features}
          cluster={true}
          clusterRadius={30}
          clusterMaxZoomLevel={19}
        >
          <SymbolLayer
            id="marker"
            style={{
              iconImage: ['get', 'icon'],
              iconAllowOverlap: false,
              iconSize: 0.5,
            }}
            slot={'middle'}
            filter={['!', ['has', 'point_count']]}
          />
          <SymbolLayer
            id="pointCount"
            style={{
              textField: ['format', ['concat', ['get', 'point_count']]],
              textSize: 12,
              textPitchAlignment: 'viewport',
              textAllowOverlap: false,
            }}
          />
          <CircleLayer
            id={'cluster'}
            belowLayerID="pointCount"
            style={circleLayerStyle}
            slot={'bottom'}
            filter={['has', 'point_count']}
          />
        </ShapeSource>
      </MapView>
      <Button
        title="Count all items inside clusters"
        onPress={() => {
          console.log('=> XXXX');
          getVisibleMarkers().then((visibleMarkers) => {
            console.debug('visibleMarkers', visibleMarkers);
          });
        }}
      />
    </>
  );
};

export default BugReportExample;
*/
/*
import React from 'react';
import { View } from 'react-native';
import { MapView, MarkerView, Camera } from '@rnmapbox/maps';

const MarkerTestMap = () => {
  return (
    <MapView style={{ flex: 1 }}>
      <Camera defaultSettings={{ centerCoordinate: [0, -60], zoomLevel: 12 }} />
      <MarkerView coordinate={[0, -60]}>
        <View style={{ width: 130, aspectRatio: 1, backgroundColor: 'red' }}>
          <View
            style={{
              position: 'absolute',
              top: -50,
              width: 100,
              height: 25,
              backgroundColor: 'green',
            }}
          />
        </View>
      </MarkerView>
    </MapView>
  );
};
export default MarkerTestMap;

*/
/*
import React, { useRef } from 'react';
import Mapbox from '@rnmapbox/maps';
import { View } from 'react-native';

const MapComponent = () => {
  const mapRef = useRef(null);
  //const mapRef = useRef<Mapbox.MapView | null>(null);

  const handlePress = async () => {
    try {
      const features = await mapRef.current?.querySourceFeatures(
        'dwr_wd',
        [],
        ['dwr_wd_layer'],
      );
      console.log('Features:', features);
    } catch (error) {
      console.error('Error fetching features:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Mapbox.MapView ref={mapRef} style={{ flex: 1 }} onPress={handlePress}>
        <Mapbox.Camera zoomLevel={10} centerCoordinate={[-121.8853, 37.3382]} />
        <Mapbox.VectorSource id="dwr_wd" url="https://tiles.domain.com/dwr_wd">
          <Mapbox.FillLayer
            id="dwr_wd_layer"
            sourceLayerID="dwr_wd"
            style={{
              fillColor: '#088',
              fillOpacity: 0.5,
            }}
          />
        </Mapbox.VectorSource>
      </Mapbox.MapView>
    </View>
  );
};

export default MapComponent;
*/
/*
import React from 'react';
import { MapView, ShapeSource, SymbolLayer, Camera } from '@rnmapbox/maps';

const labels = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-74.00597, 40.71427],
      },
      properties: {
        text: 'A-icon',
        icon: 'my-icon',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-74.00597, 40.71427],
      },
      properties: {
        text: 'A',
      },
    },
  ],
};

const labelsStyle = {
  textField: ['get', 'text'],
  textOffset: [['case', ['has', 'icon'], 10, 0], 0],
};

export default class BugReportExample extends React.Component {
  render() {
    return (
      <MapView style={{ flex: 1 }}>
        <Camera centerCoordinate={[-74.00597, 40.71427]} zoomLevel={14} />
        <ShapeSource id="idStreetLayer" shape={labels}>
          <SymbolLayer id="idStreetLayer" style={labelsStyle} />
        </ShapeSource>
      </MapView>
    );
  }
} */
/*
import React from 'react';
import {
  Images,
  MapView,
  ShapeSource,
  SymbolLayer,
  CircleLayer,
  Camera,
  VectorSource,
  LineLayer,
} from '@rnmapbox/maps';

const styles = {
  mapView: { flex: 1 },
  circleLayer: {
    circleRadiusTransition: { duration: 5000, delay: 0 },
    circleColor: '#ff0000',
  },
};

const features = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'a-feature',
      properties: {
        icon: 'example',
        text: 'example-icon-and-label',
      },
      geometry: {
        type: 'Point',
        coordinates: [-74.00597, 40.71427],
      },
    },
    {
      type: 'Feature',
      id: 'b-feature',
      properties: {
        text: 'just-label',
      },
      geometry: {
        type: 'Point',
        coordinates: [-74.001097, 40.71527],
      },
    },
    {
      type: 'Feature',
      id: 'c-feature',
      properties: {
        icon: 'example',
      },
      geometry: {
        type: 'Point',
        coordinates: [-74.00697, 40.72427],
      },
    },
  ],
};

class BugReportExample extends React.Component {
  state = {
    radius: 20,
  };

  render() {
    const circleLayerStyle = {
      ...styles.circleLayer,
      ...{ circleRadius: this.state.radius },
    };

    return (
      <>
        <MapView style={styles.mapView}>
          <Camera
            defaultSettings={{
              centerCoordinate: [-87.622088, 41.878781],
              zoomLevel: 10,
            }}
          />
          <Images images={{ example: require('../assets/example.png') }} />
          <VectorSource
            id="mapillary"
            tileUrlTemplates={[
              'https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token=MLY|4142433049200173|72206abe5035850d6743b23a49c41333'.replaceAll(
                '|',
                '%7C',
              ),
            ]}
          >
            <LineLayer
              id="mapillary-lines"
              sourceLayerID="sequence"
              style={{
                lineCap: 'round',
                lineJoin: 'round',
                lineOpacity: 0.6,
                lineColor: 'rgb(53, 175, 109)',
                lineWidth: 2.0,
              }}
            />
          </VectorSource>
          <ShapeSource id={'shape-source-id-0'} shape={features}>
            <CircleLayer
              id={'circle-layer'}
              style={circleLayerStyle}
              slot={'bottom'}
            />
            <SymbolLayer
              id="symbol-id"
              style={{
                iconImage: ['get', 'icon'],
              }}
              slot={'middle'}
            />
          </ShapeSource>
        </MapView>
      </>
    );
  }
}

export default BugReportExample;
*/
