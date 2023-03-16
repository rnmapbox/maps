import React, { useMemo, useState, useEffect } from 'react';

import { FilterExpression } from '../utils/MapboxStyles';

import CircleLayer from './CircleLayer';
import RasterLayer from './RasterLayer';
import { SymbolLayer } from './SymbolLayer';
import LineLayer from './LineLayer';
import FillLayer from './FillLayer';
import FillExtrusionLayer from './FillExtrusionLayer';
import BackgroundLayer from './BackgroundLayer';
import HeatmapLayer from './HeatmapLayer';
import VectorSource from './VectorSource';
import RasterSource from './RasterSource';
import ImageSource from './ImageSource';
import { ShapeSource } from './ShapeSource';

function toCamelCase(s: string): string {
  return s.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
}

// Patches the Mapbox Style Specification keys into the style props attributes:
// icon-allow-overlap -> iconAllowOverlap
function toCamelCaseKeys(oldObj?: { [key: string]: unknown }): {
  [key: string]: unknown;
} {
  if (!oldObj) {
    return {};
  }
  const newObj: { [key: string]: unknown } = {};
  Object.keys(oldObj).forEach((key) => {
    const value = oldObj[key];
    if (key.includes('-')) {
      newObj[toCamelCase(key)] = value;
    } else {
      newObj[key] = value;
    }
  });
  return newObj;
}

function getLayerComponentType(layer: { type: string }) {
  const { type } = layer;

  switch (type) {
    case 'circle':
      return CircleLayer;
    case 'symbol':
      return SymbolLayer;
    case 'raster':
      return RasterLayer;
    case 'line':
      return LineLayer;
    case 'fill':
      return FillLayer;
    case 'fill-extrusion':
      return FillExtrusionLayer;
    case 'background':
      return BackgroundLayer;
    case 'heatmap':
      return HeatmapLayer;
  }

  console.warn(`Mapbox layer type '${type}' is not supported/`);

  return null;
}

function asLayerComponent(layer: MapboxJSONLayer) {
  type GenericProps = { key?: string; id: string };
  const LayerComponent: typeof React.PureComponent<GenericProps> | null =
    getLayerComponentType(layer) as typeof React.PureComponent<GenericProps>;
  if (!LayerComponent) {
    return null;
  }

  const style = {
    ...toCamelCaseKeys(layer.paint),
    ...toCamelCaseKeys(layer.layout),
  };

  const layerProps: {
    sourceID?: string;
    sourceLayerID?: string;
    minZoomLevel?: number;
    maxZoomLevel?: number;
    filter?: FilterExpression;
    style?: object;
  } = {};

  if (layer.source) {
    layerProps.sourceID = layer.source;
  }
  if (layer['source-layer']) {
    layerProps.sourceLayerID = layer['source-layer'];
  }
  if (layer.minzoom) {
    layerProps.minZoomLevel = layer.minzoom;
  }
  if (layer.maxzoom) {
    layerProps.maxZoomLevel = layer.maxzoom;
  }
  if (layer.filter) {
    layerProps.filter = layer.filter;
  }
  if (Object.keys(style).length) {
    layerProps.style = style;
  }

  return <LayerComponent key={layer.id} id={layer.id} {...layerProps} />;
}

type SourceProps = {
  url?: string;
  tileUrlTemplates?: string[];
  minZoomLevel?: number;
  maxZoomLevel?: number;
  attribution?: string;
  tms?: boolean;
};

function getTileSourceProps(source: MapboxJSONSource): SourceProps {
  const sourceProps: SourceProps = {};
  if (source.url) {
    sourceProps.url = source.url;
  }
  if (source.tiles) {
    sourceProps.tileUrlTemplates = source.tiles;
  }
  if (source.minzoom !== undefined) {
    sourceProps.minZoomLevel = source.minzoom;
  }
  if (source.maxzoom !== undefined) {
    sourceProps.maxZoomLevel = source.maxzoom;
  }
  if (source.attribution) {
    sourceProps.attribution = source.attribution;
  }
  if (source.scheme && source.scheme === 'tms') {
    sourceProps.tms = true;
  }
  return sourceProps;
}

function getVectorSource(id: string, source: MapboxJSONSource) {
  const sourceProps = { ...getTileSourceProps(source) };
  return <VectorSource key={id} id={id} {...sourceProps} />;
}

function getRasterSource(id: string, source: MapboxJSONSource) {
  const sourceProps: { tileSize?: number } & SourceProps = {
    ...getTileSourceProps(source),
  };
  if (source.tileSize) {
    sourceProps.tileSize = source.tileSize;
  }
  return <RasterSource key={id} id={id} {...sourceProps} />;
}

function getImageSource(id: string, source: MapboxJSONSource) {
  const sourceProps = {
    url: source.url,
    coordinates: source.coordinates,
  };
  return <ImageSource key={id} id={id} {...sourceProps} />;
}

type ShapeShourceShape = typeof ShapeSource.prototype.props['shape'];

