import { makeLatLngBounds } from '../../utils/geoUtils';
import { toJSONString } from '../../utils';

export type OfflineCreatePackOptionsArgs = {
  name: string;
  styleURL: string;
  bounds: [GeoJSON.Position, GeoJSON.Position];
  minZoom?: number;
  maxZoom?: number;
  metadata?: Record<string, unknown>;
};

class OfflineCreatePackOptions {
  public readonly name: string;
  public readonly styleURL: string;
  public readonly bounds: string;
  public readonly minZoom: number | undefined;
  public readonly maxZoom: number | undefined;
  public readonly metadata: string | undefined;

  constructor(options: OfflineCreatePackOptionsArgs) {
    this._assert(options);

    this.name = options.name;
    this.styleURL = options.styleURL;
    this.bounds = this._makeLatLngBounds(options.bounds);
    this.minZoom = options.minZoom;
    this.maxZoom = options.maxZoom;
    this.metadata = this._makeMetadata(options.metadata);
  }

  _assert(options: OfflineCreatePackOptionsArgs) {
    if (!options.styleURL) {
      throw new Error(
        'Style URL must be provided for creating an offline pack',
      );
    }

    if (!options.name) {
      throw new Error('Name must be provided for creating an offline pack');
    }

    if (!options.bounds) {
      throw new Error('Bounds must be provided for creating an offline pack');
    }
  }

  _makeLatLngBounds(bounds: [GeoJSON.Position, GeoJSON.Position]): string {
    const [ne, sw] = bounds;
    return toJSONString(makeLatLngBounds(ne, sw));
  }

  _makeMetadata(metadata: Record<string, unknown> | undefined) {
    return JSON.stringify({
      ...metadata,
      name: this.name,
    });
  }
}

export default OfflineCreatePackOptions;
