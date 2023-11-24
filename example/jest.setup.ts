jest.mock('@rnmapbox/maps', () => ({
  StyleURL: {
    Satellite: 'mapbox://styles/mapbox/satellite-v9',
  },
  Logger: {
    setLogLevel: jest.fn(),
  },
}));
