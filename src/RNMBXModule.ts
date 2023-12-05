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

const RNMBXModule: RNMBXModule = { ...NativeModules.RNMBXModule };

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
