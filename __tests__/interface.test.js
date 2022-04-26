import MapboxGL from '../javascript';

describe('Public Interface', () => {
  it('should contain all expected components and utils', () => {
    const actualKeys = Object.keys(MapboxGL);
    const expectedKeys = [
      // components
      'MapView',
      'StyleSheet',
      'Light',
      'PointAnnotation',
      'MarkerView',
      'Annotation',
      'Callout',
      'Camera',
      'UserLocation',

      // modules
      'offlineManager',
      'snapshotManager',
      'locationManager',

      // layers
      'FillLayer',
      'FillExtrusionLayer',
      'CircleLayer',
      'HeatmapLayer',
      'LineLayer',
      'SymbolLayer',
      'BackgroundLayer',
      'RasterLayer',
      'SkyLayer',
      'Terrain',

      // sources
      'VectorSource',
      'ShapeSource',
      'RasterSource',
      'ImageSource',
      'RasterDemSource',
      'Images',

      // constants
      'UserTrackingModes',
      'StyleURL',
      'EventTypes',
      'CameraModes',
      'StyleSource',
      'InterpolationMode',
      'LineJoin',
      'LineCap',
      'LineTranslateAnchor',
      'CirclePitchScale',
      'CircleTranslateAnchor',
      'CirclePitchAlignment',
      'FillExtrusionTranslateAnchor',
      'FillTranslateAnchor',
      'IconRotationAlignment',
      'IconTextFit',
      'IconAnchor',
      'IconTranslateAnchor',
      'IconPitchAlignment',
      'SymbolPlacement',
      'TextAnchor',
      'TextJustify',
      'TextPitchAlignment',
      'TextRotationAlignment',
      'TextTransform',
      'TextTranslateAnchor',
      'LightAnchor',
      'OfflinePackDownloadState',
      'OfflineCallbackName',

      // methods
      'setAccessToken',
      'getAccessToken',
      'setTelemetryEnabled',
      'setConnected',
      'requestAndroidLocationPermissions',

      // animated
      'Animated',

      // helpers
      'AnimatedPoint',
      'AnimatedCoordinatesArray',
      'AnimatedShape',
      'AnimatedExtractCoordinateFromArray',
      'AnimatedRouteCoordinatesArray',
      'Logger',
      'Style',
    ];
    actualKeys.forEach((key) => expect(expectedKeys).toContain(key));
  });
});
