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

  test('setWorkerUrl starts the worker as a classic worker', () => {
    const Worker = jest.fn(function (this: object) {
      return this;
    });
    const globals = globalThis as { Worker?: unknown };
    const previousWorker = globals.Worker;
    globals.Worker = Worker;
    try {
      setWorkerUrl('blob:worker');
      const worker = new mapboxgl.workerClass();

      expect(Worker).toHaveBeenCalledWith('blob:worker');
      expect(worker).toBe(Worker.mock.instances[0]);
    } finally {
      globals.Worker = previousWorker;
    }
  });
});
