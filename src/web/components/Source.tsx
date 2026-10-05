import { type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import type { SourceSpecification } from 'mapbox-gl';

import MapContext from '../MapContext';
import SourceContext from '../SourceContext';
import { omitUndefined } from '../utils/styleProps';

type Props = {
  id: string;
  specification?: SourceSpecification;
  recreateOn: unknown[];
  children?: ReactNode;
};

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

export function Source({ id, specification, recreateOn, children }: Props) {
  const { map, styleGeneration = 0 } = useContext(MapContext);
  const latestSpecification = useRef(specification);
  latestSpecification.current = specification;
  const [addedSource, setAddedSource] = useState<{
    styleGeneration: number;
    instance: number;
  }>();
  const hasSpecification = specification !== undefined;

  useEffect(() => {
    if (!map || styleGeneration === 0 || !latestSpecification.current) {
      return;
    }
    const ownsSource = !map.getSource(id);
    if (ownsSource) {
      map.addSource(
        id,
        omitUndefined(latestSpecification.current) as SourceSpecification,
      );
    }
    setAddedSource((previous) => ({
      styleGeneration,
      instance: (previous?.instance ?? 0) + 1,
    }));

    return () => {
      if (ownsSource && !map._removed) {
        removeSourceAndItsLayers(map, id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, styleGeneration, id, hasSpecification, ...recreateOn]);

  if (!hasSpecification || addedSource?.styleGeneration !== styleGeneration) {
    return null;
  }
  return (
    <SourceContext.Provider value={id} key={addedSource.instance}>
      {children}
    </SourceContext.Provider>
  );
}
