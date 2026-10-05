import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { FilterSpecification, LayerSpecification } from 'mapbox-gl';

import MapContext from '../MapContext';
import SourceContext from '../SourceContext';
import { notifyLayerAdded, whenLayerExists } from '../layerWaiters';
import { omitUndefined, toGLStyle, type GLStyle } from '../utils/styleProps';

const defaultSourceID = 'composite';

export type LayerProps = {
  id: string;
  existing?: boolean;
  sourceID?: string;
  sourceLayerID?: string;
  aboveLayerID?: string;
  belowLayerID?: string;
  layerIndex?: number;
  filter?: FilterSpecification;
  minZoomLevel?: number;
  maxZoomLevel?: number;
  slot?: 'bottom' | 'middle' | 'top';
  style?: { [key: string]: unknown };
};

export type LayerRef = {
  setNativeProps: (props: Partial<LayerProps>) => void;
};

function layerToWaitFor({ aboveLayerID, belowLayerID }: LayerProps) {
  return belowLayerID ?? aboveLayerID;
}

function beforeId(
  map: mapboxgl.Map,
  { aboveLayerID, belowLayerID, layerIndex, slot }: LayerProps,
) {
  if (belowLayerID) {
    return belowLayerID;
  }
  const layers = map.getStyle()?.layers ?? [];
  if (aboveLayerID) {
    const index = layers.findIndex((layer) => layer.id === aboveLayerID);
    if (index < 0) {
      return undefined;
    }
    return layers
      .slice(index + 1)
      .find((layer) => ('slot' in layer ? layer.slot : undefined) === slot)?.id;
  }
  if (layerIndex !== undefined) {
    return layers[layerIndex]?.id;
  }
  return undefined;
}

function nonEmptyFilter(filter: FilterSpecification | undefined) {
  return Array.isArray(filter) && filter.length > 0 ? filter : undefined;
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

function applyStyle(
  map: mapboxgl.Map,
  id: string,
  current: GLStyle,
  next: GLStyle,
) {
  applyChangedProperties(current.paint, next.paint, (name, value) =>
    map.setPaintProperty(id, name as never, value as never),
  );
  applyChangedProperties(current.layout, next.layout, (name, value) =>
    map.setLayoutProperty(id, name as never, value as never),
  );
}

function setZoomRange(map: mapboxgl.Map, props: LayerProps) {
  map.setLayerZoomRange(
    props.id,
    props.minZoomLevel ?? 0,
    props.maxZoomLevel ?? 24,
  );
}

function adoptExistingLayer(
  map: mapboxgl.Map,
  props: LayerProps,
  glStyle: GLStyle,
) {
  applyStyle(map, props.id, { paint: {}, layout: {} }, glStyle);
  if (props.filter) {
    map.setFilter(props.id, nonEmptyFilter(props.filter));
  }
  if (props.minZoomLevel !== undefined || props.maxZoomLevel !== undefined) {
    setZoomRange(map, props);
  }
  if (props.slot) {
    map.setSlot(props.id, props.slot);
  }
}

function useOnChange(value: unknown, onChange: () => void) {
  const previous = useRef(value);
  useEffect(() => {
    if (previous.current !== value) {
      previous.current = value;
      onChange();
    }
  });
}

export function useLayer(type: LayerSpecification['type'], props: LayerProps) {
  const { map, styleGeneration = 0 } = useContext(MapContext);
  const contextSourceID = useContext(SourceContext);
  const sourceID = props.sourceID ?? contextSourceID ?? defaultSourceID;
  const glStyle = toGLStyle(props.style);
  const applied = useRef<GLStyle>(glStyle);
  const latestProps = useRef(props);
  latestProps.current = props;

  useEffect(() => {
    if (!map || styleGeneration === 0) {
      return;
    }
    const addLayer = () => {
      const current = latestProps.current;
      const currentStyle = toGLStyle(current.style);
      applied.current = currentStyle;
      if (map.getLayer(current.id)) {
        adoptExistingLayer(map, current, currentStyle);
      } else {
        map.addLayer(
          omitUndefined({
            id: current.id,
            type,
            source: sourceID,
            'source-layer': current.sourceLayerID,
            filter: nonEmptyFilter(current.filter),
            minzoom: current.minZoomLevel,
            maxzoom: current.maxZoomLevel,
            slot: current.slot,
            paint: currentStyle.paint,
            layout: currentStyle.layout,
          }) as LayerSpecification,
          beforeId(map, current),
        );
      }
      notifyLayerAdded(map, current.id);
    };
    const waitedLayerID = layerToWaitFor(props);
    let stopWaiting = () => {};
    if (waitedLayerID) {
      stopWaiting = whenLayerExists(map, waitedLayerID, addLayer);
    } else {
      addLayer();
    }
    return () => {
      stopWaiting();
      if (!map._removed && map.getLayer(props.id)) {
        map.removeLayer(props.id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    map,
    styleGeneration,
    props.id,
    sourceID,
    props.sourceLayerID,
    props.aboveLayerID,
    props.belowLayerID,
    props.layerIndex,
  ]);

  useEffect(() => {
    if (!map?.getLayer(props.id)) {
      return;
    }
    applyStyle(map, props.id, applied.current, glStyle);
    applied.current = glStyle;
  });

  useOnChange(JSON.stringify(props.filter), () => {
    if (map?.getLayer(props.id)) {
      map.setFilter(props.id, nonEmptyFilter(props.filter));
    }
  });

  useOnChange(`${props.minZoomLevel}-${props.maxZoomLevel}`, () => {
    if (map?.getLayer(props.id)) {
      setZoomRange(map, props);
    }
  });

  useOnChange(props.slot, () => {
    if (map?.getLayer(props.id)) {
      map.setSlot(props.id, props.slot ?? null);
    }
  });
}

export function createLayer(type: LayerSpecification['type']) {
  const Layer = forwardRef<LayerRef, LayerProps>((props, ref) => {
    const [nativeProps, setNativeProps] = useState<Partial<LayerProps>>({});
    useImperativeHandle(ref, () => ({
      setNativeProps: (next) =>
        setNativeProps((previous) => ({ ...previous, ...next })),
    }));
    useLayer(type, { ...props, ...nativeProps });
    return null;
  });
  Layer.displayName = `${type}Layer`;
  return Layer;
}
