import mapboxgl from 'mapbox-gl';
import React, { useEffect, useRef, useState } from 'react';

import { point } from '@turf/helpers';
import { MapViewProps } from '../../components/MapView';
import MapContext from '../MapContext';

/**
 * MapView backed by Mapbox GL KS
 */
export default function MapView(
  props: Pick<MapViewProps, 'styleURL' | 'children' | 'onPress'>,
) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [map, setMap] = useState<mapboxgl.Map | undefined>(undefined);

  const _propsRef = useRef(props);
  useEffect(() => {
    _propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (mapContainerRef.current === null) {
      console.error('MapView - mapContainerRef should not be null');
      return;
    }

    // Initialize map
    const { styleURL } = props;
    const _map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: styleURL || 'mapbox://styles/mapbox/streets-v11',
    });

    // Set map event listeners
    _map.on('click', (e) => {
      if (_propsRef.current.onPress === undefined) {
        return;
      }

      _propsRef.current.onPress(point(e.lngLat.toArray()));
    });

    setMap(_map);

    return () => {
      _map.remove();
      if (_map === map) {
        setMap(undefined);
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }} ref={mapContainerRef}>
      {map && (
        <div style={{ position: 'absolute' }}>
          <MapContext.Provider value={{ map }}>
            {props.children}
          </MapContext.Provider>
        </div>
      )}
    </div>
  );
}