function getShapeSource(id: string, source: MapboxJSONSource) {
  const sourceProps: {
    url?: string;
    shape?: ShapeShourceShape;
    cluster?: boolean;
    clusterRadius?: number;
    clusterMaxZoomLevel?: number;
    clusterProperties?: object;
    buffer?: number;
    tolerance?: number;
    lineMetrics?: boolean;
  } & SourceProps = {};
  if (source.data && typeof source.data === 'string') {
    sourceProps.url = source.data;
  } else if (source.data && typeof source.data === 'object') {
    sourceProps.shape = source.data as ShapeShourceShape;
  }
  if (source.cluster !== undefined) {
    sourceProps.cluster = source.cluster;
  }
  if (source.clusterRadius !== undefined) {
    sourceProps.clusterRadius = source.clusterRadius;
  }
  if (source.maxzoom !== undefined) {
    sourceProps.maxZoomLevel = source.maxzoom;
  }
  if (source.clusterMaxZoom !== undefined) {
    sourceProps.clusterMaxZoomLevel = source.clusterMaxZoom;
  }
  if (source.clusterProperties !== undefined) {
    sourceProps.clusterProperties = source.clusterProperties;
  }
  if (source.buffer !== undefined) {
    sourceProps.buffer = source.buffer;
  }
  if (source.tolerance !== undefined) {
    sourceProps.tolerance = source.tolerance;
  }
  if (source.lineMetrics !== undefined) {
    sourceProps.lineMetrics = source.lineMetrics;
  }
  return <ShapeSource key={id} id={id} {...sourceProps} />;
}

function asSourceComponent(id: string, source: MapboxJSONSource) {
  switch (source.type) {
    case 'vector':
      return getVectorSource(id, source);
    case 'raster':
      return getRasterSource(id, source);
    case 'image':
      return getImageSource(id, source);
    case 'geojson':
      return getShapeSource(id, source);
  }

  console.warn(`Mapbox source type '${source.type}' is not supported/`);

  return null;
}

type MapboxJSONLayer = {
  type: string;
  id: string;
  paint?: { [k: string]: unknown };
  layout?: { [k: string]: unknown };
  source?: string;
  minzoom?: number;
  maxzoom?: number;
  filter?: FilterExpression;
  style?: object;
  ['source-layer']: string;
};

type MapboxJSONSource = {
  type: string;
  url?: string;
  tiles?: string[];
  minzoom?: number;
  maxzoom?: number;
  attribution?: string;
  scheme?: string;
  tileSize?: number;
  coordinates?: [
    [number, number],
    [number, number],
    [number, number],
    [number, number],
  ];
  data?: string | object;

  buffer: number;
  cluster?: boolean;
  clusterRadius?: number;
  clusterMaxZoom?: number;
  clusterProperties?: object;
  tolerance?: number;
  lineMetrics?: boolean;
};

type MapboxJSON = {
  layers?: MapboxJSONLayer[];
  sources?: { [key: string]: MapboxJSONSource };
};

type Props = {
  /**
   * A JSON object conforming to the schema described in the Mapbox Style Specification , or a URL to such JSON.
   */
  json: MapboxJSON | URL;
};

/**
 * Style is a component that automatically adds sources / layers to the map using Mapbox GL Style Spec.
 * Only [`sources`](https://docs.mapbox.com/mapbox-gl-js/style-spec/sources) & [`layers`](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/) are supported.
 * Other fields such as `sprites`, `glyphs` etc. will be ignored. Not all layer / source attributes from the style spec are supported, in general the supported attributes will be mentioned under https://github.com/rnmapbox/maps/tree/main/docs.
 */
const Style = (props: Props) => {
  const [fetchedJson, setFetchedJson] = useState({});
  const json: MapboxJSON =
    typeof props.json === 'object' ? props.json : fetchedJson;

  // Fetch style when props.json is a URL
  useEffect(() => {
    const abortController = new AbortController();
    const fetchStyleJson = async (json: string) => {
      try {
        const response = await fetch(json, {
          signal: abortController.signal,
        });
        const responseJson = await response.json();
        setFetchedJson(responseJson);
      } catch (error: unknown) {
        const e = error as { name?: string };
        if (e.name === 'AbortError') {
          return;
        }
        throw e;
      }
    };
    if (typeof props.json === 'string') {
      fetchStyleJson(props.json);
    }
    return function cleanup() {
      abortController.abort();
    };
  }, [props.json]);

  // Extract layer components from json
  const layerComponents = useMemo(() => {
    if (!json.layers) {
      return [];
    }
    return json.layers.map(asLayerComponent).filter((x) => !!x);
  }, [json.layers]);

  // Extract source components from json
  const { sources } = json;
  const sourceComponents = useMemo(() => {
    if (!sources || !Object.keys(sources)) {
      return [];
    }
    return Object.keys(sources)
      .map((id) => asSourceComponent(id, sources[id]))
      .filter((x) => !!x);
  }, [sources]);

  return (
    <>
      {sourceComponents}
      {layerComponents}
    </>
  );
};

export default Style;
