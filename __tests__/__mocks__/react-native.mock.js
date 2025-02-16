jest.mock('react-native/Libraries/Image/resolveAssetSource', () => {
  return () => ({ uri: 'asset://test.png' });
});

jest.mock('../../src/assets/heading.png', () => 'heading.png');


jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  function MockEventEmitter() {}
  MockEventEmitter.prototype.addListener = jest.fn(() => ({
    remove: jest.fn(),
  }));
  return {
    __esModule: true,
    default: MockEventEmitter,
  };
});

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios', // or 'android'
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

jest.mock('react-native/src/private/animated/NativeAnimatedHelper', () => ({
  addListener: jest.fn(),
  API: {
    flushQueue: jest.fn(),
  },
  shouldUseNativeDriver: jest.fn(),
}));

