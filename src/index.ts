export * from './Mapbox';
import * as Mapbox from './Mapbox';

// Add export for MBTiles
export { default as MBTiles } from './modules/MBTiles';
export type { MBTilesSource } from './modules/MBTiles';

export default Mapbox;
