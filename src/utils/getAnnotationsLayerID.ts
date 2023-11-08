import { Platform } from 'react-native';

/*
 * Retrieve the layer ids used for PointAnnotations and Callouts
 */
export const getAnnotationsLayerID = (
  type: 'PointAnnotations' | 'Callouts',
) => {
  return Platform.select({
    android: 'RNMBX-mapview-annotations',
    ios: {
      PointAnnotations: 'RNMBX-mapview-point-annotations',
      Callouts: 'RNMBX-mapview-callouts',
    }[type],
  });
};
