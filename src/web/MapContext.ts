import React from 'react';
import type { Map } from 'mapbox-gl';

const MapContext = React.createContext<{
  map?: Map;
  styleGeneration?: number;
}>({});

export default MapContext;
