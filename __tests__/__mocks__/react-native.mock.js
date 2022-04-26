jest.mock('react-native/Libraries/Image/resolveAssetSource', () => {
  return () => ({ uri: 'asset://test.png' });
});

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
