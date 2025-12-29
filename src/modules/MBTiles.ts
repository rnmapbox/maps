import { NativeModules } from 'react-native';

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
 * MBTiles module for loading and using MBTiles files with Mapbox
 */
class MBTiles {
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
