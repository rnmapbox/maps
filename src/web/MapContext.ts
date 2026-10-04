import React from 'react';
import type { Map } from 'mapbox-gl';

/**
 * The mapbox-gl map. styleGeneration is 0 until the style has loaded and
 * increases on every style load, since loading a style removes all sources
 * and layers.
 */
const MapContext = React.createContext<{
  map?: Map;
  styleGeneration?: number;
}>({});

export default MapContext;
