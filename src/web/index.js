import MapboxModule from './MapboxModule';
import Camera from './components/Camera';
import MapView from './components/MapView';
import MarkerView from './components/MarkerView';
import Logger from './utils/Logger';

const ExportedComponents = {
  Camera,
  MapView,
  Logger,
  MarkerView,
};

const Mapbox = {
  ...MapboxModule,
  ...ExportedComponents,
};

export { Camera, MapView, Logger, MarkerView };
export default Mapbox;
