import mapboxgl from 'mapbox-gl';

const MapboxModule = {
  LineJoin: {},

  StyleURL: {
    Street: 'mapbox://styles/mapbox/streets-v11',
    Satellite: 'mapbox://styles/mapbox/satellite-v9',
  },

  setAccessToken: (token) => {
    mapboxgl.accessToken = token;
  },
};

export default MapboxModule;
