import Mapbox from '@rnmapbox/maps';

import ScreenshotMap from './ScreenshotMap';

const pin = require('../../assets/pin.png');

const points: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    [-8, 6, 1, 'a'],
    [-3, -5, 4, 'b'],
    [2, 7, 7, 'c'],
    [7, -3, 10, 'a'],
    [0, 0, 5, 'b'],
  ].map(([lon, lat, magnitude, kind]) => ({
    type: 'Feature',
    properties: { magnitude, kind },
    geometry: { type: 'Point', coordinates: [lon as number, lat as number] },
  })),
};

const ScreenshotCircleSymbol = () => (
  <ScreenshotMap>
    <Mapbox.Images images={{ pin }} />
    <Mapbox.ShapeSource id="points" shape={points}>
      <Mapbox.CircleLayer
        id="points-circle"
        style={{
          circleRadius: [
            'interpolate',
            ['linear'],
            ['get', 'magnitude'],
            1,
            6,
            10,
            30,
          ],
          circleColor: [
            'match',
            ['get', 'kind'],
            'a',
            '#f5a623',
            'b',
            '#7ed321',
            '#9013fe',
          ],
          circleOpacity: 0.7,
          circleStrokeColor: '#202020',
          circleStrokeWidth: 2,
        }}
      />
      <Mapbox.SymbolLayer
        id="points-symbol"
        style={{
          iconImage: 'pin',
          iconAnchor: 'bottom',
          iconSize: [
            'interpolate',
            ['linear'],
            ['get', 'magnitude'],
            1,
            0.5,
            10,
            1,
          ],
          iconAllowOverlap: true,
          iconIgnorePlacement: true,
        }}
      />
    </Mapbox.ShapeSource>
  </ScreenshotMap>
);

ScreenshotCircleSymbol.metadata = { title: 'Screenshot Circle Symbol' };

export default ScreenshotCircleSymbol;
