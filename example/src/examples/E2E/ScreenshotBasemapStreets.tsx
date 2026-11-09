import ScreenshotMap from './ScreenshotMap';

const ScreenshotBasemapStreets = () => (
  <ScreenshotMap
    styleURL="mapbox://styles/mapbox/streets-v12"
    centerCoordinate={[19.0402, 47.4979]}
    zoomLevel={14}
  />
);

ScreenshotBasemapStreets.metadata = { title: 'Screenshot Basemap Streets' };

export default ScreenshotBasemapStreets;
