import { NativeModules } from 'react-native';

import Mapbox from '../../../src';

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
    const packs = await Mapbox.offlineManagerLegacy.getPacks();
    for (const pack of packs) {
      await Mapbox.offlineManagerLegacy.deletePack(pack.name);
    }

    jest.clearAllMocks();
  });

  it('should create pack', async () => {
    let offlinePack = await Mapbox.offlineManagerLegacy.getPack(
      packOptions.name,
    );
    expect(offlinePack).toBeFalsy();

    await Mapbox.offlineManagerLegacy.createPack(packOptions);
    offlinePack = await Mapbox.offlineManagerLegacy.getPack(packOptions.name);
    expect(offlinePack).toBeTruthy();
  });

  it('should delete pack', async () => {
    await Mapbox.offlineManagerLegacy.createPack(packOptions);
    let offlinePack = await Mapbox.offlineManagerLegacy.getPack(
      packOptions.name,
    );
    expect(offlinePack).toBeTruthy();

    await Mapbox.offlineManagerLegacy.deletePack(packOptions.name);
    offlinePack = await Mapbox.offlineManagerLegacy.getPack(packOptions.name);
    expect(offlinePack).toBeFalsy();
  });

  it('should migrate offline cache', async () => {
    const spy = jest.spyOn(
      NativeModules.RNMBXOfflineModuleLegacy,
      'migrateOfflineCache',
    );
    await Mapbox.offlineManagerLegacy.migrateOfflineCache();
    expect(spy).toHaveBeenCalled();
  });
});
