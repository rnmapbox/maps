type Callback = () => void;

const waitersByMap = new WeakMap<mapboxgl.Map, Map<string, Set<Callback>>>();

function waitersFor(map: mapboxgl.Map) {
  let waiters = waitersByMap.get(map);
  if (!waiters) {
    waiters = new Map();
    waitersByMap.set(map, waiters);
  }
  return waiters;
}

export function whenLayerExists(
  map: mapboxgl.Map,
  layerID: string,
  callback: Callback,
): () => void {
  if (map.getLayer(layerID)) {
    callback();
    return () => {};
  }
  const waiters = waitersFor(map);
  const callbacks = waiters.get(layerID) ?? new Set();
  waiters.set(layerID, callbacks);
  callbacks.add(callback);
  return () => {
    callbacks.delete(callback);
  };
}

export function notifyLayerAdded(map: mapboxgl.Map, layerID: string) {
  const waiters = waitersFor(map);
  const callbacks = waiters.get(layerID);
  waiters.delete(layerID);
  callbacks?.forEach((callback) => callback());
}
