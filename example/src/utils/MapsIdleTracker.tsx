// example/metro.config.js resolves `@rnmapbox/maps` in example/src to this module

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

/** Renders the `e2e-maps-idle` view, which the doc screenshot test waits for. */
export function MapsIdleMarker() {
  const idle = useSyncExternalStore(subscribe, allMapsIdle);
  return idle ? (
    <View
      testID="e2e-maps-idle"
      collapsable={false}
      pointerEvents="none"
      style={{ position: 'absolute', width: 1, height: 1 }}
    />
  ) : null;
}

export * from '@rnmapbox/maps';
export { MapView };
export default { ...Mapbox, MapView };
