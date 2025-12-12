import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import Mapbox, { CircleLayer, FillLayer, ShapeSource } from '@rnmapbox/maps';
import { ExampleWithMetadata } from '../common/ExampleMetadata';
import sheet from '../../styles/sheet';

const INSTRUCTIONS = `
––– INSTRUCTIONS –––

Pressing any of the 4 shapes should:
 1. return the geographic and screen coordinates
 2. correctly convert screen coordinates to geographic coordinates
 3. correctly convert geographic coordinates to screen coordinates
 4. return the pressed feature (check "properties.color")
 5. return the pressed feature (check "properties.color")

Pressing the red outline should yield these coordinates:
- top-left corner:
  - screenPointY: 300
  - screenPointX: 100
- bottom-right corner:
  - screenPointY: 400
  - screenPointX: 200

Test all of the above at different zoom levels, rotation, and heading.
`;

const STEPS = INSTRUCTIONS.replaceAll(/^(?!\s*\d\.).*\n?/gm, '')
  .split('\n')
  .map((s) => s.trim());

const ScreenCoordinates = () => {
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);

  const [centerLon, setCenterLon] = useState<number>();
  const [centerLat, setCenterLat] = useState<number>();
  const [zoom, setZoom] = useState<number>();
  const [heading, setHeading] = useState<number>();
  const [pitch, setPitch] = useState<number>();

  type ValuesRef = {
    centerLon?: number;
    centerLat?: number;
    zoom?: number;
    heading?: number;
    pitch?: number;
  };

  const valuesRef = useRef<ValuesRef>({});

  const centerText = useMemo(
    () =>
      `Center: ${
        centerLon === undefined || centerLat === undefined
          ? '-'
          : `${centerLon.toFixed(2)}, ${centerLat.toFixed(2)}`
      }`,
    [centerLon, centerLat],
  );

  const zoomText = useMemo(
    () => `Zoom: ${zoom === undefined ? '-' : zoom.toFixed(0)}`,
    [zoom],
  );

  const headingText = useMemo(
    () => `Heading: ${heading === undefined ? '-' : heading.toFixed(0)}`,
    [heading],
  );
  const pitchText = useMemo(
    () => `Pitch: ${pitch === undefined ? '-' : pitch.toFixed(0)}`,
    [pitch],
  );

  const [pressText, setPressText] = useState<string>();

  const [coordinateFromViewText, setCoordinateFromViewText] =
    useState<string>();

  const [pointInViewText, setPointInViewText] = useState<string>();

  const [queryRenderdFeaturesAtPointText, setQueryRenderedFeaturesAtPointText] =
    useState<string>();

  const [queryRenderdFeaturesInRectText, setQueryRenderedFeaturesInRectText] =
    useState<string>();

  const debugText = useMemo(() => {
    return [
      [
        pressText,
        coordinateFromViewText,
        pointInViewText,
        queryRenderdFeaturesAtPointText,
        queryRenderdFeaturesInRectText,
      ]
        .flatMap((v, i) => (v ? [`${STEPS[i]}\n\n${v}`] : []))
        .join('\n\n'),
      INSTRUCTIONS,
    ]
      .flatMap((v) => (v ? [v] : []))
      .join('\n\n');
  }, [
    pressText,
    coordinateFromViewText,
    pointInViewText,
    queryRenderdFeaturesAtPointText,
    queryRenderdFeaturesInRectText,
  ]);

  const queryPressFeatures = useCallback(
    (payload: Mapbox.ScreenPointPayload) => {
      setCoordinateFromViewText(undefined);
      setPointInViewText(undefined);
      setQueryRenderedFeaturesAtPointText(undefined);
      setQueryRenderedFeaturesInRectText(undefined);

      const map = mapRef.current;

      if (!map) return;

      const point: GeoJSON.Position = [
        payload.screenPointX,
        payload.screenPointY,
      ];

      const rectSize = 40;

      const rect: GeoJSON.BBox = [
        payload.screenPointY - rectSize / 2, // top
        payload.screenPointX - rectSize / 2, // left
        payload.screenPointY + rectSize / 2, // bottom
        payload.screenPointX + rectSize / 2, // right
      ];

      const pointText = `[ ${point.map((v) => v.toFixed(1)).join(', ')} ]`;
      const rectText = `[ ${rect.map((v) => v.toFixed(1)).join(', ')} ]`;

      const getPrettyPointText = (p: GeoJSON.Position) =>
        `[\n${p
          .map((v, i) => `  (${i === 0 ? 'x' : 'y'}) ${v.toFixed(1)}`)
          .join(',\n')}\n]`;

      const getPrettyCoordsText = (c: GeoJSON.Position) =>
        `[\n${c
          .map((v, i) => `  (${i === 0 ? 'lon' : 'lat'}) ${v.toFixed(4)}`)
          .join(',\n')}\n]`;

      mapRef.current
        ?.getCoordinateFromView(point)
        .then((coords) => {
          setCoordinateFromViewText(
            `getCoordinateFromView(${getPrettyPointText(
              point,
            )}) -> ${getPrettyCoordsText(coords)}`,
          );

          mapRef.current
            ?.getPointInView(coords)
            .then((p) => {
              setPointInViewText(
                `getPointInView(${getPrettyCoordsText(
                  coords,
                )}) -> ${getPrettyPointText(p)}`,
              );
            })
            .catch(() => {});
        })
        .catch(() => {});

      const layersIds = [POINTS_CIRCLE_LAYER_ID, SQUARES_FILL_LAYER_ID];

      mapRef.current
        ?.queryRenderedFeaturesAtPoint(point, undefined, layersIds)
        .then((fc) => {
          setQueryRenderedFeaturesAtPointText(
            `queryRenderedFeaturesAtPoint(${pointText}): ${JSON.stringify(
              fc,
              undefined,
              2,
            )}`,
          );
        })
        .catch(() => {});

      mapRef.current
        ?.queryRenderedFeaturesInRect(rect, undefined, layersIds)
        .then((fc) => {
          setQueryRenderedFeaturesInRectText(
            `queryRenderedFeaturesInRect(${rectText}): ${JSON.stringify(
              fc,
              undefined,
              2,
            )}`,
          );
        })
        .catch(() => {});
    },
    [],
  );

  const handlePress = useCallback(
    (f: GeoJSON.Feature<GeoJSON.Point, Mapbox.ScreenPointPayload>) => {
      setPressText(`onPress: ${JSON.stringify(f, undefined, 2)}`);

      queryPressFeatures(f.properties);
    },
    [queryPressFeatures],
  );

  const handleLongPress = useCallback(
    (f: GeoJSON.Feature<GeoJSON.Point, Mapbox.ScreenPointPayload>) => {
      setPressText(`onLongPress: ${JSON.stringify(f, undefined, 2)}`);

      queryPressFeatures(f.properties);
    },
    [queryPressFeatures],
  );

  const [isBusy, setBusy] = useState(true);

  const updateValues = useCallback((state: Mapbox.MapState) => {
    const centerLon = state.properties.center[0] ?? 0;
    const centerLat = state.properties.center[1] ?? 0;
    const zoom = state.properties.zoom;
    const heading = state.properties.heading;
    const pitch = state.properties.pitch;

    valuesRef.current.centerLon = centerLon;
    valuesRef.current.centerLat = centerLat;
    valuesRef.current.zoom = zoom;
    valuesRef.current.heading = heading;
    valuesRef.current.pitch = pitch;

    setCenterLon(centerLon);
    setCenterLat(centerLat);
    setZoom(zoom);
    setHeading(heading);
    setPitch(pitch);
  }, []);

  const handleCameraChanged = useCallback(
    (state: Mapbox.MapState) => {
      updateValues(state);
    },
    [updateValues],
  );

  const handleMapIdle = useCallback(
    (state: Mapbox.MapState) => {
      updateValues(state);
      setBusy(false);
    },
    [updateValues],
  );

  const setCameraStop = useCallback((stop: Mapbox.CameraStop) => {
    setBusy(true);
    cameraRef.current?.setCamera({
      animationMode: 'easeTo',
      animationDuration: 300,
      ...stop,
    });
  }, []);

  const handlePressCenter = useCallback(() => {
    const { centerLon, centerLat } = valuesRef.current;

    if (centerLon === undefined || centerLat === undefined) return;

    setCameraStop({
      centerCoordinate:
        centerLon !== DEFAULT_CAMERA_STOP.centerCoordinate[0] ||
        centerLat !== DEFAULT_CAMERA_STOP.centerCoordinate[1]
          ? DEFAULT_CAMERA_STOP.centerCoordinate
          : INITIAL_CAMERA_STOP.centerCoordinate,
    });
  }, [setCameraStop]);

  const handlePressZoom = useCallback(() => {
    const { zoom } = valuesRef.current;
    setCameraStop({
      zoomLevel:
        zoom !== DEFAULT_CAMERA_STOP.zoomLevel
          ? DEFAULT_CAMERA_STOP.zoomLevel
          : INITIAL_CAMERA_STOP.zoomLevel,
    });
  }, [setCameraStop]);

  const handlePressHeading = useCallback(() => {
    const { heading } = valuesRef.current;
    setCameraStop({
      heading:
        heading !== DEFAULT_CAMERA_STOP.heading
          ? DEFAULT_CAMERA_STOP.heading
          : INITIAL_CAMERA_STOP.heading,
    });
  }, [setCameraStop]);

  const handlePressPitch = useCallback(() => {
    const { pitch } = valuesRef.current;
    setCameraStop({
      pitch:
        pitch !== DEFAULT_CAMERA_STOP.pitch
          ? DEFAULT_CAMERA_STOP.pitch
          : INITIAL_CAMERA_STOP.pitch,
    });
  }, [setCameraStop]);

  return (
    <View style={sheet.matchParent}>
      <Mapbox.MapView
        ref={mapRef}
        testID="screen-coordinates"
        style={styles.map}
        // map configuration
        projection="mercator"
        styleURL={Mapbox.StyleURL.Light}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        compassEnabled={true}
        compassViewPosition={1}
        compassFadeWhenNorth={true}
        scaleBarEnabled={false}
        attributionEnabled={false}
        logoEnabled={false}
        // handlers
        onPress={handlePress}
        onLongPress={handleLongPress}
        onMapIdle={handleMapIdle}
        onCameraChanged={handleCameraChanged}
      >
        <Mapbox.Camera ref={cameraRef} defaultSettings={INITIAL_CAMERA_STOP} />
        <ShapeSource id={POINTS_SOURCE_ID} shape={POINTS_SOURCE}>
          <CircleLayer
            id={POINTS_CIRCLE_LAYER_ID}
            style={mapStyles.pointCircle}
          />
        </ShapeSource>
        <ShapeSource id={SQUARES_SOURCE_ID} shape={SQUARES_SOURCE}>
          <FillLayer id={SQUARES_FILL_LAYER_ID} style={mapStyles.squareFill} />
        </ShapeSource>
      </Mapbox.MapView>
      <View style={styles.actionsContainer}>
        <ActionButton
          title={centerText}
          size="wide"
          onPress={handlePressCenter}
          disabled={isBusy}
        />
        <ActionButton
          title={zoomText}
          onPress={handlePressZoom}
          disabled={isBusy}
        />
        <ActionButton
          title={headingText}
          onPress={handlePressHeading}
          disabled={isBusy}
        />
        <ActionButton
          title={pitchText}
          onPress={handlePressPitch}
          disabled={isBusy}
        />
      </View>
      <ScrollView
        style={styles.debugTextContainer}
        contentContainerStyle={styles.debugTextContentContainer}
      >
        <Text style={styles.debugText}>{debugText}</Text>
      </ScrollView>
      <View style={styles.overlay} />
    </View>
  );
};

