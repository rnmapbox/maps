import { type ReactNode, useContext, useEffect, useState } from 'react';
import type { GeoJSONSource, GeoJSONSourceSpecification } from 'mapbox-gl';

import MapContext from '../MapContext';
import SourceContext from '../SourceContext';
import { omitUndefined } from '../utils/styleProps';

type Props = {
  id: string;
  url?: string;
  shape?: GeoJSON.GeoJSON | string;
  cluster?: boolean;
  clusterRadius?: number;
  clusterMaxZoomLevel?: number;
  clusterProperties?: object;
  maxZoomLevel?: number;
  buffer?: number;
  tolerance?: number;
  lineMetrics?: boolean;
  children?: ReactNode;
};

const emptyCollection: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

function sourceData({ url, shape }: Props) {
  return url ?? shape ?? emptyCollection;
}

/**
 * GeoJSON source. Child layers get its id as their default sourceID.
 */
export function ShapeSource(props: Props) {
  const { map, styleGeneration = 0 } = useContext(MapContext);
  const { id } = props;
  // Children render only after the source exists, because their effects run
  // before ours. `count` remounts them whenever the source is re-created,
  // since that removes its layers.
  const [added, setAdded] = useState<{ generation: number; count: number }>();

  useEffect(() => {
    if (!map || styleGeneration === 0) {
      return;
    }
    map.addSource(
      id,
      omitUndefined({
        type: 'geojson',
        data: sourceData(props) as GeoJSONSourceSpecification['data'],
        cluster: props.cluster,
        clusterRadius: props.clusterRadius,
        clusterMaxZoom: props.clusterMaxZoomLevel,
        clusterProperties: props.clusterProperties,
        maxzoom: props.maxZoomLevel,
        buffer: props.buffer,
        tolerance: props.tolerance,
        lineMetrics: props.lineMetrics,
      } as GeoJSONSourceSpecification),
    );
    setAdded((prev) => ({
      generation: styleGeneration,
      count: (prev?.count ?? 0) + 1,
    }));

    return () => {
      // MapView removes the map before our cleanup runs on unmount.
      if (map._removed) {
        return;
      }
      // Parent effects are cleaned up before children's, and a source can't
      // be removed while layers use it.
      const style = map.getStyle();
      if (!style) {
        return;
      }
      for (const layer of style.layers) {
        if ('source' in layer && layer.source === id) {
          map.removeLayer(layer.id);
        }
      }
      if (map.getSource(id)) {
        map.removeSource(id);
      }
    };
    // Changing cluster options needs a new source, other props update below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    map,
    styleGeneration,
    id,
    props.cluster,
    props.clusterRadius,
    props.clusterMaxZoomLevel,
  ]);

  useEffect(() => {
    if (map && added?.generation === styleGeneration) {
      (map.getSource(id) as GeoJSONSource | undefined)?.setData(
        sourceData(props),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.shape, props.url]);

  if (added?.generation !== styleGeneration) {
    return null;
  }
  return (
    <SourceContext.Provider value={id} key={added.count}>
      {props.children}
    </SourceContext.Provider>
  );
}

export default ShapeSource;
