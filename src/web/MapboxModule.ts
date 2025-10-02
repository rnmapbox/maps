import mapboxgl from 'mapbox-gl';

export const LineJoin = {
  Bevel: 'bevel',
  Round: 'round',
  Miter: 'miter',
};

export const StyleURL = {
  Street: 'mapbox://styles/mapbox/streets-v11',
  Satellite: 'mapbox://styles/mapbox/satellite-v9',
};

export const setAccessToken = (token: string) => {
  mapboxgl.accessToken = token;
};

const MapboxModule = {
  LineJoin,
  StyleURL,
  setAccessToken,
};

export default MapboxModule;
