import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import mapboxgl from 'mapbox-gl';

import MapContext from '../MapContext';
import type {
  MapState,
  RegionPayload,
  ScreenPointPayload,
} from '../../components/MapView';
import type { FilterExpression } from '../../utils/MapboxStyles';
import { type Position } from '../../types/Position';

const defaultStyleURL = 'mapbox://styles/mapbox/streets-v11';

type PressFeature = GeoJSON.Feature<GeoJSON.Point, ScreenPointPayload>;
type RegionFeature = GeoJSON.Feature<GeoJSON.Point, RegionPayload>;

type Props = {
  style?: StyleProp<ViewStyle>;
  styleURL?: string;
  styleJSON?: string;
  children?: ReactNode;
  onPress?: (feature: PressFeature) => void;
  onLongPress?: (feature: PressFeature) => void;
  onCameraChanged?: (state: MapState) => void;
  onMapIdle?: (state: MapState) => void;
  onRegionWillChange?: (feature: RegionFeature) => void;
  onRegionIsChanging?: (feature: RegionFeature) => void;
  onRegionDidChange?: (feature: RegionFeature) => void;
  onWillStartLoadingMap?: () => void;
  onDidFinishLoadingMap?: () => void;
  onDidFailLoadingMap?: () => void;
  onMapLoadingError?: () => void;
  onDidFinishLoadingStyle?: () => void;
  onDidFinishRenderingFrame?: () => void;
  onDidFinishRenderingFrameFully?: () => void;
  onDidFinishRenderingMapFully?: () => void;
};

type BBox = [number, number, number, number];

const reloadWholeStyle = { diff: false } as Parameters<
  mapboxgl.Map['setStyle']
>[1];

function styleFromProps({ styleURL, styleJSON }: Props) {
  if (styleURL) {
    return styleURL;
  }
  if (styleJSON) {
    return JSON.parse(styleJSON) as mapboxgl.StyleSpecification;
  }
  return defaultStyleURL;
}

function toPosition(lngLat: mapboxgl.LngLat): Position {
  return [lngLat.lng, lngLat.lat];
}

function visibleBounds(map: mapboxgl.Map): [Position, Position] {
  const bounds = map.getBounds();
  if (!bounds) {
    return [
      [0, 0],
      [0, 0],
    ];
  }
  return [toPosition(bounds.getNorthEast()), toPosition(bounds.getSouthWest())];
}

function mapState(map: mapboxgl.Map, isGestureActive: boolean): MapState {
  const [ne, sw] = visibleBounds(map);
  return {
    properties: {
      center: toPosition(map.getCenter()),
      bounds: { ne, sw },
      zoom: map.getZoom(),
      heading: map.getBearing(),
      pitch: map.getPitch(),
    },
    gestures: { isGestureActive },
    timestamp: Date.now(),
  };
}

function regionFeature(
  map: mapboxgl.Map,
  isUserInteraction: boolean,
): RegionFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: toPosition(map.getCenter()) },
    properties: {
      zoomLevel: map.getZoom(),
      heading: map.getBearing(),
      pitch: map.getPitch(),
      animated: !isUserInteraction,
      isUserInteraction,
      visibleBounds: visibleBounds(map),
    },
  };
}

function pressFeature(event: mapboxgl.MapMouseEvent): PressFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: toPosition(event.lngLat) },
    properties: { screenPointX: event.point.x, screenPointY: event.point.y },
  };
}

function nonEmptyFilter(filter: FilterExpression | [] | undefined) {
  return Array.isArray(filter) && filter.length > 0
    ? (filter as mapboxgl.FilterSpecification)
    : undefined;
}

function featureCollection(
  features: GeoJSON.Feature[],
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: features.map((feature) =>
      'toJSON' in feature && typeof feature.toJSON === 'function'
        ? feature.toJSON()
        : feature,
    ),
  };
}

class MapView extends React.Component<
  Props,
  { map?: mapboxgl.Map; styleGeneration: number }
