import NativeRNMBXTileStoreModule from '../../specs/NativeRNMBXTileStoreModule';

type TileDataDomain = 'Maps' | 'Navigation' | 'Search' | 'ADAS';
type TileDataValue = string | number;

/**
 * TileStore manages downloads and storage for requests to tile-related API endpoints,
 * enforcing a disk usage quota: tiles available on disk may be deleted to make room for a new download.
 * This interface can be used by an app developer to set the disk quota.
 */

export default class TileStore {
  __nativeTag: number;
  /**
   * Creates a TileStore instance for the given storage path. The returned instance exists as long as it is retained by the client.
   * If the tile store instance already exists for the given path this method will return it without creating a new instance,
   * thus making sure that there is only one tile store instance for a path at a time. If the given path is empty, the tile
   * store at the default location is returned. On iOS, this storage path is excluded from automatic cloud backup. On Android,
   * please exclude the storage path in your Manifest.
   * Please refer to the [Android Documentation](https://developer.android.com/guide/topics/data/autobackup.html#IncludingFiles) for detailed information.
   *
   * @param path  The path on disk where tiles and metadata will be stored
   */
  static async shared(path?: string): Promise<TileStore> {
    const __nativeTag = await NativeRNMBXTileStoreModule.shared(path);
    return new TileStore(__nativeTag);
  }

  private constructor(__nativeTag: number) {
    this.__nativeTag = __nativeTag;
  }

  /**
   * Sets additional options for this instance that are specific to a data type.
Params:
key – The configuration option that should be changed. Valid keys are listed in \c TileStoreOptions. domain – The data type this setting should be applied for. value – The value for the configuration option, or null if it should be reset.
   */
  async setOption(
    key: string,
    domain: TileDataDomain,
    value: TileDataValue,
  ): Promise<void> {
    await NativeRNMBXTileStoreModule.setOption(this.__nativeTag, key, domain, {
      value,
    });
  }
}
