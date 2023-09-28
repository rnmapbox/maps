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
      'StyleImport',

      // modules
      'offlineManager',
      'OfflineCreatePackOptions',
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
      'Atmosphere',

      // sources
      'VectorSource',
      'ShapeSource',
      'RasterSource',
      'ImageSource',
      'RasterDemSource',
      'Images',
      'Image',

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
    ];
    actualKeys.forEach((key) => expect(expectedKeys).toContain(key));
  });
});
