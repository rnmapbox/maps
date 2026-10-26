describe('assetUri without an asset registry', () => {
  // Mirrors Expo Snack's web bundle, where the registry module throws when evaluated.
  beforeEach(() => {
    jest.resetModules();
    jest.doMock('@react-native/assets-registry/registry', () => {
      throw new TypeError(
        "Cannot read properties of undefined (reading 'registerAsset')",
      );
    });
  });

  afterEach(() => {
    jest.dontMock('@react-native/assets-registry/registry');
  });

  it('can be imported and resolves urls', () => {
    const { assetUri } = require('../../src/web/utils/assetUri');

    expect(assetUri('https://example.com/pin.png')).toBe(
      'https://example.com/pin.png',
    );
    expect(assetUri({ uri: 'data:image/png;base64,AA' })).toBe(
      'data:image/png;base64,AA',
    );
  });

  it('resolves asset ids to undefined', () => {
    const { assetUri } = require('../../src/web/utils/assetUri');

    expect(assetUri(1)).toBeUndefined();
  });
});
