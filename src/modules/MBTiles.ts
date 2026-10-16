import { Image as RNImage, NativeModules } from 'react-native';

const { RNMBXMBTiles } = NativeModules;

export interface MBTilesSource {
  id: string;
  url: string;
  isVector: boolean;
  format: string;
  minZoom?: number;
  maxZoom?: number;
}

/**
 * Represents a require() call for a bundled asset, e.g. require('./map.mbtiles')
 */
export type RequireSource = number;

/**
 * All supported MBTiles source types:
 * - `number` (require): A bundled asset loaded via require('./map.mbtiles')
 * - `{ filePath: string }`: An absolute file path on the device
 * - `{ asset: string }`: An asset name in the app bundle
 * - `{ url: string }`: A remote URL to download the MBTiles file from
 */
export type MBTilesAsyncSource =
  | RequireSource
  | { filePath: string }
  | { asset: string }
  | { url: string };

/**
 * MBTiles module for loading and using MBTiles files with Mapbox
 */
class MBTiles {
  /**
   * Initialize and activate an MBTiles source from various source types.
   *
   * Supports:
   * - `require('./map.mbtiles')` - bundled assets
   * - `{ filePath: 'file:///path/to/file.mbtiles' }` - absolute file paths
   * - `{ asset: 'map.mbtiles' }` - assets in the app bundle
   * - `{ url: 'https://example.com/map.mbtiles' }` - remote URLs (downloads first)
   *
   * @param source The MBTiles source (require, filePath, asset, or url)
   * @param sourceId Optional ID for the source (defaults to filename without extension)
   * @returns MBTilesSource object with source information
   *
   * @example
   * // Using require (recommended for bundled assets)
   * const source = await MBTiles.init(require('./assets/map.mbtiles'));
   *
   * // Using file path
   * const source = await MBTiles.init({ filePath: 'file:///path/to/map.mbtiles' });
   *
   * // Using app bundle asset
   * const source = await MBTiles.init({ asset: 'map.mbtiles' });
   *
   * // Using remote URL
   * const source = await MBTiles.init({ url: 'https://example.com/map.mbtiles' });
   */
  async init(
    source: MBTilesAsyncSource,
    sourceId?: string,
  ): Promise<MBTilesSource> {
    if (typeof source === 'number') {
      // It's a require(...) - a `number` which we need to resolve first
      const resolvedSource = RNImage.resolveAssetSource(source);

      if (!resolvedSource || !resolvedSource.uri) {
        throw new Error(
          `Could not resolve asset source for require(). Make sure the file exists and is properly bundled.`,
        );
      }

      if (resolvedSource.uri.startsWith('http')) {
        // In debug mode, assets are streamed over the network via Metro bundler
        return this.init({ url: resolvedSource.uri }, sourceId);
      } else if (
        resolvedSource.uri.startsWith('file://') ||
        resolvedSource.uri.startsWith('file:///') ||
        resolvedSource.uri.startsWith('/')
      ) {
        // In release mode, assets are embedded files
        return this.init({ filePath: resolvedSource.uri }, sourceId);
      } else {
        // It's a resource name (e.g., on Android: "asset:/map.mbtiles")
        return this.init({ asset: resolvedSource.uri }, sourceId);
      }
    } else if ('filePath' in source) {
      return this.initFromFile(source.filePath, sourceId);
    } else if ('asset' in source) {
      return this.initFromAsset(source.asset, sourceId);
    } else if ('url' in source) {
      return this.initFromURL(source.url, sourceId);
    } else {
      throw new Error(`Unknown MBTiles source type: ${JSON.stringify(source)}`);
    }
  }

  /**
   * Initialize and activate an MBTiles source from a file path
   * @param filePath Path to the MBTiles file
   * @param sourceId Optional ID for the source (defaults to filename without extension)
   * @returns MBTilesSource object with source information
   */
  async initFromFile(
    filePath: string,
    sourceId?: string,
  ): Promise<MBTilesSource> {
    return await RNMBXMBTiles.initMBTilesSource(filePath, sourceId || '');
  }

  /**
   * Initialize and activate an MBTiles source from an asset in the app bundle
   * @param assetName Name of the asset in the app bundle
   * @param sourceId Optional ID for the source (defaults to asset name without extension)
   * @returns MBTilesSource object with source information
   */
  async initFromAsset(
    assetName: string,
    sourceId?: string,
  ): Promise<MBTilesSource> {
    return await RNMBXMBTiles.initMBTilesSourceFromAsset(
      assetName,
      sourceId || '',
    );
  }

  /**
   * Initialize and activate an MBTiles source from a remote URL.
   * Downloads the file first, then initializes it.
   * @param url URL to download the MBTiles file from
   * @param sourceId Optional ID for the source (defaults to filename without extension)
   * @returns MBTilesSource object with source information
   */
  async initFromURL(url: string, sourceId?: string): Promise<MBTilesSource> {
    return await RNMBXMBTiles.initMBTilesSourceFromURL(url, sourceId || '');
  }

  /**
   * Get the HTTP URL for an active MBTiles source
   * @param sourceId ID of the MBTiles source
   * @returns URL to use in style JSON
   */
  async getURL(sourceId: string): Promise<string> {
    return await RNMBXMBTiles.getMBTilesURL(sourceId);
  }

  /**
   * Remove an MBTiles source and release its resources
   * @param sourceId ID of the MBTiles source to remove
   * @returns True if the source was removed, false if it didn't exist
   */
  async remove(sourceId: string): Promise<boolean> {
    return await RNMBXMBTiles.removeMBTilesSource(sourceId);
  }

  /**
   * Check if an MBTiles source is active
   * @param sourceId ID of the MBTiles source to check
   * @returns True if the source is active, false otherwise
   */
  async isActive(sourceId: string): Promise<boolean> {
    return await RNMBXMBTiles.isMBTilesSourceActive(sourceId);
  }

  /**
   * Get all active MBTiles sources
   * @returns Array of source IDs
   */
  async getActiveSources(): Promise<string[]> {
    return await RNMBXMBTiles.getActiveMBTilesSources();
  }

  /**
   * Manually start the MBTiles server
   * Call this at app startup to pre-start the server before loading any maps.
   * The server will also auto-start when initializing an MBTiles source.
   * @returns True if the server is running after the call
   */
  async startServer(): Promise<boolean> {
    return await RNMBXMBTiles.startServer();
  }

  /**
   * Manually stop the MBTiles server
   * Note: The server will also auto-stop when all MBTiles sources are removed.
   * @returns True if the server was stopped
   */
  async stopServer(): Promise<boolean> {
    return await RNMBXMBTiles.stopServer();
  }

  /**
   * Check if the MBTiles server is currently running
   * @returns True if the server is running
   */
  async isServerRunning(): Promise<boolean> {
    return await RNMBXMBTiles.isServerRunning();
  }
}

export default new MBTiles();
