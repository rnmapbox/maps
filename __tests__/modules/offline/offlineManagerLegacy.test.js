import { NativeModules } from 'react-native';

import MapboxGL from '../../../src';

describe('offlineManagerLegacy', () => {
  const packOptions = {
    name: 'test',
    styleURL: 'mapbox://fake-style-url',
    bounds: [
      [0, 1],
      [2, 3],
    ],
    minZoom: 1,
    maxZoom: 22,
  };

  afterEach(async () => {
    const packs = await MapboxGL.offlineManagerLegacy.getPacks();
    for (const pack of packs) {
      await MapboxGL.offlineManagerLegacy.deletePack(pack.name);
    }

    jest.clearAllMocks();
  });

  it('should create pack', async () => {
    let offlinePack = await MapboxGL.offlineManagerLegacy.getPack(
      packOptions.name,
    );
    expect(offlinePack).toBeFalsy();

    await MapboxGL.offlineManagerLegacy.createPack(packOptions);
    offlinePack = await MapboxGL.offlineManagerLegacy.getPack(packOptions.name);
    expect(offlinePack).toBeTruthy();
  });

  it('should delete pack', async () => {
    await MapboxGL.offlineManagerLegacy.createPack(packOptions);
    let offlinePack = await MapboxGL.offlineManagerLegacy.getPack(
      packOptions.name,
    );
    expect(offlinePack).toBeTruthy();

    await MapboxGL.offlineManagerLegacy.deletePack(packOptions.name);
    offlinePack = await MapboxGL.offlineManagerLegacy.getPack(packOptions.name);
    expect(offlinePack).toBeFalsy();
  });

  it('should migrate offline cache', async () => {
    const spy = jest.spyOn(
      NativeModules.RNMBXOfflineModuleLegacy,
      'migrateOfflineCache',
    );
    await MapboxGL.offlineManagerLegacy.migrateOfflineCache();
    expect(spy).toHaveBeenCalled();
  });
});
