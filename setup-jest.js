// copied from `react-16-node-hanging-test-fix` module. Without it we get jest hangs.
delete global.MessageChannel;
import { NativeModules } from 'react-native';

function keyMirror(keys) {
  const obj = {};
  keys.forEach((key) => (obj[key] = key));
  return obj;
}

function nativeModule(properties) {
  return {
    addListener: jest.fn(),
    removeListeners: jest.fn(),
    ...properties,
  };
}

// Mock of what the native code puts on the JS object
NativeModules.RNMBXModule = {
  // constants
  UserTrackingModes: keyMirror([
    'None',
    'Follow',
    'FollowWithCourse',
    'FollowWithHeading',
  ]),
  StyleURL: keyMirror([
    'Street',
    'Dark',
    'Light',
    'Outdoors',
    'Satellite',
    'SatelliteStreet',
    'TrafficDay',
    'TrafficNight',
  ]),
  EventTypes: keyMirror([
    'MapClick',
    'MapLongClick',
    'MapIdle',
    'RegionWillChange',
    'RegionIsChanging',
    'RegionDidChange',
    'WillStartLoadingMap',
    'DidFinishLoadingMap',
    'DidFinishRenderingMapFully',
    'DidFailLoadingMap',
    'WillStartRenderingFrame',
    'DidFinishRenderingFrame',
    'DidFinishRenderingFrameFully',
    'DidFinishLoadingStyle',
    'SetCameraComplete',
  ]),
  CameraModes: keyMirror(['Flight', 'Ease', 'Linear', 'None', 'Move']),
  StyleSource: keyMirror(['DefaultSourceID']),
  InterpolationMode: keyMirror([
    'Exponential',
    'Categorical',
    'Interval',
    'Identity',
  ]),
  LineJoin: keyMirror(['Bevel', 'Round', 'Miter']),
  LineCap: keyMirror(['Butt', 'Round', 'Square']),
  LineTranslateAnchor: keyMirror(['Map', 'Viewport']),
  CirclePitchScale: keyMirror(['Map', 'Viewport']),
  CircleTranslateAnchor: keyMirror(['Map', 'Viewport']),
  FillExtrusionTranslateAnchor: keyMirror(['Map', 'Viewport']),
  FillTranslateAnchor: keyMirror(['Map', 'Viewport']),
  IconRotationAlignment: keyMirror(['Auto', 'Map', 'Viewport']),
  IconTextFit: keyMirror(['None', 'Width', 'Height', 'Both']),
  IconTranslateAnchor: keyMirror(['Map', 'Viewport']),
  SymbolPlacement: keyMirror(['Line', 'Point']),
  TextAnchor: keyMirror([
    'Center',
    'Left',
    'Right',
    'Top',
    'Bottom',
    'TopLeft',
    'TopRight',
    'BottomLeft',
    'BottomRight',
  ]),
  TextJustify: keyMirror(['Center', 'Left', 'Right']),
  TextPitchAlignment: keyMirror(['Auto', 'Map', 'Viewport']),
  TextRotationAlignment: keyMirror(['Auto', 'Map', 'Viewport']),
  TextTransform: keyMirror(['None', 'Lowercase', 'Uppercase']),
  TextTranslateAnchor: keyMirror(['Map', 'Viewport']),
  LightAnchor: keyMirror(['Map', 'Viewport']),
  OfflinePackDownloadState: keyMirror(['Inactive', 'Active', 'Complete']),
  OfflineCallbackName: keyMirror(['Progress', 'Error']),

  // methods
  setWellKnownTileServer: jest.fn(),
  setAccessToken: jest.fn(),
  getAccessToken: () => Promise.resolve('test-token'),
  setTelemetryEnabled: jest.fn(),
  setConnected: jest.fn(),
  clearData: jest.fn(),

  MapboxV10: true,
};

NativeModules.RNMBXOfflineModule = nativeModule({
  createPack: (packOptions) => {
    return Promise.resolve({
      bounds: packOptions.bounds,
      metadata: JSON.stringify({ name: packOptions.name }),
    });
  },
  getPacks: () => Promise.resolve([]),
  deletePack: () => Promise.resolve(),
  getPackStatus: () => Promise.resolve({}),
  migrateOfflineCache: () => Promise.resolve({}),
  pausePackDownload: () => Promise.resolve(),
  resumePackDownload: () => Promise.resolve(),
  setPackObserver: () => Promise.resolve(),
  setTileCountLimit: jest.fn(),
  setProgressEventThrottle: jest.fn(),
});

NativeModules.RNMBXOfflineModuleLegacy = {
  createPack: (packOptions) => {
    return Promise.resolve({
      bounds: packOptions.bounds,
      metadata: JSON.stringify({ name: packOptions.name }),
    });
  },
  getPacks: () => Promise.resolve([]),
  deletePack: () => Promise.resolve(),
  getPackStatus: () => Promise.resolve({}),
  migrateOfflineCache: () => Promise.resolve({}),
  pausePackDownload: () => Promise.resolve(),
  resumePackDownload: () => Promise.resolve(),
};

NativeModules.RNMBXSnapshotModule = {
  takeSnap: () => {
    return Promise.resolve('file://test.png');
  },
};

NativeModules.RNMBXLocationModule = nativeModule({
  getLastKnownLocation: jest.fn(),
  start: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
});

NativeModules.RNMBXMapViewModule = {
  takeSnap: jest.fn(),
  queryTerrainElevation: jest.fn(),
  setSourceVisibility: jest.fn(),
  getCenter: jest.fn(),
  getCoordinateFromView: jest.fn(),
  getPointInView: jest.fn(),
  getZoom: jest.fn(),
  getVisibleBounds: jest.fn(),
  queryRenderedFeaturesAtPoint: jest.fn(),
  queryRenderedFeaturesInRect: jest.fn(),
  setHandledMapChangedEvents: jest.fn(),
  clearData: jest.fn(),
  querySourceFeatures: jest.fn(),
};

NativeModules.RNMBXShapeSourceModule = {
  getClusterExpansionZoom: jest.fn(),
  getClusterLeaves: jest.fn(),
  getClusterChildren: jest.fn(),
};

NativeModules.RNMBXImageModule = {
  refresh: jest.fn(),
};

NativeModules.RNMBXPointAnnotationModule = {
  refresh: jest.fn(),
};

NativeModules.RNMBXViewportModule = {
  idle: jest.fn(),
  transitionTo: jest.fn(),
  getState: jest.fn(),
};

NativeModules.RNMBXCameraModule = {
  updateCameraStop: jest.fn(),
};

NativeModules.RNMBXTileStoreModule = {
  setOptions: jest.fn(),
  shared: jest.fn(),
};

NativeModules.RNMBXMovePointShapeAnimatorModule = {
  create: jest.fn(),
  start: jest.fn(),
};

NativeModules.RNMBXChangeLineOffsetsShapeAnimatorModule = {
  create: jest.fn(),
  start: jest.fn(),
};

NativeModules.RNMBXLogging = nativeModule({
  setLogLevel: jest.fn(),
});
