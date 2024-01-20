import React, { useState, useEffect, useRef } from 'react';
import { Easing, Button, View, Text } from 'react-native';
import length from '@turf/length';
import { lineString } from '@turf/helpers';
import { Animated as RNAnimated } from 'react-native';
import {
  MapView,
  SkyLayer,
  Camera,
  Logger,
  Terrain,
  RasterDemSource,
  Animated,
  AnimatedShape,
  AnimatedRouteCoordinatesArray,
  AnimatedExtractCoordinateFromArray,
  MarkerView,
  Atmosphere,
} from '@rnmapbox/maps';

Logger.setLogLevel('verbose');

const AnimatedMarkerView = RNAnimated.createAnimatedComponent(MarkerView);

const styles = {
  mapView: { flex: 1 },
  triangleStyle: (size, color) => ({
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: size,
    borderRightWidth: size,
    borderTopWidth: size * 1.3,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: color,
  }),
};

const QueryTerrainElevation = () => {
  let [animatedRoute, setAnimatedRoute] = useState(null);
  let [actPoint, setActPoint] = useState(null);
  let camera = useRef();
  let [altitude, setAltitude] = useState(null);
  let updateAltitudeInterval = useRef();
  let map = useRef();
  useEffect(() => {
    return () => {
      clearInterval(updateAltitudeInterval.current);
      updateAltitudeInterval.current = null;
    };
  }, []);

  function startAnimation(animatedRoute) {
    const ts = lineString(animatedRoute.__getValue());
    const total = length(ts, { units: 'meters' });
    const points = animatedRoute.__getValue();
    const endPoint = points[points.length - 1];

    animatedRoute
      .timing({
        toValue: { end: { point: endPoint, from: total } },
        duration: 20000,
        easing: Easing.linear,
      })
      .start(() => {
        clearInterval(updateAltitudeInterval.current);
        updateAltitudeInterval.current = null;
      });

    camera.current.setCamera({
      heading: 60,
      zoomLevel: 13.5,
      animationDuration: 20000,
    });

    updateAltitudeInterval.current = setInterval(async () => {
      setAltitude(
        Math.floor(
          await map.current.queryTerrainElevation(actPoint.__getValue()),
        ),
      );
    }, 2000);
  }

  useEffect(() => {
    (async () => {
      let response = await fetch(
        'https://docs.mapbox.com/mapbox-gl-js/assets/route-pin.geojson',
      );
      let featureCollection = await response.json();

      let pinRoute = featureCollection.features[0].geometry.coordinates;

      let animatedRoute = new AnimatedRouteCoordinatesArray(pinRoute, {
        end: {
          from: length(lineString(pinRoute)),
        },
      });
      setAnimatedRoute(animatedRoute);
      setActPoint(new AnimatedExtractCoordinateFromArray(animatedRoute, -1));
    })();
  }, []);
  return (
    <>
      <Button title="Start" onPress={() => startAnimation(animatedRoute)} />
      <MapView
        style={styles.mapView}
        styleURL={'mapbox://styles/mapbox/satellite-streets-v11'}
        ref={map}
      >
        <Camera
          centerCoordinate={[6.58968, 45.39701]}
          zoomLevel={12.3}
          heading={162}
          pitch={76}
          ref={camera}
        />

        <RasterDemSource
          id="mapbox-dem"
          url="mapbox://mapbox.terrain-rgb"
          tileSize={512}
          maxZoomLevel={14}
        >
          <SkyLayer
            id="sky-layer"
            style={{
              skyType: 'atmosphere',
              skyAtmosphereColor: 'rgba(85, 151, 210, 0.5)',
            }}
          />

          <Terrain style={{ exaggeration: 1.5 }} />
          <Atmosphere
            style={{
              starIntensity: 1.0,
              range: [-0.7, 2.0],
              spaceColor: '#def',
              color: '#def',
              highColor: '#def',
            }}
          />
        </RasterDemSource>

        {animatedRoute && (
          <Animated.ShapeSource
            id="animated-route"
            shape={
              new AnimatedShape({
                type: 'LineString',
                coordinates: animatedRoute,
              })
            }
          >
            <Animated.LineLayer
              id={'animated-route'}
              style={{
                lineColor: 'rgba(255,0,0,255)',
                lineWidth: 3,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </Animated.ShapeSource>
        )}

        {actPoint && (
          <Animated.ShapeSource
            id="currentLocationSource"
            shape={
              new AnimatedShape({
                type: 'Point',
                coordinates: actPoint,
              })
            }
          >
            <Animated.CircleLayer
              id="currentLocationCircle"
              style={{
                circleOpacity: 1.0,
                circleColor: '#c62221',
                circleRadius: 6,
              }}
            />
          </Animated.ShapeSource>
        )}
        {actPoint && altitude && (
          <AnimatedMarkerView coordinate={actPoint} anchor={{ x: 0.5, y: 1 }}>
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 10,
                  width: 140,
                  height: 50,
                  borderRadius: 10,
                }}
              >
                <Text>Altitude: {altitude} m</Text>
              </View>
              <View
                style={[styles.triangleStyle(12, 'white'), { marginTop: -1 }]}
              />
            </View>
          </AnimatedMarkerView>
        )}
      </MapView>
    </>
  );
};

export default QueryTerrainElevation;

/* end-example-doc */

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'Query Terrain Elevation',
  tags: [
    'MapView#queryTerrainElevation',
    'AnimatedShape',
    'AnimatedRouteCoordinatesArray',
    'AnimatedExtractCoordinateFromArray',
  ],
  docs: `
This is a fairly complex example demonstraing the use of AnimatedShape, Camera animation, queryTerrainElevation and AnimatedMarkerView
`,
};
QueryTerrainElevation.metadata = metadata;
