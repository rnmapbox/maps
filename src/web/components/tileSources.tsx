import type { ReactNode } from 'react';

import { Source } from './Source';

type TileSourceProps = {
  id: string;
  url?: string;
  tileUrlTemplates?: string[];
  minZoomLevel?: number;
  maxZoomLevel?: number;
  tileSize?: number;
  tms?: boolean;
  attribution?: string;
  sourceBounds?: number[];
  children?: ReactNode;
};

function createTileSource(
  type: 'vector' | 'raster' | 'raster-dem' | 'raster-array',
  displayName: string,
) {
  const TileSource = (props: TileSourceProps) => {
    const specification = {
      type,
      url: props.url,
      tiles: props.tileUrlTemplates,
      minzoom: props.minZoomLevel,
      maxzoom: props.maxZoomLevel,
      tileSize: type === 'vector' ? undefined : props.tileSize,
      scheme: props.tms ? 'tms' : undefined,
      attribution: props.attribution,
      bounds: props.sourceBounds,
    } as const;
    return (
      <Source
        id={props.id}
        specification={specification as never}
        recreateOn={[JSON.stringify(specification)]}
      >
        {props.children}
      </Source>
    );
  };
  TileSource.displayName = displayName;
  return TileSource;
}

export const VectorSource = createTileSource('vector', 'VectorSource');
export const RasterSource = createTileSource('raster', 'RasterSource');
export const RasterDemSource = createTileSource(
  'raster-dem',
  'RasterDemSource',
);
export const RasterArraySource = createTileSource(
  'raster-array',
  'RasterArraySource',
);
