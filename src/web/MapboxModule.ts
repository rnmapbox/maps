import mapboxgl from 'mapbox-gl';

import { warnUnimplemented } from './UnimplementedComponent';

export const LineJoin = {
  Bevel: 'bevel',
  Round: 'round',
  Miter: 'miter',
};

export const StyleURL = {
  Street: 'mapbox://styles/mapbox/streets-v11',
  Dark: 'mapbox://styles/mapbox/dark-v10',
  Light: 'mapbox://styles/mapbox/light-v10',
  Outdoors: 'mapbox://styles/mapbox/outdoors-v11',
  Satellite: 'mapbox://styles/mapbox/satellite-v9',
  SatelliteStreet: 'mapbox://styles/mapbox/satellite-streets-v11',
  TrafficDay: 'mapbox://styles/mapbox/navigation-preview-day-v4',
  TrafficNight: 'mapbox://styles/mapbox/navigation-preview-night-v4',
};

export const StyleSource = {
  DefaultSourceID: 'composite',
};

export const OfflinePackDownloadState = {
  Inactive: 0,
  Active: 1,
  Complete: 2,
  Unknown: 3,
};

export const TileServers = {
  Mapbox: 'mapbox',
};

export enum UserTrackingMode {
  Follow = 'normal',
  FollowWithHeading = 'compass',
  FollowWithCourse = 'course',
}

/** @deprecated UserTrackingModes is deprecated use UserTrackingMode */
export const UserTrackingModes = UserTrackingMode;

export enum UserLocationRenderMode {
  Native = 'native',
  Normal = 'normal',
}

export const setAccessToken = (token: string) => {
  mapboxgl.accessToken = token;
};

export const getAccessToken = async () => mapboxgl.accessToken;

// Custom headers would need transformRequest, and extra headers on
// cross-origin tile requests trigger CORS preflights that api.mapbox.com
// rejects, so these are no-ops on web for now.
export const addCustomHeader = (
  _headerName: string,
  _headerValue: string,
  _options?: { urlRegexp?: string },
) => {
  warnUnimplemented('addCustomHeader');
};

export const removeCustomHeader = (_headerName: string) => {
  warnUnimplemented('removeCustomHeader');
};

export const setTelemetryEnabled = (_telemetryEnabled: boolean) => {};

export const setConnected = (_connected: boolean) => {};

export const setWellKnownTileServer = (_tileServer: string) => {};

export const clearData = async () => {};

const MapboxModule = {
  LineJoin,
  StyleURL,
  StyleSource,
  OfflinePackDownloadState,
  TileServers,
  UserTrackingMode,
  UserTrackingModes,
  UserLocationRenderMode,
  setAccessToken,
  getAccessToken,
  addCustomHeader,
  removeCustomHeader,
  setTelemetryEnabled,
  setConnected,
  setWellKnownTileServer,
  clearData,
};

export default MapboxModule;