const INITIAL_CAMERA_STOP = {
  centerCoordinate: [-5, 20],
  zoomLevel: 2,
  heading: 15,
  pitch: 45,
} as const satisfies Mapbox.CameraStop;

const DEFAULT_CAMERA_STOP = {
  centerCoordinate: [0, 0],
  zoomLevel: 0,
  heading: 0,
  pitch: 0,
} as const satisfies Mapbox.CameraStop;

const POINT_GEO_CENTERS: readonly GeoJSON.Position[] = [
  [10, 10],
  [30, 30],
];

const SQUARES_GEO_CENTERS: readonly GeoJSON.Position[] = [
  [-10, 10],
  [-30, 30],
];

const OUTLINE_RECT = {
  x: 100,
  y: 300,
  width: 100,
  height: 100,
} as const;

type CustomProperties = {
  readonly color: string;
};

const POINTS_SOURCE: GeoJSON.FeatureCollection<
  GeoJSON.Point,
  CustomProperties
> = {
  type: 'FeatureCollection',
  features: POINT_GEO_CENTERS.map(
    (coordinates, i): GeoJSON.Feature<GeoJSON.Point, CustomProperties> => ({
      type: 'Feature',
      id: `point-lon:${(coordinates[0] ?? 0).toFixed(4)},lat:${(
        coordinates[1] ?? 0
      ).toFixed(4)}`,
      properties: { color: i === 0 ? 'magenta' : 'orange' },
      geometry: { type: 'Point', coordinates },
    }),
  ),
};

