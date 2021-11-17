import {NativeModules} from 'react-native';

function keyMirror(keys) {
  const obj = {};
  keys.forEach(key => (obj[key] = key));
  return obj;
}

// Mock of what the native code puts on the JS object
NativeModules.MGLModule = {
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
    'RegionWillChange',
    'RegionIsChanging',
    'RegionDidChange',
    'WillStartLoadingMap',
    'DidFinishLoadingMap',
    'DidFailLoadingMap',
    'WillStartRenderingFrame',
    'DidFinishRenderingFrame',
    'DidFinishRenderingFrameFully',
    'DidFinishLoadingStyle',
    'SetCameraComplete',
  ]),
  CameraModes: keyMirror(['Flight', 'Ease', 'None']),
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
  setAccessToken: jest.fn(),
  getAccessToken: () => Promise.resolve('test-token'),
  setTelemetryEnabled: jest.fn(),
  setConnected: jest.fn(),
};

NativeModules.MGLOfflineModule = {
  createPack: packOptions => {
    return Promise.resolve({
      bounds: packOptions.bounds,
      metadata: JSON.stringify({name: packOptions.name}),
    });
  },
  getPacks: () => Promise.resolve([]),
  deletePack: () => Promise.resolve(),
  getPackStatus: () => Promise.resolve({}),
  pausePackDownload: () => Promise.resolve(),
  resumePackDownload: () => Promise.resolve(),
  setPackObserver: () => Promise.resolve(),
  setTileCountLimit: jest.fn(),
  setProgressEventThrottle: jest.fn(),
};

NativeModules.MGLSnapshotModule = {
  takeSnap: () => {
    return Promise.resolve('file://test.png');
  },
};

NativeModules.MGLLocationModule = {
  getLastKnownLocation: jest.fn(),
  start: jest.fn(),
  pause: jest.fn(),
};

// Mock for global AbortController
global.AbortController = class {
  signal = 'test-signal';
  abort = jest.fn();
};
