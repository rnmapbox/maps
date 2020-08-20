jest.mock('react-native/Libraries/Image/resolveAssetSource', () => {
  return () => ({uri: 'asset://test.png'});
});

jest.mock('NativeEventEmitter', () => {
  function MockEventEmitter() {}
  MockEventEmitter.prototype.addListener = jest.fn(() => ({remove: jest.fn()}));
  MockEventEmitter.prototype.removeListener = jest.fn();
  return MockEventEmitter;
});
