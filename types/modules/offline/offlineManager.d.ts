export const OfflineModuleEventEmitter: NativeEventEmitter;
export default offlineManager;
import { NativeEventEmitter } from "react-native";
declare const offlineManager: OfflineManager;
/**
 * OfflineManager implements a singleton (shared object) that manages offline packs.
 * All of this class’s instance methods are asynchronous, reflecting the fact that offline resources are stored in a database.
 * The shared object maintains a canonical collection of offline packs.
 */
declare class OfflineManager {
    _hasInitialized: boolean;
    _offlinePacks: {};
    _progressListeners: {};
    _errorListeners: {};
    _onProgress(e: any): void;
    _onError(e: any): void;
    subscriptionProgress: import("react-native").EmitterSubscription | null;
    subscriptionError: import("react-native").EmitterSubscription | null;
    /**
     * Creates and registers an offline pack that downloads the resources needed to use the given region offline.
     *
     * @example
     *
     * const progressListener = (offlineRegion, status) => console.log(offlineRegion, status);
     * const errorListener = (offlineRegion, err) => console.log(offlineRegion, err);
     *
     * await MapboxGL.offlineManager.createPack({
     *   name: 'offlinePack',
     *   styleURL: 'mapbox://...',
     *   minZoom: 14,
     *   maxZoom: 20,
     *   bounds: [[neLng, neLat], [swLng, swLat]]
     * }, progressListener, errorListener)
     *
     * @param  {OfflineCreatePackOptions} options Create options for a offline pack that specifices zoom levels, style url, and the region to download.
     * @param  {Callback=} progressListener Callback that listens for status events while downloading the offline resource.
     * @param  {Callback=} errorListener Callback that listens for status events while downloading the offline resource.
     * @return {void}
     */
    createPack(options: OfflineCreatePackOptions, progressListener?: Callback | undefined, errorListener?: Callback | undefined): void;
    /**
     * Invalidates the specified offline pack. This method checks that the tiles in the specified offline pack match those from the server. Local tiles that do not match the latest version on the server are updated.
     *
     * This is more efficient than deleting the offline pack and downloading it again. If the data stored locally matches that on the server, new data will not be downloaded.
     *
     * @example
     * await MapboxGL.offlineManager.invalidatePack('packName')
     *
     * @param  {String}  name  Name of the offline pack.
     * @return {void}
     */
    invalidatePack(name: string): void;
    /**
     * Unregisters the given offline pack and allows resources that are no longer required by any remaining packs to be potentially freed.
     *
     * @example
     * await MapboxGL.offlineManager.deletePack('packName')
     *
     * @param  {String}  name  Name of the offline pack.
     * @return {void}
     */
    deletePack(name: string): void;
    /**
     * Forces a revalidation of the tiles in the ambient cache and downloads a fresh version of the tiles from the tile server.
     * This is the recommend method for clearing the cache.
     * This is the most efficient method because tiles in the ambient cache are re-downloaded to remove outdated data from a device.
     * It does not erase resources from the ambient cache or delete the database, which can be computationally expensive operations that may carry unintended side effects.
     *
     * @example
     * await MapboxGL.offlineManager.invalidateAmbientCache();
     *
     * @return {void}
     */
    invalidateAmbientCache(): void;
    /**
     * Erases resources from the ambient cache.
     * This method clears the cache and decreases the amount of space that map resources take up on the device.
     *
     * @example
     * await MapboxGL.offlineManager.clearAmbientCache();
     *
     * @return {void}
     */
    clearAmbientCache(): void;
    /**
     * Migrates the offline cache from pre-v10 SDKs to the new v10 cache location
     *
     * @example
     * await MapboxGL.offlineManager.migrateOfflineCache()
     *
     * @return {void}
     */
    migrateOfflineCache(): void;
    /**
     * Sets the maximum size of the ambient cache in bytes. Disables the ambient cache if set to 0.
     * This method may be computationally expensive because it will erase resources from the ambient cache if its size is decreased.
     *
     * @example
     * await MapboxGL.offlineManager.setMaximumAmbientCacheSize(5000000);
     *
     * @param  {Number}  size  Size of ambient cache.
     * @return {void}
     */
    setMaximumAmbientCacheSize(size: number): void;
    /**
     * Deletes the existing database, which includes both the ambient cache and offline packs, then reinitializes it.
     *
     * @example
     * await MapboxGL.offlineManager.resetDatabase();
     *
     * @return {void}
     */
    resetDatabase(): void;
    /**
     * Retrieves all the current offline packs that are stored in the database.
     *
     * @example
     * const offlinePacks = await MapboxGL.offlineManager.getPacks();
     *
     * @return {Array<OfflinePack>}
     */
    getPacks(): Array<OfflinePack>;
    /**
     * Retrieves an offline pack that is stored in the database by name.
     *
     * @example
     * const offlinePack = await MapboxGL.offlineManager.getPack();
     *
     * @param  {String}  name  Name of the offline pack.
     * @return {OfflinePack}
     */
    getPack(name: string): OfflinePack;
    /**
     * Sideloads offline db
     *
     * @example
     * await MapboxGL.offlineManager.mergeOfflineRegions(path);
     *
     * @param {String} path Path to offline tile db on file system.
     * @return {void}
     */
    mergeOfflineRegions(path: string): void;
    /**
     * Sets the maximum number of Mapbox-hosted tiles that may be downloaded and stored on the current device.
     * The Mapbox Terms of Service prohibit changing or bypassing this limit without permission from Mapbox.
     *
     * @example
     * MapboxGL.offlineManager.setTileCountLimit(1000);
     *
     * @param {Number} limit Map tile limit count.
     * @return {void}
     */
    setTileCountLimit(limit: number): void;
    /**
     * Sets the period at which download status events will be sent over the React Native bridge.
     * The default is 500ms.
     *
     * @example
     * MapboxGL.offlineManager.setProgressEventThrottle(500);
     *
     * @param {Number} throttleValue event throttle value in ms.
     * @return {void}
     */
    setProgressEventThrottle(throttleValue: number): void;
    /**
     * Subscribe to download status/error events for the requested offline pack.
     * Note that createPack calls this internally if listeners are provided.
     *
     * @example
     * const progressListener = (offlinePack, status) => console.log(offlinePack, status)
     * const errorListener = (offlinePack, err) => console.log(offlinePack, err)
     * MapboxGL.offlineManager.subscribe('packName', progressListener, errorListener)
     *
     * @param  {String} packName           Name of the offline pack.
     * @param  {Callback} progressListener Callback that listens for status events while downloading the offline resource.
     * @param  {Callback} errorListener      Callback that listens for status events while downloading the offline resource.
     * @return {void}
     */
    subscribe(packName: string, progressListener: Callback, errorListener: Callback): void;
    /**
     * Unsubscribes any listeners associated with the offline pack.
     * It's a good idea to call this on componentWillUnmount.
     *
     * @example
     * MapboxGL.offlineManager.unsubscribe('packName')
     *
     * @param  {String} packName Name of the offline pack.
     * @return {void}
     */
    unsubscribe(packName: string): void;
    _initialize(): Promise<boolean>;
    _hasListeners(name: any, listenerMap: any): boolean;
}
import OfflineCreatePackOptions from "./OfflineCreatePackOptions";
import OfflinePack from "./OfflinePack";
//# sourceMappingURL=offlineManager.d.ts.map