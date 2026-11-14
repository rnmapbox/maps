import { memo, useContext, useEffect, useRef } from 'react';
import type {
  FogSpecification,
  LightsSpecification,
  RainSpecification,
  SnowSpecification,
  TerrainSpecification,
} from 'mapbox-gl';

import MapContext from '../MapContext';
import SourceContext from '../SourceContext';
import { toGLStyleObject, type StyleObject } from '../utils/styleProps';

type StyleObjectProps = { style?: { [key: string]: unknown } };
type GLSpec = { [key: string]: unknown };
type StyleObjectAccessor<Value> = {
  get: (map: mapboxgl.Map) => Value | null | undefined;
  set: (map: mapboxgl.Map, value: Value | null) => void;
  fromSpec: (spec: GLSpec) => Value;
};

function useStyleObject<Value>(
  spec: GLSpec | undefined,
  { get, set, fromSpec }: StyleObjectAccessor<Value>,
) {
  const { map, styleGeneration = 0 } = useContext(MapContext);
  const serializedSpec = JSON.stringify(spec);
  const latestSpec = useRef(spec);
  latestSpec.current = spec;
  const isAdded = useRef(false);
  const latestStyleGeneration = useRef(styleGeneration);
  latestStyleGeneration.current = styleGeneration;

  useEffect(() => {
    if (!map || styleGeneration === 0 || !latestSpec.current) {
      return;
    }
    const valueFromStyle = get(map) ?? null;
    set(map, fromSpec(latestSpec.current));
    isAdded.current = true;
    return () => {
      isAdded.current = false;
      const isSameStyle = latestStyleGeneration.current === styleGeneration;
      if (!map._removed && isSameStyle) {
        set(map, valueFromStyle);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, styleGeneration, spec === undefined]);

  const appliedSpec = useRef(serializedSpec);
  useEffect(() => {
    if (map && isAdded.current && appliedSpec.current !== serializedSpec) {
      set(map, latestSpec.current ? fromSpec(latestSpec.current) : null);
    }
    appliedSpec.current = serializedSpec;
  });
}

function createStyleObject<Value>(
  object: StyleObject,
  displayName: string,
  accessor: StyleObjectAccessor<Value>,
) {
  const Component = memo((props: StyleObjectProps) => {
    useStyleObject(toGLStyleObject(object, props.style), accessor);
    return null;
  });
  Component.displayName = displayName;
  return Component;
}

function isFlatLight(
  lights: LightsSpecification[] | null | undefined,
): lights is [LightsSpecification & { type: 'flat' }] {
  return lights?.length === 1 && lights[0]?.type === 'flat';
}

const defaultFlatLightProperties = {
  anchor: 'viewport',
  position: [1.15, 210, 30],
  color: '#ffffff',
  intensity: 0.5,
};

function resettingOmittedFlatLightProperties(
  lights: LightsSpecification[] | null,
) {
  if (!isFlatLight(lights)) {
    return lights;
  }
  return [
    {
      ...lights[0],
      properties: { ...defaultFlatLightProperties, ...lights[0].properties },
    },
  ] as LightsSpecification[];
}

export const Light = createStyleObject('light', 'Light', {
  get: (map) => map.getLights(),
  set: (map, lights) =>
    map.setLights(resettingOmittedFlatLightProperties(lights)),
  fromSpec: (spec): LightsSpecification[] => [
    { id: 'flat', type: 'flat', properties: spec },
  ],
});

export const Atmosphere = createStyleObject('atmosphere', 'Atmosphere', {
  get: (map) => map.getFog(),
  set: (map, fog) => map.setFog(fog as FogSpecification),
  fromSpec: (spec) => spec as FogSpecification,
});

export const Rain = createStyleObject('rain', 'Rain', {
  get: (map) => map.getRain(),
  set: (map, rain) => map.setRain(rain as RainSpecification),
  fromSpec: (spec) => spec as RainSpecification,
});

export const Snow = createStyleObject('snow', 'Snow', {
  get: (map) => map.getSnow(),
  set: (map, snow) => map.setSnow(snow as SnowSpecification),
  fromSpec: (spec) => spec as SnowSpecification,
});

const terrainAccessor: StyleObjectAccessor<TerrainSpecification> = {
  get: (map) => map.getTerrain(),
  set: (map, terrain) => map.setTerrain(terrain),
  fromSpec: (spec) => spec as TerrainSpecification,
};

type TerrainProps = StyleObjectProps & {
  sourceID?: string;
  exaggeration?: unknown;
};

export const Terrain = memo((props: TerrainProps) => {
  const contextSourceID = useContext(SourceContext);
  const sourceID = props.sourceID ?? contextSourceID;
  const style =
    props.exaggeration === undefined
      ? props.style
      : { exaggeration: props.exaggeration, ...props.style };
  useStyleObject(
    sourceID
      ? { ...toGLStyleObject('terrain', style), source: sourceID }
      : undefined,
    terrainAccessor,
  );
  return null;
});
Terrain.displayName = 'Terrain';
