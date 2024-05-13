import { Marker } from 'mapbox-gl';
import {
  forwardRef,
  isValidElement,
  memo,
  ReactElement,
  Ref,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';

import MapContext from '../MapContext';

type MarkerViewProps = {
  coordinate: [number, number];
  children?: ReactElement;
};

function MarkerView(props: MarkerViewProps, ref: Ref<Marker>) {
  const { map } = useContext(MapContext);

  // Create marker instance
  const marker: Marker = useMemo(() => {
    const _marker = new Marker({
      element: isValidElement(props.children)
        ? document.createElement('div')
        : undefined,
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

  // Inject children into marker element
  return createPortal(props.children, marker.getElement());
}

export default memo(forwardRef(MarkerView));
