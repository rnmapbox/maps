import MapboxModule from './MapboxModule';
import Camera from './components/Camera';
import MapView from './components/MapView';
import Logger from './utils/Logger';

const ExportedComponents = {
  Camera,
  MapView,
  Logger,
};

const Mapbox = {
  ...MapboxModule,
  ...ExportedComponents,
};

export { Camera, MapView, Logger };
export default Mapbox;
