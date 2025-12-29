export * from './Mapbox.native';
import * as Mapbox from './Mapbox.native';

// Add export for MBTiles
export { default as MBTiles, MBTilesSource } from './modules/MBTiles';

export default Mapbox;
