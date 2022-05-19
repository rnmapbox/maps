import { Properties } from '@turf/helpers';
import { FeatureCollection, Geometry, Feature } from 'geojson';
import type { Component } from 'react';
import { ViewPropTypes } from 'react-native';

import {
  BackgroundLayerProps,
  CalloutProps,
  CircleLayerProps,
  Expression,
  FillExtrusionLayerProps,
  FillLayerProps,
  HeatmapLayerProps,
  ImageSourceProps,
  ImagesProps,
  LightProps,
  LineLayerProps,
  MapViewProps,
  MarkerViewProps,
  PointAnnotationProps,
  RasterLayerProps,
  RasterSourceProps,
  ShapeSourceProps,
  StyleProps,
  SymbolLayerProps,
  UserLocationProps,
  VectorSourceProps,
} from '.';

export class MapView extends Component<MapViewProps> {
  longitude: number;
  getPointInView(coordinate: GeoJSON.Position): Promise<GeoJSON.Position>;
  getCoordinateFromView(point: GeoJSON.Position): Promise<GeoJSON.Position>;
  getVisibleBounds(): Promise<GeoJSON.Position[]>;
  queryRenderedFeaturesAtPoint(
    coordinate: GeoJSON.Position,
    filter?: Expression,
    layerIds?: Array<string>,
  ): Promise<GeoJSON.FeatureCollection | undefined>;
  queryRenderedFeaturesInRect(
    coordinate: GeoJSON.Position,
    filter?: Expression,
    layerIds?: Array<string>,
  ): Promise<GeoJSON.FeatureCollection | undefined>;
  takeSnap(writeToDisk?: boolean): Promise<string>;
  getZoom(): Promise<number>;
  getCenter(): Promise<GeoJSON.Position>;
  showAttribution(): void;
  setSourceVisibility(
    visible: boolean,
    sourceId: string,
    sourceLayerId?: string,
  ): void;
}

export class UserLocation extends Component<UserLocationProps> {}

export class Light extends Component<LightProps> {}

export class PointAnnotation extends Component<PointAnnotationProps> {
  refresh(): void;
}
export class MarkerView extends Component<MarkerViewProps> {}
export class Callout extends Component<CalloutProps> {}
export class Style extends Component<StyleProps> {}

export class VectorSource extends Component<VectorSourceProps> {}
export class ShapeSource extends Component<ShapeSourceProps> {
  features(
    filter?: Expression,
  ): Promise<FeatureCollection<Geometry, Properties>>;

  getClusterExpansionZoom(
    feature: Feature<Geometry, Properties> | number,
  ): Promise<number>;
  /**
   * Returns all the leaves of a cluster with pagination support.
   * @param cluster feature cluster
   * @param limit the number of leaves to return
   * @param offset the amount of points to skip (for pagination)
   */
  getClusterLeaves: (
    feature: Feature<Geometry, Properties> | number,
    limit: number,
    offset: number,
  ) => Promise<FeatureCollection<Geometry, Properties>>;
  /**
   * Returns the children of a cluster (on the next zoom level).
   * @param cluster feature cluster
   */
  getClusterChildren: (
    feature: Feature<Geometry, Properties> | number,
  ) => Promise<FeatureCollection<Geometry, Properties>>;
}
export class RasterSource extends Component<RasterSourceProps> {}

export class BackgroundLayer extends Component<BackgroundLayerProps> {}
export class CircleLayer extends Component<CircleLayerProps> {}
export class FillExtrusionLayer extends Component<FillExtrusionLayerProps> {}
export class FillLayer extends Component<FillLayerProps> {}
export class RasterLayer extends Component<RasterLayerProps> {}
export class SymbolLayer extends Component<SymbolLayerProps> {}
export class HeatmapLayer extends Component<HeatmapLayerProps> {}
export class Images extends Component<ImagesProps> {}
export class ImageSource extends Component<ImageSourceProps> {}
export class LineLayer extends Component<LineLayerProps> {}

export class Annotation extends Component {} // TODO
export class RasterDemSource extends Component<ViewPropTypes> {
  id: string;
  url: string;
  tileSize: number;
  maxZoomLevel: number;
}
export class SkyLayer extends Component<ViewPropTypes> {
  id: string;
}
export class Terrain extends Component<ViewPropTypes> {
  exaggeration: number;
}
