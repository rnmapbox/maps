import React, {useState, useEffect, useRef} from 'react';
import {Easing, Button, View, Text} from 'react-native';
import length from '@turf/length';
import {lineString} from '@turf/helpers';
import {Animated as RNAnimated} from 'react-native';
import {
  MapView,
  ShapeSource,
  LineLayer,
  SkyLayer,
  Camera,
  Logger,
  Terrain,
  RasterDemSource,
  Animated,
  MarkerView,
} from '@react-native-mapbox-gl/maps';

import Page from '../common/Page';

Logger.setLogLevel('verbose');

const AnimatedMarkerView = RNAnimated.createAnimatedComponent(MarkerView);

const styles = {
  mapView: {flex: 1},
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

const QueryTerrainElevation = ({...props}) => {
  let [routeGeojson, setRouteGeojson] = useState(null);
  let [animatedRoute, setAnimatedRoute] = useState(null);
  let [actPoint, setActPoint] = useState(null);
  // let [pinRoute, setPinRoute] = useState(null);
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
    const total = length(ts, {units: 'meters'});
    const points = animatedRoute.__getValue();
    const endPoint = points[points.length - 1];

    animatedRoute
      .timing({
        toValue: {end: {point: endPoint, from: total}},
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
      setRouteGeojson(featureCollection);
      let pinRoute = featureCollection.features[0].geometry.coordinates;

      let animatedRoute = new Animated.RouteCoordinatesArray(pinRoute, {
        end: {
          from: length(lineString(pinRoute)),
        },
      });
      setAnimatedRoute(animatedRoute);
      setActPoint(new Animated.ExtractCoordinateFromArray(animatedRoute, -1));
      //setPinRoute(pinRoute);
    })();
  }, []);
  return (
    <Page {...props}>
      <Button title="Start" onPress={() => startAnimation(animatedRoute)} />
      <MapView
        style={styles.mapView}
        styleURL={'mapbox://styles/mapbox/satellite-streets-v11'}
        ref={map}>
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
          maxZoomLevel={14}>
          <SkyLayer
            id="sky-layer"
            style={{
              skyType: 'atmosphere',
              skyAtmosphereColor: 'rgba(85, 151, 210, 0.5)',
            }}
          />

          <Terrain exaggeration={1.5} />
        </RasterDemSource>

        {routeGeojson && false && (
          <ShapeSource id="route" shape={routeGeojson}>
            <LineLayer
              id="root"
              style={{
                lineColor: 'rgba(0,0,255,0)',
                lineWidth: 5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </ShapeSource>
        )}
        {animatedRoute && (
          <Animated.ShapeSource
            id="animated-route"
            shape={
              new Animated.Shape({
                type: 'LineString',
                coordinates: animatedRoute,
              })
            }>
            <Animated.LineLayer
              id={'animated-route'}
              style={{
                lineColor: 'rgba(255,0,0,0)',
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
              new Animated.Shape({
                type: 'Point',
                coordinates: actPoint,
              })
            }>
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
          <AnimatedMarkerView coordinate={actPoint} anchor={{x: 0.5, y: 1}}>
            <View style={{alignItems: 'center'}}>
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 10,
                  width: 140,
                  height: 50,
                  borderRadius: 10,
                }}>
                <Text>Altitude: {altitude} m</Text>
              </View>
              <View
                style={[styles.triangleStyle(12, 'white'), {marginTop: -1}]}
              />
            </View>
          </AnimatedMarkerView>
        )}
      </MapView>
    </Page>
  );
};

export default QueryTerrainElevation;
