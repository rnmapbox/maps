import { createLayer } from './AbstractLayer';

export const BackgroundLayer = createLayer('background', 'BackgroundLayer');
export const CircleLayer = createLayer('circle', 'CircleLayer');
export const FillExtrusionLayer = createLayer(
  'fill-extrusion',
  'FillExtrusionLayer',
);
export const FillLayer = createLayer('fill', 'FillLayer');
export const HeatmapLayer = createLayer('heatmap', 'HeatmapLayer');
export const HillshadeLayer = createLayer('hillshade', 'HillshadeLayer');
export const LineLayer = createLayer('line', 'LineLayer');
export const ModelLayer = createLayer('model', 'ModelLayer');
export const RasterLayer = createLayer('raster', 'RasterLayer');
export const RasterParticleLayer = createLayer(
  'raster-particle',
  'RasterParticleLayer',
);
export const SkyLayer = createLayer('sky', 'SkyLayer');
export const SymbolLayer = createLayer('symbol', 'SymbolLayer');
