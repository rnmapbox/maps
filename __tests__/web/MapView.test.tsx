import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import mapboxgl from 'mapbox-gl';

import MapView from '../../src/web/components/MapView';

jest.mock('mapbox-gl', () => ({
  __esModule: true,
  default: {
    Map: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      remove: jest.fn(),
      setStyle: jest.fn(),
      setProjection: jest.fn(),
      getScaleFactor: jest.fn(() => 1),
      setScaleFactor: jest.fn(),
    })),
  },
}));

const MockMap = mapboxgl.Map as unknown as jest.Mock;

function renderMapView(props: React.ComponentProps<typeof MapView>) {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<MapView {...props} />, {
      createNodeMock: () => ({}),
    });
  });
  return renderer;
}

describe('web MapView', () => {
  beforeEach(() => {
    MockMap.mockClear();
  });

  test('creates the map with the projection prop', () => {
    renderMapView({ projection: 'globe' });

    expect(MockMap).toHaveBeenCalledWith(
      expect.objectContaining({ projection: 'globe' }),
    );
  });

  test('applies projection changes with setProjection', () => {
    const renderer = renderMapView({ projection: 'globe' });
    const map = MockMap.mock.results[0]!.value;

    act(() => {
      renderer.update(<MapView projection="mercator" />);
    });
    expect(map.setProjection).toHaveBeenCalledWith('mercator');

    act(() => {
      renderer.update(<MapView />);
    });
    expect(map.setProjection).toHaveBeenLastCalledWith(null);
    expect(map.setStyle).not.toHaveBeenCalled();
  });
});
