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
      'FillExtrusionTranslateAnchor',
      'FillTranslateAnchor',
      'IconRotationAlignment',
      'IconTextFit',
      'IconTranslateAnchor',
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
      'requestAndroidLocationPermissions',

      // utils
      'geoUtils',

      // animated
      'Animated',
    ];
    actualKeys.forEach((key) => expect(expectedKeys).toContain(key));
  });
});
