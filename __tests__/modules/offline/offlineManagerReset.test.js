import { NativeModules } from 'react-native';

import Mapbox from '../../../src';

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe.each([
  ['offlineManager', 'RNMBXOfflineModule'],
  ['offlineManagerLegacy', 'RNMBXOfflineModuleLegacy'],
])('%s reset and concurrent refreshes', (managerName, nativeModuleName) => {
  const manager = Mapbox[managerName];
  const native = NativeModules[nativeModuleName];
  const options = {
    name: 'pack',
    styleURL: 'mapbox://styles/mapbox/streets-v12',
    bounds: [
      [0, 1],
      [2, 3],
    ],
    minZoom: 1,
    maxZoom: 2,
  };
  const storedPack = {
    bounds: options.bounds,
    metadata: JSON.stringify({ name: options.name }),
  };
  let packs;
  let getPacks;
  let deletePack;
  let resetDatabase;
  const originalReset = native.resetDatabase;

  beforeEach(() => {
    packs = new Map();
    manager._hasInitialized = false;
    manager._offlinePacks = {};
    getPacks = jest
      .spyOn(native, 'getPacks')
      .mockImplementation(async () => [...packs.values()]);
    jest.spyOn(native, 'createPack').mockImplementation(async (packOptions) => {
      const pack = {
        bounds: packOptions.bounds,
        metadata: packOptions.metadata,
      };
      packs.set(packOptions.name, pack);
      return pack;
    });
    deletePack = jest
      .spyOn(native, 'deletePack')
      .mockImplementation(async (name) => {
        packs.delete(name);
      });
    resetDatabase = jest.fn(async () => {
      packs.clear();
    });
    native.resetDatabase = resetDatabase;
    jest.spyOn(native, 'getPackStatus').mockImplementation(async (name) => {
      if (!packs.has(name)) throw new Error('Does not exist');
      return { name };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalReset === undefined) delete native.resetDatabase;
    else native.resetDatabase = originalReset;
  });

  it('deletes a stored pack when its initial read finishes before a newer refresh', async () => {
    packs.set(options.name, storedPack);
    const first = deferred();
    const second = deferred();
    getPacks
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    const deletion = manager.deletePack(options.name);
    const refresh = manager.getPacks();
    first.resolve([storedPack]);
    await first.promise;
    await Promise.resolve();
    second.resolve([storedPack]);
    await Promise.all([deletion, refresh]);

    expect(deletePack).toHaveBeenCalledWith(options.name);
    expect(packs.has(options.name)).toBe(false);
  });

  it('returns stored packs when the first cold-start refresh finishes first', async () => {
    packs.set(options.name, storedPack);
    const first = deferred();
    const second = deferred();
    getPacks
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    const olderRefresh = manager.getPacks();
    const newerRefresh = manager.getPacks();
    first.resolve([storedPack]);
    await first.promise;
    await Promise.resolve();
    second.resolve([storedPack]);
    const [olderPacks, newerPacks] = await Promise.all([
      olderRefresh,
      newerRefresh,
    ]);

    expect(olderPacks.map((pack) => pack.name)).toEqual([options.name]);
    expect(newerPacks.map((pack) => pack.name)).toEqual([options.name]);
  });

  it('uses a successful older response when a newer cold-start refresh fails', async () => {
    packs.set(options.name, storedPack);
    const first = deferred();
    const second = deferred();
    getPacks
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    const olderRefresh = manager.getPacks();
    const newerRefresh = manager.getPacks();
    second.reject(new Error('refresh failed'));
    await expect(newerRefresh).rejects.toThrow('refresh failed');
    first.resolve([storedPack]);

    expect((await olderRefresh).map((pack) => pack.name)).toEqual([
      options.name,
    ]);
    await manager.deletePack(options.name);
    expect(deletePack).toHaveBeenCalledWith(options.name);
  });

  it('preserves a pack created after an older native snapshot was requested', async () => {
    await manager.getPacks();
    const response = deferred();
    getPacks.mockReturnValueOnce(response.promise);
    const refresh = manager.getPacks();
    await manager.createPack(options);
    response.resolve([]);
    await refresh;

    await manager.deletePack(options.name);
    expect(deletePack).toHaveBeenCalledWith(options.name);
    expect(await manager.getPacks()).toEqual([]);
  });

  it('does not restore a pack deleted while a refresh was pending', async () => {
    await manager.createPack(options);
    const snapshot = [...packs.values()];
    const response = deferred();
    getPacks.mockReturnValueOnce(response.promise);
    const refresh = manager.getPacks();
    await manager.deletePack(options.name);
    response.resolve(snapshot);
    expect(await refresh).toEqual([]);
    expect(await manager.getPack(options.name)).toBeUndefined();
  });

  it('ignores an older response that arrives after a newer refresh', async () => {
    await manager.createPack(options);
    const snapshot = [...packs.values()];
    const response = deferred();
    getPacks.mockReturnValueOnce(response.promise);
    const olderRefresh = manager.getPacks();
    packs.clear();
    expect(await manager.getPacks()).toEqual([]);
    response.resolve(snapshot);
    expect(await olderRefresh).toEqual([]);
  });

  it('replaces the complete list while keeping packs still present in native storage', async () => {
    await manager.createPack(options);
    await manager.createPack({ ...options, name: 'remaining' });
    packs.delete(options.name);
    expect((await manager.getPacks()).map((pack) => pack.name)).toEqual([
      'remaining',
    ]);
  });

  it('waits for native reset completion before refreshing and returns no packs', async () => {
    await manager.createPack(options);
    const oldPack = await manager.getPack(options.name);
    const completion = deferred();
    resetDatabase.mockImplementationOnce(async () => {
      await completion.promise;
      packs.clear();
    });
    getPacks.mockClear();
    let finished = false;
    const reset = manager.resetDatabase().then(() => {
      finished = true;
    });
    await Promise.resolve();
    expect(finished).toBe(false);
    expect(getPacks).not.toHaveBeenCalled();

    completion.resolve();
    await reset;
    expect(getPacks).toHaveBeenCalledTimes(1);
    expect(await manager.getPacks()).toEqual([]);
    expect(await manager.getPack(options.name)).toBeUndefined();
    await expect(oldPack.status()).rejects.toThrow('Does not exist');
  });

  it('resets an already empty database', async () => {
    await manager.resetDatabase();
    expect(resetDatabase).toHaveBeenCalledTimes(1);
    expect(await manager.getPacks()).toEqual([]);
  });

  it('keeps the cache and propagates a native reset failure', async () => {
    await manager.createPack(options);
    resetDatabase.mockRejectedValueOnce(new Error('removal failed'));
    getPacks.mockClear();
    await expect(manager.resetDatabase()).rejects.toThrow('removal failed');
    expect(getPacks).not.toHaveBeenCalled();
    expect((await manager.getPack(options.name)).name).toBe(options.name);
  });

  it('propagates a failed post-reset refresh and permits a later retry', async () => {
    await manager.createPack(options);
    getPacks.mockRejectedValueOnce(new Error('refresh failed'));
    await expect(manager.resetDatabase()).rejects.toThrow('refresh failed');
    expect(await manager.getPacks()).toEqual([]);
  });

  it('does not repopulate the cache from a refresh started before reset', async () => {
    await manager.createPack(options);
    const response = deferred();
    const snapshot = [...packs.values()];
    getPacks.mockReturnValueOnce(response.promise);
    const refresh = manager.getPacks();
    await manager.resetDatabase();
    response.resolve(snapshot);
    expect(await refresh).toEqual([]);
    expect(await manager.getPack(options.name)).toBeUndefined();
  });

  it('discards a response requested during a reset that completes first', async () => {
    await manager.createPack(options);
    const snapshot = [...packs.values()];
    const completion = deferred();
    resetDatabase.mockImplementationOnce(async () => {
      await completion.promise;
      packs.clear();
    });
    const reset = manager.resetDatabase();
    const response = deferred();
    getPacks.mockReturnValueOnce(response.promise);
    const refresh = manager.getPacks();
    completion.resolve();
    await reset;
    response.resolve(snapshot);
    expect(await refresh).toEqual([]);
  });

  it('preserves the cache if a native refresh fails', async () => {
    await manager.createPack(options);
    getPacks.mockRejectedValueOnce(new Error('refresh failed'));
    await expect(manager.getPacks()).rejects.toThrow('refresh failed');
    await manager.deletePack(options.name);
    expect(deletePack).toHaveBeenCalledWith(options.name);
  });
});