const SQUARE_SIZE = 5;

const SQUARES_SOURCE: GeoJSON.FeatureCollection<
  GeoJSON.Polygon,
  CustomProperties
> = {
  type: 'FeatureCollection',
  features: SQUARES_GEO_CENTERS.map(
    (coords, i): GeoJSON.Feature<GeoJSON.Polygon, CustomProperties> => {
      const lon = coords[0] ?? 0;
      const lat = coords[1] ?? 0;

      const r = SQUARE_SIZE / 2;

      return {
        type: 'Feature',
        id: `square-lon:${lon.toFixed(4)},lat:${lat.toFixed(4)}`,
        properties: { color: i === 0 ? 'blue' : 'green' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [lon + r, lat + r],
              [lon + r, lat - r],
              [lon - r, lat - r],
              [lon - r, lat + r],
              [lon + r, lat + r],
            ],
          ],
        },
      };
    },
  ),
};

const POINTS_SOURCE_ID = 'points';
const POINTS_CIRCLE_LAYER_ID = `${POINTS_SOURCE_ID}-circle`;

const SQUARES_SOURCE_ID = 'squares';
const SQUARES_FILL_LAYER_ID = `${SQUARES_SOURCE_ID}-fill`;

const mapStyles = {
  pointCircle: {
    circleRadius: 10,
    circleOpacity: 0.5,
    circleColor: ['get', 'color'],
  },
  squareFill: {
    fillColor: ['get', 'color'],
    fillOpacity: 0.5,
  },
} as const;

