import React, {useMemo, useState, useEffect} from 'react';
import PropTypes from 'prop-types';

import CircleLayer from './CircleLayer';
import RasterLayer from './RasterLayer';
import SymbolLayer from './SymbolLayer';
import LineLayer from './LineLayer';
import FillLayer from './FillLayer';
import FillExtrusionLayer from './FillExtrusionLayer';
import BackgroundLayer from './BackgroundLayer';
import HeatmapLayer from './HeatmapLayer';
import VectorSource from './VectorSource';
import RasterSource from './RasterSource';
import ImageSource from './ImageSource';
import ShapeSource from './ShapeSource';

function toCamelCase(s) {
  return s.replace(/([-_][a-z])/gi, $1 => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
}

// Patches the Mapbox Style Specification keys into the style props attributes:
// icon-allow-overlap -> iconAllowOverlap
function toCamelCaseKeys(oldObj) {
  if (!oldObj) {
    return {};
  }
  const newObj = {};
  Object.keys(oldObj).forEach(key => {
    const value = oldObj[key];
    if (key.includes('-')) {
      newObj[toCamelCase(key)] = value;
    } else {
      newObj[key] = value;
    }
  });
  return newObj;
}

function getLayerComponentType(layer) {
  const {type} = layer;

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

function asLayerComponent(layer) {
  const LayerComponent = getLayerComponentType(layer);
  if (!LayerComponent) {
    return null;
  }

  const style = {
    ...toCamelCaseKeys(layer.paint),
    ...toCamelCaseKeys(layer.layout),
  };

  const layerProps = {};

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

function getTileSourceProps(source) {
  const sourceProps = {};
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

function getVectorSource(id, source) {
  const sourceProps = {...getTileSourceProps(source)};
  return <VectorSource key={id} id={id} {...sourceProps} />;
}

function getRasterSource(id, source) {
  const sourceProps = {...getTileSourceProps(source)};
  if (source.tileSize) {
    sourceProps.tileSize = source.tileSize;
  }
  return <RasterSource key={id} id={id} {...sourceProps} />;
}

function getImageSource(id, source) {
  const sourceProps = {
    url: source.url,
    coordinates: source.coordinates,
  };
  return <ImageSource key={id} id={id} {...sourceProps} />;
}

function getShapeSource(id, source) {
  const sourceProps = {};
  if (source.data && typeof source.data === 'string') {
    sourceProps.url = source.data;
  } else if (source.data && typeof source.data === 'object') {
    sourceProps.shape = source.data;
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

function asSourceComponent(id, source) {
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

/**
 * Style is a component that automatically adds sources / layers to the map using Mapbox GL Style Spec.
 * Only [`sources`](https://docs.mapbox.com/mapbox-gl-js/style-spec/sources) & [`layers`](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/) are supported.
 * Other fields such as `sprites`, `glyphs` etc. will be ignored. Not all layer / source attributes from the style spec are supported, in general the supported attributes will mentioned under https://github.com/react-native-mapbox-gl/maps/tree/master/docs.
 */
const Style = props => {
  const [fetchedJson, setFetchedJson] = useState({});
  const json = typeof props.json === 'object' ? props.json : fetchedJson;

  // Fetch style when props.json is a URL
  useEffect(() => {
    const abortController = new window.AbortController();
    const fetchStyleJson = async () => {
      try {
        const response = await fetch(props.json, {
          signal: abortController.signal,
        });
        const responseJson = await response.json();
        setFetchedJson(responseJson);
      } catch (e) {
        if (e.name === 'AbortError') {
          return;
        }
        throw e;
      }
    };
    if (typeof props.json === 'string') {
      fetchStyleJson();
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
    return json.layers.map(asLayerComponent).filter(x => !!x);
  }, [json.layers]);

  // Extract source components from json
  const sourceComponents = useMemo(() => {
    if (!json.sources || !Object.keys(json.sources)) {
      return [];
    }
    return Object.keys(json.sources)
      .map(id => asSourceComponent(id, json.sources[id]))
      .filter(x => !!x);
  }, [json.sources]);

  return (
    <>
      {sourceComponents}
      {layerComponents}
    </>
  );
};

Style.propTypes = {
  /**
   * A JSON object conforming to the schema described in the Mapbox Style Specification , or a URL to such JSON.
   */
  json: PropTypes.any,
};

export default Style;
