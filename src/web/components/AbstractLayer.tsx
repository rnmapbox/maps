import { useContext, useEffect, useRef } from 'react';
import type { FilterSpecification, LayerSpecification } from 'mapbox-gl';

import MapContext from '../MapContext';
import SourceContext from '../SourceContext';
import { omitUndefined, toGLStyle, type GLStyle } from '../utils/styleProps';

export type LayerProps = {
  id: string;
  sourceID?: string;
  sourceLayerID?: string;
  aboveLayerID?: string;
  belowLayerID?: string;
  layerIndex?: number;
  filter?: FilterSpecification;
  minZoomLevel?: number;
  maxZoomLevel?: number;
  style?: { [key: string]: unknown };
};

function beforeId(
  map: mapboxgl.Map,
  { aboveLayerID, belowLayerID, layerIndex }: LayerProps,
) {
  if (belowLayerID) {
    return belowLayerID;
  }
  const layers = map.getStyle()?.layers ?? [];
  if (aboveLayerID) {
    const index = layers.findIndex((layer) => layer.id === aboveLayerID);
    return index >= 0 ? layers[index + 1]?.id : undefined;
  }
  if (layerIndex !== undefined) {
    return layers[layerIndex]?.id;
  }
  return undefined;
}

function isSameValue(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function applyChangedProperties(
  current: { [key: string]: unknown },
  next: { [key: string]: unknown },
  set: (name: string, value: unknown) => void,
) {
  for (const name of new Set([...Object.keys(current), ...Object.keys(next)])) {
    if (!isSameValue(current[name], next[name])) {
      set(name, next[name]);
    }
  }
}

export function useLayer(type: LayerSpecification['type'], props: LayerProps) {
  const { map, styleGeneration = 0 } = useContext(MapContext);
  const contextSourceID = useContext(SourceContext);
  const sourceID = props.sourceID ?? contextSourceID;
  const glStyle = toGLStyle(props.style);
  const applied = useRef<GLStyle>(glStyle);

  useEffect(() => {
    if (!map || styleGeneration === 0) {
      return;
    }
    applied.current = glStyle;
    map.addLayer(
      omitUndefined({
        id: props.id,
        type,
        source: sourceID,
        'source-layer': props.sourceLayerID,
        filter: props.filter,
        minzoom: props.minZoomLevel,
        maxzoom: props.maxZoomLevel,
        paint: glStyle.paint,
        layout: glStyle.layout,
      }) as LayerSpecification,
      beforeId(map, props),
    );
    return () => {
      if (!map._removed && map.getLayer(props.id)) {
        map.removeLayer(props.id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, styleGeneration, props.id, sourceID, props.sourceLayerID]);

  useEffect(() => {
    if (!map?.getLayer(props.id)) {
      return;
    }
    applyChangedProperties(
      applied.current.paint,
      glStyle.paint,
      (name, value) =>
        map.setPaintProperty(props.id, name as never, value as never),
    );
    applyChangedProperties(
      applied.current.layout,
      glStyle.layout,
      (name, value) =>
        map.setLayoutProperty(props.id, name as never, value as never),
    );
    applied.current = glStyle;
  });

  useEffect(() => {
    if (map?.getLayer(props.id)) {
      map.setFilter(props.id, props.filter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(props.filter)]);

  useEffect(() => {
    if (map?.getLayer(props.id)) {
      map.setLayerZoomRange(
        props.id,
        props.minZoomLevel ?? 0,
        props.maxZoomLevel ?? 24,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.minZoomLevel, props.maxZoomLevel]);
}

export function createLayer(type: LayerSpecification['type']) {
  const Layer = (props: LayerProps) => {
    useLayer(type, props);
    return null;
  };
  Layer.displayName = `${type}Layer`;
  return Layer;
}
