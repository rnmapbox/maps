import {
  forwardRef,
  memo,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import {
  type CameraAnimationMode,
  type CameraPadding,
  type CameraProps,
  type CameraRef,
  type CameraStop,
  type CameraStops,
} from '../../components/Camera';
import { type Position } from '../../types/Position';
import MapContext from '../MapContext';
import { warnUnimplemented } from '../UnimplementedComponent';
import { useOnChange } from '../useOnChange';
import { omitUndefined } from '../utils/styleProps';

function toLngLat(position: Position): [number, number] {
  return [position[0]!, position[1]!];
}

function toGLPadding(
  padding: Partial<CameraPadding> | undefined,
): mapboxgl.PaddingOptions | undefined {
  if (!padding) {
    return undefined;
  }
  return {
    top: padding.paddingTop ?? 0,
    right: padding.paddingRight ?? 0,
    bottom: padding.paddingBottom ?? 0,
    left: padding.paddingLeft ?? 0,
  };
}

function paddingFromConfig(paddingConfig: number | number[]): CameraPadding {
  const [top = 0, right = top, bottom = top, left = right] =
    typeof paddingConfig === 'number' ? [paddingConfig] : paddingConfig;
  return {
    paddingTop: top,
    paddingRight: right,
    paddingBottom: bottom,
    paddingLeft: left,
  };
}

function hasBounds(
  bounds: CameraStop['bounds'],
): bounds is NonNullable<CameraStop['bounds']> {
  return !!bounds?.ne && !!bounds?.sw;
}

function toCameraOptions(
  map: mapboxgl.Map,
  stop: CameraStop,
): mapboxgl.CameraOptions {
  const padding = toGLPadding(
    stop.padding ?? (hasBounds(stop.bounds) ? stop.bounds : undefined),
  );
  const options: mapboxgl.CameraOptions = omitUndefined({
    center: stop.centerCoordinate && toLngLat(stop.centerCoordinate),
    zoom: stop.zoomLevel,
    bearing: stop.heading,
    pitch: stop.pitch,
    padding,
  });
  if (hasBounds(stop.bounds)) {
    const boundsCamera = map.cameraForBounds(
      [toLngLat(stop.bounds.sw), toLngLat(stop.bounds.ne)],
      {
        padding,
        bearing: stop.heading ?? map.getBearing(),
        pitch: stop.pitch ?? map.getPitch(),
      },
    );
    return omitUndefined({
      ...options,
      ...boundsCamera,
      zoom: stop.zoomLevel ?? boundsCamera?.zoom,
    });
  }
  return options;
}

function moveCamera(
  map: mapboxgl.Map,
  options: mapboxgl.CameraOptions,
  mode: CameraAnimationMode | undefined,
  duration: number | undefined,
) {
  switch (mode) {
    case 'easeTo':
      map.easeTo({ ...options, duration: duration ?? 0 });
      break;
    case 'linearTo':
      map.easeTo({
        ...options,
        duration: duration ?? 0,
        easing: (progress) => progress,
      });
      break;
    case 'moveTo':
    case 'none':
      map.jumpTo(options);
      break;
    case 'flyTo':
    default:
      map.flyTo({ ...options, duration });
      break;
  }
}

function applyStop(map: mapboxgl.Map, stop: CameraStop) {
  moveCamera(
    map,
    toCameraOptions(map, stop),
    stop.animationMode,
    stop.animationDuration,
  );
}

function applyStops(map: mapboxgl.Map, stops: CameraStop[]) {
  const [first, ...rest] = stops;
  if (!first) {
    return;
  }
  if (rest.length > 0) {
    map.once('moveend', () => applyStops(map, rest));
  }
  applyStop(map, first);
}

function isCameraStops(
  config: CameraStop | CameraStops,
): config is CameraStops {
  return 'stops' in config && Array.isArray(config.stops);
}

function propsStop(props: CameraProps): CameraStop | undefined {
  const { centerCoordinate, bounds, heading, pitch, zoomLevel, padding } =
    props;
  if (
    centerCoordinate === undefined &&
    bounds === undefined &&
    heading === undefined &&
    pitch === undefined &&
    zoomLevel === undefined &&
    padding === undefined
  ) {
    return undefined;
  }
  return {
    centerCoordinate,
    bounds,
    heading,
    pitch,
    zoomLevel,
    padding,
    animationDuration: props.animationDuration,
    animationMode: props.animationMode,
  };
}

function applyZoomAndBoundsLimits(map: mapboxgl.Map, props: CameraProps) {
  map.setMinZoom(props.minZoomLevel ?? null);
  map.setMaxZoom(props.maxZoomLevel ?? null);
  const maxBounds: mapboxgl.LngLatBoundsLike | null =
    props.maxBounds?.ne && props.maxBounds?.sw
      ? [toLngLat(props.maxBounds.sw), toLngLat(props.maxBounds.ne)]
      : null;
  map.setMaxBounds(maxBounds as mapboxgl.LngLatBoundsLike);
}

const Camera = memo(
  forwardRef<CameraRef, CameraProps>((props, ref) => {
    const { map } = useContext(MapContext);
    const { allowUpdates = true } = props;
    const stop = propsStop(props);

    const setCamera: CameraRef['setCamera'] = (config) => {
      if (!map || !allowUpdates) {
        return;
      }
      if (isCameraStops(config)) {
        applyStops(map, config.stops);
      } else {
        applyStop(map, config);
      }
    };

    useImperativeHandle(ref, () => ({
      setCamera,
      fitBounds(ne, sw, paddingConfig = 0, animationDuration = 0) {
        setCamera({
          bounds: { ne, sw },
          padding: paddingFromConfig(paddingConfig),
          animationDuration,
          animationMode: 'easeTo',
        });
      },
      flyTo(centerCoordinate, animationDuration = 2000) {
        setCamera({ centerCoordinate, animationDuration });
      },
      moveTo(centerCoordinate, animationDuration = 0) {
        setCamera({
          centerCoordinate,
          animationDuration,
          animationMode: 'easeTo',
        });
      },
      zoomTo(zoomLevel, animationDuration = 2000) {
        setCamera({ zoomLevel, animationDuration, animationMode: 'flyTo' });
      },
      moveBy(moveProps) {
        const animation = 'animationMode' in moveProps ? moveProps : undefined;
        map?.panBy([moveProps.x, moveProps.y], {
          duration: animation?.animationDuration ?? 0,
          easing:
            animation?.animationMode === 'easeTo'
              ? undefined
              : (progress) => progress,
        });
      },
      scaleBy(scaleProps) {
        if (!map) {
          return;
        }
        const animation =
          'animationMode' in scaleProps ? scaleProps : undefined;
        map.easeTo({
          zoom: map.getZoom() + Math.log2(scaleProps.scaleFactor),
          around: map.unproject([scaleProps.x, scaleProps.y]),
          duration: animation?.animationDuration ?? 0,
          easing:
            animation?.animationMode === 'easeTo'
              ? undefined
              : (progress) => progress,
        });
      },
    }));

    const latestProps = useRef(props);
    latestProps.current = props;

    useEffect(() => {
      if (!map) {
        return;
      }
      const current = latestProps.current;
      applyZoomAndBoundsLimits(map, current);
      if (current.defaultSettings) {
        applyStop(map, { ...current.defaultSettings, animationMode: 'none' });
      }
      const initialStop = propsStop(current);
      if (initialStop) {
        applyStop(map, {
          ...initialStop,
          animationMode: initialStop.animationMode ?? 'none',
        });
      }
    }, [map]);

    useOnChange(
      `${props.minZoomLevel}-${props.maxZoomLevel}-${JSON.stringify(
        props.maxBounds,
      )}`,
      () => map && applyZoomAndBoundsLimits(map, props),
    );

    useOnChange(`${JSON.stringify(stop)}-${props.triggerKey}`, () => {
      if (map && stop && allowUpdates) {
        applyStop(map, stop);
      }
    });

    if (props.followUserLocation) {
      warnUnimplemented('Camera.followUserLocation');
    }

    return null;
  }),
);
Camera.displayName = 'Camera';

export { Camera };
export default Camera;
