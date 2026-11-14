import Mapbox from '@rnmapbox/maps';

import ScreenshotMap from './ScreenshotMap';

const polygons: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { kind: 'park' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-8, -6],
            [-1, -6],
            [-1, 4],
            [-8, 4],
            [-8, -6],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { kind: 'water' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [1, -2],
            [8, -6],
            [6, 5],
            [1, -2],
          ],
        ],
      },
    },
  ],
};

const lines: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { width: 6 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-10, 7],
          [-3, 9],
          [3, 6],
          [10, 8],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { width: 2 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-10, -9],
          [0, -7],
          [10, -9],
        ],
      },
    },
  ],
};

const ScreenshotFillLine = () => (
  <ScreenshotMap>
    <Mapbox.ShapeSource id="polygons" shape={polygons}>
      <Mapbox.FillLayer
        id="polygons-fill"
        style={{
          fillColor: [
            'match',
            ['get', 'kind'],
            'park',
            '#5aa469',
            'water',
            '#4a90d9',
            '#000000',
          ],
          fillOpacity: 0.8,
          fillOutlineColor: '#202020',
        }}
      />
      <Mapbox.LineLayer
        id="polygons-outline"
        style={{ lineColor: '#202020', lineWidth: 2 }}
      />
    </Mapbox.ShapeSource>
    <Mapbox.ShapeSource id="lines" shape={lines}>
      <Mapbox.LineLayer
        id="lines"
        style={{
          lineColor: '#d0021b',
          lineWidth: ['get', 'width'],
          lineCap: 'round',
          lineJoin: 'round',
          lineDasharray: [2, 1],
        }}
      />
    </Mapbox.ShapeSource>
  </ScreenshotMap>
);

ScreenshotFillLine.metadata = { title: 'Screenshot Fill Line' };

export default ScreenshotFillLine;
