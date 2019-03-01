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
      'Callout',

      // modules
      'offlineManager',
      'snapshotManager',

      // layers
      'FillLayer',
      'FillExtrusionLayer',
      'CircleLayer',
      'LineLayer',
      'SymbolLayer',
      'BackgroundLayer',
      'RasterLayer',

      // sources
      'VectorSource',
      'ShapeSource',
      'RasterSource',
      'ImageSource',

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
      'isTelemetryEnabled',
      'requestAndroidLocationPermissions',

      // utils
      'geoUtils',

      // animated
      'Animated',
    ];
    actualKeys.forEach(key => expect(expectedKeys).toContain(key));
  });
});