const styles = StyleSheet.create({
  map: {
    height: 450,
  },
  overlay: {
    pointerEvents: 'none',
    position: 'absolute',
    left: OUTLINE_RECT.x,
    top: OUTLINE_RECT.y,
    width: OUTLINE_RECT.width,
    height: OUTLINE_RECT.height,
    borderWidth: 1,
    borderColor: '#ff000040',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 4,
    gap: 8,
    backgroundColor: 'gray',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  actionButtonFlexDefault: {
    flex: 1,
  },
  actionButtonFlexWide: {
    flex: 2,
  },
  actionButtonText: {
    fontSize: 12,
    color: 'black',
  },
  debugTextContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  debugTextContentContainer: {
    padding: 16,
    paddingBottom: 34,
  },
  debugText: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontWeight: 'bold',
    fontSize: 10,
    color: '#000000',
  },
});

type ActionButtonProps = TouchableOpacityProps & {
  readonly title: string;
  readonly size?: 'default' | 'wide';
};
const ActionButton = (props: ActionButtonProps) => {
  const { title, size = 'default', style, ...rest } = props;
  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        size === 'wide'
          ? styles.actionButtonFlexWide
          : styles.actionButtonFlexDefault,
        style,
      ]}
      {...rest}
    >
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Screen Coordinates',
  tags: [
    'MapView#onPress',
    'MapView#onLongPress',
    'MapView#getCoordinateFromView',
    'MapView#getPointInView',
    'MapView#queryRenderedFeaturesAtPoint',
    'MapView#queryRenderedFeaturesInRect',
  ],
  docs: `
Tests conversion from screen to geographic coordinates and vice versa.        
`,
};

ScreenCoordinates.metadata = metadata;

export default ScreenCoordinates;
