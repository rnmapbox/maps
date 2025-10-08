import {
  EventSubscription,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

import { isUndefined, isFunction } from '../../utils';

export {
  default as OfflineLegacyCreatePackOptions,
  type OfflineLegacyCreatePackOptionsArgs,
} from './OfflineLegacyCreatePackOptions';
import OfflineLegacyCreatePackOptions, {
  type OfflineLegacyCreatePackOptionsArgs,
} from './OfflineLegacyCreatePackOptions';
import OfflinePackLegacy from './OfflinePackLegacy';

const { RNMBXModule } = NativeModules;

const MapboxOfflineManager = NativeModules.RNMBXOfflineModuleLegacy;
export const OfflineModuleEventEmitter = new NativeEventEmitter(
  MapboxOfflineManager,
);

export type OfflineProgressStatus = {
  name: string;
  state: number;
  percentage: number;
  completedResourceSize: number;
  completedTileCount: number;
  completedResourceCount: number;
  requiredResourceCount: number;
  completedTileSize: number;
};

export enum OfflinePackErrorType {
  NOT_FOUND,
  SERVER,
  CONNECTION,
  RATE_LIMIT,
  DISK_FULL,
  TILE_COUNT_LIMIT_EXCEEDED,
  OTHER,
}

export type OfflinePackError = {
  name: string;
  message: string;
  isFatal: boolean;
  type: OfflinePackErrorType;
};

type ErrorEvent = {
  payload: OfflinePackError;
};

type ProgressEvent = {
  payload: OfflineProgressStatus;
};

type ProgressListener = (
  pack: OfflinePackLegacy,
  status: OfflineProgressStatus,
) => void;
type ErrorListener = (pack: OfflinePackLegacy, err: OfflinePackError) => void;

/**
 * OfflineManagerLegacy implements a singleton (shared object) that manages offline packs.
 * All of this class’s instance methods are asynchronous, reflecting the fact that offline resources are stored in a database.
 * The shared object maintains a canonical collection of offline packs.
 */
class OfflineManagerLegacy {
  private _hasInitialized: boolean;
  private _offlinePacks: Record<string, OfflinePackLegacy>;
  private _progressListeners: Record<string, ProgressListener>;
  private _errorListeners: Record<string, ErrorListener>;
  public subscriptionProgress: EventSubscription | null;
  public subscriptionError: EventSubscription | null;

  constructor() {
    this._hasInitialized = false;
    this._offlinePacks = {};

    this._progressListeners = {};
    this._errorListeners = {};

    this._onProgress = this._onProgress.bind(this);
    this._onError = this._onError.bind(this);

    this.subscriptionProgress = null;
    this.subscriptionError = null;
  }

  /**
   * Creates and registers an offline pack that downloads the resources needed to use the given region offline.
   *
   * @example
   *
   * const progressListener = (offlineRegion, status) => console.log(offlineRegion, status);
   * const errorListener = (offlineRegion, err) => console.log(offlineRegion, err);
   *
   * await Mapbox.offlineManager.createPack({
   *   name: 'offlinePack',
   *   styleURL: 'mapbox://...',
   *   minZoom: 14,
   *   maxZoom: 20,
   *   bounds: [[neLng, neLat], [swLng, swLat]]
   * }, progressListener, errorListener)
   *
   * @param  {OfflineLegacyCreatePackOptions} options Create options for a offline pack that specifices zoom levels, style url, and the region to download.
   * @param  {Callback=} progressListener Callback that listens for status events while downloading the offline resource.
   * @param  {Callback=} errorListener Callback that listens for status events while downloading the offline resource.
   * @return {void}
   */
  async createPack(
    options: OfflineLegacyCreatePackOptionsArgs,
    progressListener: ProgressListener,
    errorListener?: ErrorListener,
  ): Promise<OfflinePackLegacy> {
    await this._initialize();

    const packOptions = new OfflineLegacyCreatePackOptions(options);

    if (this._offlinePacks[packOptions.name]) {
      throw new Error(
        `Offline pack with name ${packOptions.name} already exists.`,
      );
    }

    const nativeOfflinePack =
      await MapboxOfflineManager.createPack(packOptions);
    this._offlinePacks[packOptions.name] = new OfflinePackLegacy(nativeOfflinePack);
    this.subscribe(packOptions.name, progressListener, errorListener);

    return this._offlinePacks[packOptions.name];
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
   * Sets the maximum number of Mapbox-hosted tiles that may be downloaded and stored on the current device.
   *
   * @example
   * Mapbox.offlineManager.setTileCountLimit(6000);
   *
   * @param {Number} limit Map tile limit count.
   * @return {void}
   */
  setTileCountLimit(limit: number): void {
    MapboxOfflineManager.setTileCountLimit(limit);
  }

  /**
   * Sets the timeout for the pack download when no progress updates have been sent, throws a timeout error
   *
   * @example
   * Mapbox.offlineManager.setTimeout(60);
   *
   * @param {Number} seconds Seconds after last progress update to fire an timeout error
   * @return {void}
   */
  setTimeout(seconds: number): void {
    MapboxOfflineManager.setTimeout(seconds);
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
  async getPacks(): Promise<OfflinePackLegacy[]> {
    await this._initialize();
    return Object.keys(this._offlinePacks).map(
      (name) => this._offlinePacks[name],
    ) as OfflinePack[];
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
  async getPack(name: string): Promise<OfflinePackLegacy | undefined> {
    await this._initialize();
    return this._offlinePacks[name];
  }

  /**
   * Subscribe to download status/error events for the requested offline pack.
   * Note that createPack calls this internally if listeners are provided.
   *
   * @example
   * const progressListener = (offlinePack, status) => console.log(offlinePack, status)
   * const errorListener = (offlinePack, err) => console.log(offlinePack, err)
   * Mapbox.offlineManager.subscribe('packName', progressListener, errorListener)
   *
   * @param  {String} packName           Name of the offline pack.
   * @param  {Callback} progressListener Callback that listens for status events while downloading the offline resource.
   * @param  {Callback} errorListener      Callback that listens for status events while downloading the offline resource.
   * @return {void}
   */
  async subscribe(
    packName: string,
    progressListener: ProgressListener,
    errorListener?: ErrorListener,
  ): Promise<void> {
    const totalProgressListeners = Object.keys(this._progressListeners).length;
    if (isFunction(progressListener)) {
      if (totalProgressListeners === 0) {
        this.subscriptionProgress = OfflineModuleEventEmitter.addListener(
          RNMBXModule.OfflineCallbackName.Progress,
          this._onProgress,
        );
      }
      this._progressListeners[packName] = progressListener;
    }

    const totalErrorListeners = Object.keys(this._errorListeners).length;
    if (isFunction(errorListener)) {
      if (totalErrorListeners === 0) {
        this.subscriptionError = OfflineModuleEventEmitter.addListener(
          RNMBXModule.OfflineCallbackName.Error,
          this._onError,
        );
      }
      this._errorListeners[packName] = errorListener;
    }

    // we need to manually set the pack observer on Android
    // if we're resuming a pack download instead of going thru the create flow
    // if (isAndroid() && this._offlinePacks[packName]) {
    //   try {
    //     // manually set a listener, since listeners are only set on create flow
    //     await MapboxOfflineManager.setPackObserver(packName);
    //   } catch (e) {
    //     console.log('Unable to set pack observer', e);
    //   }
    // }
  }

  /**
   * Unsubscribes any listeners associated with the offline pack.
   * It's a good idea to call this on componentWillUnmount.
   *
   * @example
   * Mapbox.offlineManager.unsubscribe('packName')
   *
   * @param  {String} packName Name of the offline pack.
   * @return {void}
   */
  unsubscribe(packName: string): void {
    delete this._progressListeners[packName];
    delete this._errorListeners[packName];

    if (
      Object.keys(this._progressListeners).length === 0 &&
      this.subscriptionProgress
    ) {
      this.subscriptionProgress.remove();
    }

    if (
      Object.keys(this._errorListeners).length === 0 &&
      this.subscriptionError
    ) {
      this.subscriptionError.remove();
    }
  }

  async _initialize(forceInit?: boolean): Promise<boolean> {
    if (this._hasInitialized && !forceInit) {
      return true;
    }

    const nativeOfflinePacks = await MapboxOfflineManager.getPacks();

    for (const nativeOfflinePack of nativeOfflinePacks) {
      const offlinePack = new OfflinePackLegacy(nativeOfflinePack);
      this._offlinePacks[offlinePack.name] = offlinePack;
    }

    this._hasInitialized = true;
    return true;
  }

  _onProgress(e: ProgressEvent): void {
    const { name, state } = e.payload;

    if (!this._hasListeners(name, this._progressListeners)) {
      return;
    }

    const pack = this._offlinePacks[name];
    this._progressListeners[name](pack, e.payload);

    // cleanup listeners now that they are no longer needed
    if (state === RNMBXModule.OfflinePackDownloadState.Complete) {
      this.unsubscribe(name);
    }
  }

  _onError(e: ErrorEvent): void {
    const { name } = e.payload;

    if (!this._hasListeners(name, this._errorListeners)) {
      return;
    }

    const pack = this._offlinePacks[name];
    this._errorListeners[name](pack, e.payload);
  }

  _hasListeners(
    name: string,
    listenerMap:
      | Record<string, ProgressListener>
      | Record<string, ErrorListener>,
  ): boolean {
    return (
      !isUndefined(this._offlinePacks[name]) && isFunction(listenerMap[name])
    );
  }
}

const offlineManagerLegacy = new OfflineManagerLegacy();
export default offlineManagerLegacy;
