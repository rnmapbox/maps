import { NativeModules } from 'react-native';

export {
  default as OfflineCreatePackOptions,
  type OfflineCreatePackOptionsArgs,
} from './OfflineCreatePackOptions';
import OfflineCreatePackOptions, {
  type OfflineCreatePackOptionsArgs,
} from './OfflineCreatePackOptions';
import OfflinePack from './OfflinePackLegacy';

const MapboxOfflineManager = NativeModules.RNMBXOfflineModuleLegacy;

/**
 * OfflineManagerLegacy implements a singleton (shared object) that manages offline packs.
 * All of this class’s instance methods are asynchronous, reflecting the fact that offline resources are stored in a database.
 * The shared object maintains a canonical collection of offline packs.
 */
class OfflineManagerLegacy {
  private _hasInitialized: boolean;
  private _offlinePacks: Record<string, OfflinePack>;

  constructor() {
    this._hasInitialized = false;
    this._offlinePacks = {};
  }

  /**
   * Creates and registers an offline pack that downloads the resources needed to use the given region offline.
   *
   * @example
   *
   * await Mapbox.offlineManager.createPack({
   *   name: 'offlinePack',
   *   styleURL: 'mapbox://...',
   *   minZoom: 14,
   *   maxZoom: 20,
   *   bounds: [[neLng, neLat], [swLng, swLat]]
   * })
   *
   * @param  {OfflineCreatePackOptions} options Create options for a offline pack that specifices zoom levels, style url, and the region to download.
   * @return {void}
   */
  async createPack(options: OfflineCreatePackOptionsArgs): Promise<void> {
    await this._initialize();

    const packOptions = new OfflineCreatePackOptions(options);

    if (this._offlinePacks[packOptions.name]) {
      throw new Error(
        `Offline pack with name ${packOptions.name} already exists.`,
      );
    }

    const nativeOfflinePack = await MapboxOfflineManager.createPack(
      packOptions,
    );
    this._offlinePacks[packOptions.name] = new OfflinePack(nativeOfflinePack);
  }

  /**
   * Invalidates the specified offline pack. This method checks that the tiles in the specified offline pack match those from the server. Local tiles that do not match the latest version on the server are updated.
   *
   * This is more efficient than deleting the offline pack and downloading it again. If the data stored locally matches that on the server, new data will not be downloaded.
   *
   * @example
   * await Mapbox.offlineManagerLegacy.invalidatePack('packName')
   *
   * @param  {String}  name  Name of the offline pack.
   * @return {void}
   */
  async invalidatePack(name: string): Promise<void> {
    if (!name) {
      return;
    }

    await this._initialize();

    const offlinePack = this._offlinePacks[name];
    if (offlinePack) {
      await MapboxOfflineManager.invalidatePack(name);
    }
  }

  /**
   * Unregisters the given offline pack and allows resources that are no longer required by any remaining packs to be potentially freed.
   *
   * @example
   * await Mapbox.offlineManagerLegacy.deletePack('packName')
   *
   * @param  {String}  name  Name of the offline pack.
   * @return {void}
   */
  async deletePack(name: string): Promise<void> {
    if (!name) {
      return;
    }

    await this._initialize();

    const offlinePack = this._offlinePacks[name];
    if (offlinePack) {
      await MapboxOfflineManager.deletePack(name);
      delete this._offlinePacks[name];
    }
  }

  /**
   * Migrates the offline cache from pre-v10 SDKs to the new v10 cache location
   *
   * @example
   * await Mapbox.offlineManager.migrateOfflineCache()
   *
   * @return {void}
   */
  async migrateOfflineCache(): Promise<void> {
    await MapboxOfflineManager.migrateOfflineCache();
  }

  /**
   * Deletes the existing database, which includes both the ambient cache and offline packs, then reinitializes it.
   *
   * @example
   * await Mapbox.offlineManager.resetDatabase();
   *
   * @return {void}
   */
  async resetDatabase(): Promise<void> {
    await MapboxOfflineManager.resetDatabase();
    this._offlinePacks = {};
    await this._initialize(true);
  }

  /**
   * Retrieves all the current offline packs that are stored in the database.
   *
   * @example
   * const offlinePacks = await Mapbox.offlineManagerLegacy.getPacks();
   *
   * @return {Array<OfflinePack>}
   */
  async getPacks(): Promise<OfflinePack[]> {
    await this._initialize();
    return Object.keys(this._offlinePacks).map(
      (name) => this._offlinePacks[name],
    );
  }

  /**
   * Retrieves an offline pack that is stored in the database by name.
   *
   * @example
   * const offlinePack = await Mapbox.offlineManagerLegacy.getPack();
   *
   * @param  {String}  name  Name of the offline pack.
   * @return {OfflinePack}
   */
  async getPack(name: string): Promise<OfflinePack | undefined> {
    await this._initialize();
    return this._offlinePacks[name];
  }

  async _initialize(forceInit?: boolean): Promise<boolean> {
    if (this._hasInitialized && !forceInit) {
      return true;
    }

    const nativeOfflinePacks = await MapboxOfflineManager.getPacks();

    for (const nativeOfflinePack of nativeOfflinePacks) {
      const offlinePack = new OfflinePack(nativeOfflinePack);
      this._offlinePacks[offlinePack.name] = offlinePack;
    }

    this._hasInitialized = true;
    return true;
  }
}

const offlineManagerLegacy = new OfflineManagerLegacy();
export default offlineManagerLegacy;
