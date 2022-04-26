import { NativeModules } from 'react-native';

import SnapshotOptions from '../../../javascript/modules/snapshot/SnapshotOptions';
import {
  makePoint,
  makeFeatureCollection,
} from '../../../javascript/utils/geoUtils';

describe('SnapshotOptions', () => {
  it('should throw error if no centerCoordinate or bounds are provided', () => {
    expect(() => new SnapshotOptions()).toThrow();
    expect(() => new SnapshotOptions({ styleURL: 'test' })).toThrow();
  });

  it('should create options with valid defaults', () => {
    const centerCoordinate = [1, 2];
    const options = new SnapshotOptions({ centerCoordinate });

    expect(options.toJSON()).toEqual({
      styleURL: NativeModules.MGLModule.StyleURL.Street,
      heading: 0.0,
      pitch: 0.0,
      zoomLevel: 16.0,
      width: 50.0,
      height: 50.0,
      writeToDisk: false,
      centerCoordinate: JSON.stringify(makePoint(centerCoordinate)),
      withLogo: true,
    });
  });

  it('should create options with centerCoordinate', () => {
    const expectedOptions = {
      centerCoordinate: [1, 2],
      heading: 60.0,
      pitch: 45.0,
      zoomLevel: 2.0,
      width: 314,
      height: 600,
      writeToDisk: true,
      withLogo: true,
      styleURL: NativeModules.MGLModule.StyleURL.Dark,
    };

    const options = new SnapshotOptions(expectedOptions);
    expect(options.toJSON()).toEqual({
      ...expectedOptions,
      centerCoordinate: JSON.stringify(
        makePoint(expectedOptions.centerCoordinate),
      ),
    });
  });

  it('should create options with bounds', () => {
    const expectedOptions = {
      bounds: [
        [1, 2],
        [3, 4],
      ],
      width: 400,
      height: 600,
      styleURL: NativeModules.MGLModule.StyleURL.Light,
      writeToDisk: false,
      withLogo: true,
    };

    const geoJSONBounds = JSON.stringify(
      makeFeatureCollection(expectedOptions.bounds.map((c) => makePoint(c))),
    );

    const options = new SnapshotOptions(expectedOptions);
    expect(options.toJSON()).toEqual({
      ...expectedOptions,
      heading: 0,
      pitch: 0,
      zoomLevel: 16,
      bounds: geoJSONBounds,
    });
  });
});
