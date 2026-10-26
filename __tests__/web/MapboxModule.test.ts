import mapboxgl from 'mapbox-gl';

import { setWorkerUrl } from '../../src/web/MapboxModule';

jest.mock('mapbox-gl', () => ({
  __esModule: true,
  default: {},
}));

describe('web Mapbox module', () => {
  test('setWorkerUrl sets the mapbox-gl worker url', () => {
    setWorkerUrl('blob:worker');

    expect(mapboxgl.workerUrl).toBe('blob:worker');
  });
});
