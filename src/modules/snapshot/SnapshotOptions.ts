import { NativeModules } from 'react-native';

import { toJSONString } from '../../utils';
import { makePoint, makeFeatureCollection } from '../../utils/geoUtils';

const MapboxGL = NativeModules.RNMBXModule;

export type SnapshotOptionsArgs = {
  centerCoordinate?: GeoJSON.Position;
  width?: number;
  height?: number;
  zoomLevel?: number;
  pitch?: number;
  heading?: number;
  styleURL?: string;
  writeToDisk?: boolean;
  bounds?: number[][];
  withLogo?: boolean;
};

class SnapshotOptions {
  public readonly styleURL: string;
  public readonly heading: number;
  public readonly pitch: number;
  public readonly zoomLevel: number;
  public readonly width: number;
  public readonly height: number;
  public readonly writeToDisk: boolean;
  public readonly withLogo: boolean;
  public readonly centerCoordinate: string | undefined;
  public readonly bounds: string | undefined;

  constructor(options: SnapshotOptionsArgs = {}) {
    if (!options.centerCoordinate && !options.bounds) {
      throw new Error(
        'Center coordinate or bounds must be supplied in order to take a snapshot',
      );
    }

    this.styleURL = options.styleURL || MapboxGL.StyleURL.Street;
    this.heading = options.heading || 0.0;
    this.pitch = options.pitch || 0.0;
    this.zoomLevel = options.zoomLevel || 16.0;
    this.width = options.width || 50.0;
    this.height = options.height || 50.0;
    this.writeToDisk = options.writeToDisk || false;
    this.withLogo = options.withLogo === undefined ? true : options.withLogo;

    if (options.centerCoordinate) {
      this.centerCoordinate = this._createCenterCoordPoint(
        options.centerCoordinate,
      );
    }

    if (options.bounds) {
      this.bounds = this._createBoundsCollection(options.bounds);
    }
  }

  toJSON() {
    return {
      styleURL: this.styleURL,
      heading: this.heading,
      pitch: this.pitch,
      zoomLevel: this.zoomLevel,
      width: this.width,
      height: this.height,
      writeToDisk: this.writeToDisk,
      centerCoordinate: this.centerCoordinate,
      bounds: this.bounds,
      withLogo: this.withLogo,
    };
  }

  _createCenterCoordPoint(centerCoordinate: number[]) {
    const point = makePoint(centerCoordinate);
    return toJSONString(point);
  }

  _createBoundsCollection(bounds: number[][]) {
    const features = [];

    for (const bound of bounds) {
      features.push(makePoint(bound));
    }

    return toJSONString(makeFeatureCollection(features));
  }
}

export default SnapshotOptions;
