jest.mock('react-native/Libraries/Image/resolveAssetSource', () => {
  return () => ({uri: 'asset://test.png'});
});

jest.mock('NativeEventEmitter', () => {
  function MockEventEmitter() {}
  MockEventEmitter.prototype.addListener = function () {};
  MockEventEmitter.prototype.removeListener = function () {};
  return MockEventEmitter;
});

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'android', // or 'ios'
  select: (x) => {
    if (x.android) {
      return x.android;
    } else if (x.native) {
      return x.native;
    } else if (x.default) {
      return x.default;
    }
  },
}));
