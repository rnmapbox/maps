// With RNMBX_E2E_MAPS_IDLE=1, example/metro.config.js resolves `@rnmapbox/maps` and
// MapsIdleMarker.tsx in example/src to this module

import { forwardRef, useEffect, useState, useSyncExternalStore } from 'react';
import { View } from 'react-native';
import * as Mapbox from '@rnmapbox/maps';

const idleByMap = new Map<object, boolean>();
const listeners = new Set<() => void>();

function setIdle(map: object, idle: boolean | undefined) {
  if (idle === undefined) {
    idleByMap.delete(map);
  } else if (idleByMap.get(map) !== idle) {
    idleByMap.set(map, idle);
  } else {
    return;
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function allMapsIdle() {
  return idleByMap.size > 0 && [...idleByMap.values()].every((idle) => idle);
}

type MapViewProps = React.ComponentProps<typeof Mapbox.MapView>;

/** MapView that reports whether Mapbox considers it idle: everything loaded, placed and still. */
const MapView = forwardRef<Mapbox.MapView, MapViewProps>(
  function MapView(props, ref) {
    const [map] = useState(() => ({}));

    useEffect(() => {
      setIdle(map, false);
      return () => setIdle(map, undefined);
    }, [map]);

    const {
      onRegionDidChange,
      onMapIdle,
      onRegionIsChanging,
      onCameraChanged,
    } = props;

    // MapView only delivers one of each pair: onRegionDidChange/onRegionIsChanging take precedence
    const idleProps = onRegionDidChange
      ? {
          onRegionDidChange: (
            ...args: Parameters<typeof onRegionDidChange>
          ) => {
            setIdle(map, true);
            onRegionDidChange(...args);
          },
        }
      : {
          onMapIdle: (...args: Parameters<NonNullable<typeof onMapIdle>>) => {
            setIdle(map, true);
            onMapIdle?.(...args);
          },
        };
    const movingProps = onRegionIsChanging
      ? {
          onRegionIsChanging: (
            ...args: Parameters<typeof onRegionIsChanging>
          ) => {
            setIdle(map, false);
            onRegionIsChanging(...args);
          },
        }
      : {
          onCameraChanged: (
            ...args: Parameters<NonNullable<typeof onCameraChanged>>
          ) => {
            setIdle(map, false);
            onCameraChanged?.(...args);
          },
        };

    return (
      <Mapbox.MapView {...props} {...idleProps} {...movingProps} ref={ref} />
    );
  },
);

const markerStyle = { position: 'absolute', width: 1, height: 1 } as const;

/**
 * Renders the `e2e-maps-idle-tracker` view, and inside it the `e2e-maps-idle` view once every map is
 * idle, which the doc screenshot test waits for.
 */
export function MapsIdleMarker() {
  const idle = useSyncExternalStore(subscribe, allMapsIdle);
  return (
    <View
      testID="e2e-maps-idle-tracker"
      collapsable={false}
      pointerEvents="none"
      style={markerStyle}
    >
      {idle && (
        <View testID="e2e-maps-idle" collapsable={false} style={markerStyle} />
      )}
    </View>
  );
}

export * from '@rnmapbox/maps';
export { MapView };
export default { ...Mapbox, MapView };
