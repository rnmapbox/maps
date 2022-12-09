import { Platform } from 'react-native';

/*
 * Retrieve the layer ids used for PointAnnotations and Callouts
 */
export const getAnnotationsLayerID = (
  type: 'PointAnnotations' | 'Callouts',
) => {
  return Platform.select({
    android: 'rctmgl-mapview-annotations',
    ios: {
      PointAnnotations: 'rctmgl-mapview-point-annotations',
      Callouts: 'rctmgl-mapview-callouts',
    }[type],
  });
};
