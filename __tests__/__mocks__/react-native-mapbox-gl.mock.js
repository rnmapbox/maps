jest.mock('NativeModules', () => {
  function keyMirror (keys) {
    let obj = {};
    keys.forEach((key) => obj[key] = key);
    return obj;
  }

  // Mock of what the native code puts on the JS object
  const MapboxGLNativeMock = {
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
    CameraModes: keyMirror([
      'Flight',
      'Ease',
      'None',
    ]),
    StyleSource: keyMirror([
      'DefaultSourceID',
    ]),
    InterpolationMode: keyMirror([
      'Exponential',
      'Categorical',
      'Interval',
      'Identity',
    ]),

    // methods
    setAccessToken: jest.fn(),
    getAccessToken: () => Promise.resolve('test-token'),
    requestPermissions: () => Promise.resolve(true),
  };

  return {
    MGLModule: MapboxGLNativeMock,
  };
});
