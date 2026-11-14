import { Marker } from 'mapbox-gl';
import {
  forwardRef,
  isValidElement,
  memo,
  type ReactElement,
  type Ref,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';

import MapContext from '../MapContext';

type MarkerViewProps = {
  coordinate: [number, number];
  anchor?: { x: number; y: number };
  minZoom?: number;
  maxZoom?: number;
  children?: ReactElement;
};

const centerAnchor = { x: 0.5, y: 0.5 };

function MarkerView(props: MarkerViewProps, ref: Ref<Marker>) {
  const { map } = useContext(MapContext);

  // Create marker instance
  const marker: Marker = useMemo(() => {
    const hasCustomElement = isValidElement(props.children);
    const _marker = new Marker({
      element: hasCustomElement ? document.createElement('div') : undefined,
      anchor: hasCustomElement ? 'top-left' : 'center',
    });

    // Set marker coordinates
    _marker.setLngLat(props.coordinate);

    // Fix marker position
    const { style } = _marker.getElement();
    style.position = 'absolute';
    style.top = '0';
    style.left = '0';

    return _marker;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add marker to map
  useEffect(() => {
    if (map === undefined) {
      return;
    }

    marker.addTo(map);

    return () => {
      marker.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Hide marker outside its zoom range
  useEffect(() => {
    const { minZoom, maxZoom } = props;
    if (map === undefined || (minZoom === undefined && maxZoom === undefined)) {
      return;
    }
    const { style } = marker.getElement();
    const updateVisibility = () => {
      const zoom = map.getZoom();
      const visible = zoom >= (minZoom ?? 0) && zoom <= (maxZoom ?? 22);
      style.visibility = visible ? '' : 'hidden';
    };
    updateVisibility();
    map.on('zoom', updateVisibility);

    return () => {
      map.off('zoom', updateVisibility);
      style.visibility = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, props.minZoom, props.maxZoom]);

  // Expose marker instance
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useImperativeHandle(ref, () => marker, []);

  // Update marker coordinates
  const markerCoordinate = marker.getLngLat();
  if (
    markerCoordinate.lng !== props.coordinate[0] ||
    markerCoordinate.lat !== props.coordinate[1]
  ) {
    marker.setLngLat([props.coordinate[0], props.coordinate[1]]);
  }

  const { x, y } = props.anchor ?? centerAnchor;
  return createPortal(
    <div
      style={{
        position: 'absolute',
        width: 'max-content',
        transform: `translate(${-x * 100}%, ${-y * 100}%)`,
      }}
    >
      {props.children}
    </div>,
    marker.getElement(),
  );
}

export default memo(forwardRef(MarkerView));