> {
  state: { map?: mapboxgl.Map; styleGeneration: number } = {
    map: undefined,
    styleGeneration: 0,
  };
  mapContainer: HTMLElement | null = null;
  map: mapboxgl.Map | null = null;

  componentDidMount() {
    if (!this.mapContainer) {
      console.error('MapView - mapContainer is null');
      return;
    }
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: styleFromProps(this.props),
    });
    this.map = map;
    this.setState({ map });
    map.on('style.load', () => {
      this.setState(({ styleGeneration }) => ({
        styleGeneration: styleGeneration + 1,
      }));
      this.props.onDidFinishLoadingStyle?.();
    });
    this.addEventListeners(map);
    this.props.onWillStartLoadingMap?.();
  }

  addEventListeners(map: mapboxgl.Map) {
    const isUserInteraction = (event: { originalEvent?: unknown }) =>
      event.originalEvent !== undefined;
    map.on('click', (event) => this.props.onPress?.(pressFeature(event)));
    map.on('contextmenu', (event) =>
      this.props.onLongPress?.(pressFeature(event)),
    );
    map.on('movestart', (event) =>
      this.props.onRegionWillChange?.(
        regionFeature(map, isUserInteraction(event)),
      ),
    );
    map.on('move', (event) => {
      this.props.onRegionIsChanging?.(
        regionFeature(map, isUserInteraction(event)),
      );
      this.props.onCameraChanged?.(mapState(map, isUserInteraction(event)));
    });
    map.on('moveend', (event) =>
      this.props.onRegionDidChange?.(
        regionFeature(map, isUserInteraction(event)),
      ),
    );
    map.on('idle', () => {
      this.props.onMapIdle?.(mapState(map, false));
      this.props.onDidFinishRenderingFrameFully?.();
      this.props.onDidFinishRenderingMapFully?.();
    });
    map.on('load', () => this.props.onDidFinishLoadingMap?.());
    map.on('error', () => {
      this.props.onDidFailLoadingMap?.();
      this.props.onMapLoadingError?.();
    });
    map.on('render', () => this.props.onDidFinishRenderingFrame?.());
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.map &&
      (prevProps.styleURL !== this.props.styleURL ||
        prevProps.styleJSON !== this.props.styleJSON)
    ) {
      this.map.setStyle(styleFromProps(this.props), reloadWholeStyle);
    }
  }

  async getPointInView(coordinate: Position): Promise<Position> {
    const point = this.requireMap().project(coordinate as [number, number]);
    return [point.x, point.y];
  }

  async getCoordinateFromView(point: Position): Promise<Position> {
    return toPosition(this.requireMap().unproject(point as [number, number]));
  }

  async getVisibleBounds(): Promise<[Position, Position]> {
    return visibleBounds(this.requireMap());
  }

  async getZoom(): Promise<number> {
    return this.requireMap().getZoom();
  }

  async getCenter(): Promise<Position> {
    return toPosition(this.requireMap().getCenter());
  }

  async queryRenderedFeaturesAtPoint(
    point: Position,
    filter: FilterExpression | [] = [],
    layerIDs: string[] = [],
  ): Promise<GeoJSON.FeatureCollection> {
    return featureCollection(
      this.requireMap().queryRenderedFeatures(point as [number, number], {
        filter: nonEmptyFilter(filter),
        layers: layerIDs.length > 0 ? layerIDs : undefined,
      }),
    );
  }

  async queryRenderedFeaturesInRect(
    bbox: BBox | [],
    filter: FilterExpression | [] = [],
    layerIDs: string[] | null = null,
  ): Promise<GeoJSON.FeatureCollection> {
    const options = {
      filter: nonEmptyFilter(filter),
      layers: layerIDs && layerIDs.length > 0 ? layerIDs : undefined,
    };
    const map = this.requireMap();
    if (bbox.length === 0) {
      return featureCollection(map.queryRenderedFeatures(options));
    }
    const [top, left, bottom, right] = bbox;
    return featureCollection(
      map.queryRenderedFeatures(
        [
          [left, top],
          [right, bottom],
        ],
        options,
      ),
    );
  }

  async querySourceFeatures(
    sourceId: string,
    filter: FilterExpression | [] = [],
    sourceLayerIDs: string[] = [],
  ): Promise<GeoJSON.FeatureCollection> {
    const map = this.requireMap();
    const sourceLayers =
      sourceLayerIDs.length > 0 ? sourceLayerIDs : [undefined];
    return featureCollection(
      sourceLayers.flatMap((sourceLayer) =>
        map.querySourceFeatures(sourceId, {
          sourceLayer,
          filter: nonEmptyFilter(filter),
        }),
      ),
    );
  }

  async queryTerrainElevation(coordinate: Position): Promise<number> {
    const elevation = this.requireMap().queryTerrainElevation(
      coordinate as [number, number],
    );
    if (elevation === null || elevation === undefined) {
      throw new Error('@rnmapbox/maps: no terrain elevation at coordinate');
    }
    return elevation;
  }

  setSourceVisibility(
    visible: boolean,
    sourceId: string,
    sourceLayerId: string | null = null,
  ) {
    const map = this.requireMap();
    for (const layer of map.getStyle()?.layers ?? []) {
      const isLayerOfSource =
        'source' in layer &&
        layer.source === sourceId &&
        (sourceLayerId === null || layer['source-layer'] === sourceLayerId);
      if (isLayerOfSource) {
        map.setLayoutProperty(
          layer.id,
          'visibility',
          visible ? 'visible' : 'none',
        );
      }
    }
  }

  async setFeatureState(
    featureId: string,
    state: { [key: string]: unknown },
    sourceId: string,
    sourceLayerId: string | null = null,
  ): Promise<void> {
    this.requireMap().setFeatureState(
      {
        id: featureId,
        source: sourceId,
        sourceLayer: sourceLayerId ?? undefined,
      },
      state,
    );
  }

  async getFeatureState(
    featureId: string,
    sourceId: string,
    sourceLayerId: string | null = null,
  ): Promise<Readonly<Record<string, unknown>>> {
    return (
      this.requireMap().getFeatureState({
        id: featureId,
        source: sourceId,
        sourceLayer: sourceLayerId ?? undefined,
      }) ?? {}
    );
  }

  async removeFeatureState(
    featureId: string,
    stateKey: string | null,
    sourceId: string,
    sourceLayerId: string | null = null,
  ): Promise<void> {
    this.requireMap().removeFeatureState(
      {
        id: featureId,
        source: sourceId,
        sourceLayer: sourceLayerId ?? undefined,
      },
      stateKey ?? undefined,
    );
  }

  async takeSnap(_writeToDisk = false): Promise<string> {
    const map = this.requireMap();
    return new Promise((resolve) => {
      map.once('render', () => resolve(map.getCanvas().toDataURL()));
      map.triggerRepaint();
    });
  }

  requireMap(): mapboxgl.Map {
    if (!this.map) {
      throw new Error('@rnmapbox/maps: MapView is not mounted');
    }
    return this.map;
  }

  componentWillUnmount() {
    this.map?.remove();
    this.map = null;
  }

  render() {
    const { children, style } = this.props;
    const { map, styleGeneration } = this.state;
    return (
      <View style={[{ flex: 1 }, style]}>
        <div
          style={{ position: 'absolute', inset: 0 }}
          ref={(el) => {
            this.mapContainer = el;
          }}
        />
        {map && (
          <MapContext.Provider value={{ map, styleGeneration }}>
            {children}
          </MapContext.Provider>
        )}
      </View>
    );
  }
}

export default MapView;
