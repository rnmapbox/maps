import { NativeModules } from 'react-native';

import { isAnchoredUrlPattern } from './utils/customHeaderPattern';

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
    Inactive: string;
    Active: string;
    Complete: string;
    Unknown?: string;
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
  addCustomHeaderWithOptions(
    headerName: string,
    headerValue: string,
    options: { urlRegexp?: string },
  ): void;
  setAccessToken(accessToken: string | null): Promise<string | null>;
  setWellKnownTileServer(tileServer: string): void;
  clearData(): Promise<void>;
  getAccessToken(): Promise<string>;
  setTelemetryEnabled(telemetryEnabled: boolean): void;
  setConnected(connected: boolean): void;
  setLanguage(language: string | string[] | null): Promise<void>;
}

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

const warnedUnanchoredUrlPatterns = new Set<string>();

/**
 * Add a custom header to HTTP requests.
 * @param headerName - The name of the header
 * @param headerValue - The value of the header
 * @param options - Optional configuration.
 * `urlRegexp` is a regular expression string (not a RegExp object): the header is only
 * sent when the pattern matches anywhere in the request URL, on both iOS and Android.
 * Start it with `^` and end the host with `/` (or `:port`), e.g. `'^https://tiles\\.example\\.com/'`.
 * Unanchored patterns are deprecated and will be rejected in v11.
 */
function addCustomHeader(
  headerName: string,
  headerValue: string,
  options?: { urlRegexp?: string },
): void {
  const urlRegexp = options?.urlRegexp;
  if (
    urlRegexp != null &&
    !isAnchoredUrlPattern(urlRegexp) &&
    !warnedUnanchoredUrlPatterns.has(urlRegexp)
  ) {
    warnedUnanchoredUrlPatterns.add(urlRegexp);
    console.warn(
      `[deprecation] @rnmapbox/maps addCustomHeader: the urlRegexp \`${urlRegexp}\` for header "${headerName}" is not anchored. Unanchored custom-header URL patterns are deprecated and will be rejected in v11. They match anywhere in the URL, so the header can be sent to look-alike hosts (e.g. tiles.example.com.evil.com). Anchor your pattern, e.g. \`^https://tiles\\.example\\.com/\`.`,
    );
  }
  if (options) {
    RNMBXModule.addCustomHeaderWithOptions(headerName, headerValue, options);
  } else {
    RNMBXModule.addCustomHeader(headerName, headerValue);
  }
}

export const {
  StyleURL,
  OfflinePackDownloadState,
  LineJoin,
  StyleSource,
  TileServers,
  removeCustomHeader,
  setAccessToken,
  setWellKnownTileServer,
  clearData,
  getAccessToken,
  setTelemetryEnabled,
  setConnected,
  setLanguage,
} = RNMBXModule;

/**
 * Sets the URL mapbox-gl loads its web worker from (`mapboxgl.workerUrl`), for environments where its
 * built-in worker fails, like Expo Snack. The worker is started as a classic (non-module) worker.
 * Web only, does nothing on iOS and Android.
 * @param url - URL of a mapbox-gl CSP worker build, e.g. a blob URL of `mapbox-gl-csp-worker.js`
 */
function setWorkerUrl(_url: string): void {}

export { addCustomHeader, setWorkerUrl };
