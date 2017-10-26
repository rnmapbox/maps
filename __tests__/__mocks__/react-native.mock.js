jest.mock('react-native/Libraries/Image/resolveAssetSource', () => {
  return () => ({ uri: `asset://test.png` });
});
