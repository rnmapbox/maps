import { NativeModules } from 'react-native';

interface RNMBXModule {
  StyleURL: {
    Street: URL;
    Outdoors: URL;
    Light: URL;
    Dark: URL;
    Satellite: URL;
    SatelliteStreet: URL;
  };
  OfflinePackDownloadState: {
    Inactive: string | number;
    Active: string | number;
    Complete: string | number;
    Unknown?: string | number;
  };
  LineJoin: {
    Bevel: string | number;
    Round: string | number;
    Miter: string | number;
  };
  StyleSource: {
    DefaultSourceID: string;
  };
  TileServers: {
    Mapbox: string;
  };

  removeCustomHeader(headerName: string): void;
  addCustomHeader(headerName: string, headerValue: string): void;
  setAccessToken(accessToken: string | null): Promise<string | null>;
  setWellKnownTileServer(tileServer: string): void;
  clearData(): Promise<void>;
  getAccessToken(): Promise<string>;
  setTelemetryEnabled(telemetryEnabled: boolean): void;
  setConnected(connected: boolean): void;
}

// eslint-disable-next-line prefer-destructuring
const RNMBXModule: RNMBXModule = NativeModules.RNMBXModule;
if (NativeModules.RNMBXModule == null) {
  if ((global as { expo?: unknown }).expo != null) {
    // global.expo.modules.ExponentConstants;
    throw new Error(
      '@rnmapbox/maps native code not available. Make sure you have linked the library and rebuild your app. See https://rnmapbox.github.io/docs/install?rebuild=expo#rebuild',
    );
  } else {
    throw new Error(
      '@rnmapbox/maps native code not available. Make sure you have linked the library and rebuild your app. See https://rnmapbox.github.io/docs/install',
    );
  }
}

export const {
  StyleURL,
  OfflinePackDownloadState,
  LineJoin,
  StyleSource,
  TileServers,
  removeCustomHeader,
  addCustomHeader,
  setAccessToken,
  setWellKnownTileServer,
  clearData,
  getAccessToken,
  setTelemetryEnabled,
  setConnected,
} = RNMBXModule;
