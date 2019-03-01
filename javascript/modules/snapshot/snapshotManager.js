import {NativeModules} from 'react-native';

import SnapshotOptions from './SnapshotOptions';

const MapboxGLSnapshotManger = NativeModules.MGLSnapshotModule;

/**
 * The snapshotManager generates static raster images of the map.
 * Each snapshot image depicts a portion of a map defined by an SnapshotOptions object you provide.
 * The snapshotter generates the snapshot asynchronous.
 */
class SnapshotManager {
  /**
   * Takes a snapshot of the base map using the provided Snapshot options. NOTE pitch, heading, zoomLevel only works when centerCoordinate is set!
   *
   * @example
   *
   * // creates a temp file png of base map
   * const uri = await MapboxGL.snapshotManager.takeSnap({
   *   centerCoordinate: [-74.126410, 40.797968],
   *   width: width,
   *   height: height,
   *   zoomLevel: 12,
   *   pitch: 30,
   *   heading: 20,
   *   styleURL: MapboxGL.StyleURL.Dark,
   *   writeToDisk: true, // creates a temp file
   * });
   *
   * // creates base64 png of base map
   * const uri = await MapboxGL.snapshotManager.takeSnap({
   *   centerCoordinate: [-74.126410, 40.797968],
   *   width: width,
   *   height: height,
   *   zoomLevel: 12,
   *   pitch: 30,
   *   heading: 20,
   *   styleURL: MapboxGL.StyleURL.Dark,
   * });
   *
   * // creates snapshot with bounds
   * const uri = await MapboxGL.snapshotManager.takeSnap({
   *   bounds: [[-74.126410, 40.797968], [-74.143727, 40.772177]],
   *   width: width,
   *   height: height,
   *   styleURL: MapboxGL.StyleURL.Dark,
   * });
   *
   * @param  {SnapshotOptions}  options Snapshot options for create a static image of the base map
   * @return {Promise}
   */
  takeSnap(options = {}) {
    const snapshotOptions = new SnapshotOptions(options);

    return new Promise(async (resolve, reject) => {
      try {
        const uri = await MapboxGLSnapshotManger.takeSnap(snapshotOptions);
        resolve(uri);
      } catch (e) {
        reject(e);
      }
    });
  }
}

const snapshotManager = new SnapshotManager();
export default snapshotManager;
