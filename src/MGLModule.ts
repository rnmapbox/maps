import { NativeModules } from 'react-native';

interface MGLModule {
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
  getAccessToken(): Promise<string>;
  setTelemetryEnabled(telemetryEnabled: boolean): void;
  setConnected(connected: boolean): void;
}

const MGLModule: MGLModule = { ...NativeModules.MGLModule };

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
  getAccessToken,
  setTelemetryEnabled,
  setConnected,
} = MGLModule;
