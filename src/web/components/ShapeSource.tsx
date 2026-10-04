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

function removeSourceAndItsLayers(map: mapboxgl.Map, id: string) {
  for (const layer of map.getStyle()?.layers ?? []) {
    if ('source' in layer && layer.source === id) {
      map.removeLayer(layer.id);
    }
  }
  if (map.getSource(id)) {
    map.removeSource(id);
  }
}

export function ShapeSource(props: Props) {
  const { map, styleGeneration = 0 } = useContext(MapContext);
  const { id } = props;
  const [addedSource, setAddedSource] = useState<{
    styleGeneration: number;
    instance: number;
  }>();

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
    setAddedSource((previous) => ({
      styleGeneration,
      instance: (previous?.instance ?? 0) + 1,
    }));

    return () => {
      if (!map._removed) {
        removeSourceAndItsLayers(map, id);
      }
    };
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
    if (map && addedSource?.styleGeneration === styleGeneration) {
      (map.getSource(id) as GeoJSONSource | undefined)?.setData(
        sourceData(props),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.shape, props.url]);

  if (addedSource?.styleGeneration !== styleGeneration) {
    return null;
  }
  return (
    <SourceContext.Provider value={id} key={addedSource.instance}>
      {props.children}
    </SourceContext.Provider>
  );
}

export default ShapeSource;
