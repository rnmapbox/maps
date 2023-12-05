import MapboxGL from '../src';

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
      'NativeUserLocation', // deprecated
      'LocationPuck',
      'StyleImport',
      'Viewport',
      'CustomLocationProvider',

      // modules
      'offlineManager',
      'offlineManagerLegacy',
      'OfflineCreatePackOptions',
      'snapshotManager',
      'locationManager',

      // layers
      'FillLayer',
      'FillExtrusionLayer',
      'CircleLayer',
      'HeatmapLayer',
      'LineLayer',
      'ModelLayer',
      'SymbolLayer',
      'BackgroundLayer',
      'RasterLayer',
      'SkyLayer',
      'Terrain',
      'Atmosphere',

      // sources
      'VectorSource',
      'ShapeSource',
      'RasterSource',
      'ImageSource',
      'RasterDemSource',
      'Images',
      'Image',
      'Models',

      // constants
      'UserTrackingModes', // deprecated
      'UserTrackingMode',
      'UserLocationRenderMode',
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
      'TileServers',

      // methods
      'setWellKnownTileServer',
      'clearData',
      'setAccessToken',
      'getAccessToken',
      'setTelemetryEnabled',
      'setConnected',
      'requestAndroidLocationPermissions',
      'getAnnotationsLayerID',
      'addCustomHeader',
      'removeCustomHeader',

      // animated
      'Animated',

      // classes
      'AnimatedPoint',
      'AnimatedMapPoint',
      'AnimatedCoordinatesArray',
      'AnimatedShape',
      'AnimatedExtractCoordinateFromArray',
      'AnimatedRouteCoordinatesArray',

      // helpers
      'Logger',
      'Style',

      '__experimental',
    ];
    actualKeys.forEach((key) => expect(expectedKeys).toContain(key));
  });
});
