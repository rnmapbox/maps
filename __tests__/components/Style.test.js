import React from 'react';
import { render } from '@testing-library/react-native';

import VectorSource from '../../javascript/components/VectorSource';
import RasterSource from '../../javascript/components/RasterSource';
import ImageSource from '../../javascript/components/ImageSource';
import ShapeSource from '../../javascript/components/ShapeSource';
import Style from '../../javascript/components/Style';
import HeatmapLayer from '../../javascript/components/HeatmapLayer';
import CircleLayer from '../../javascript/components/CircleLayer';
import SymbolLayer from '../../javascript/components/SymbolLayer';
import RasterLayer from '../../javascript/components/RasterLayer';
import LineLayer from '../../javascript/components/LineLayer';
import FillLayer from '../../javascript/components/FillLayer';
import FillExtrusionLayer from '../../javascript/components/FillExtrusionLayer';
import BackgroundLayer from '../../javascript/components/BackgroundLayer';

describe('Style', () => {
  test('renders vectory source correctly', () => {
    const vectorSource = {
      type: 'vector',
      url: 'mapbox://mapbox.660ui7x6',
      tiles: ['http://host1', 'http://host2'],
      minzoom: 1,
      maxzoom: 22,
      attribution: 'Copyright',
      scheme: 'tms',
    };

    const json = {
      layers: [],
      sources: {
        vectorSource,
      },
    };

    const { UNSAFE_getByType } = render(<Style json={json} />);
    const component = UNSAFE_getByType(VectorSource);
    const { props } = component;

    expect(props.id).toStrictEqual(Object.keys(json.sources)[0]);
    expect(props.url).toStrictEqual(vectorSource.url);
    expect(props.tileUrlTemplates).toStrictEqual(vectorSource.tiles);
    expect(props.minZoomLevel).toStrictEqual(vectorSource.minzoom);
    expect(props.maxZoomLevel).toStrictEqual(vectorSource.maxzoom);
    expect(props.attribution).toStrictEqual(vectorSource.attribution);
    expect(props.tms).toBe(true);
  });

  test('renders raster source correctly', () => {
    const rasterSource = {
      type: 'raster',
      url: 'mapbox://mapbox.660ui7x6',
      tiles: ['http://host1', 'http://host2'],
      minzoom: 1,
      maxzoom: 22,
      attribution: 'Copyright',
      scheme: 'tms',
      tileSize: 256,
    };

    const json = {
      layers: [],
      sources: {
        rasterSource,
      },
    };

    const { UNSAFE_getByType } = render(<Style json={json} />);
    const component = UNSAFE_getByType(RasterSource);
    const { props } = component;

    expect(props.id).toStrictEqual(Object.keys(json.sources)[0]);
    expect(props.url).toStrictEqual(rasterSource.url);
    expect(props.tileUrlTemplates).toStrictEqual(rasterSource.tiles);
    expect(props.minZoomLevel).toStrictEqual(rasterSource.minzoom);
    expect(props.maxZoomLevel).toStrictEqual(rasterSource.maxzoom);
    expect(props.attribution).toStrictEqual(rasterSource.attribution);
    expect(props.tms).toBe(true);
    expect(props.tileSize).toStrictEqual(rasterSource.tileSize);
  });

  test('renders image source correctly', () => {
    const imageSource = {
      type: 'image',
      url: 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
      coordinates: [
        [-80.425, 46.437],
        [-71.516, 46.437],
        [-71.516, 37.936],
        [-80.425, 37.936],
      ],
    };

    const json = {
      layers: [],
      sources: {
        imageSource,
      },
    };

    const { UNSAFE_getByType } = render(<Style json={json} />);
    const component = UNSAFE_getByType(ImageSource);
    const { props } = component;

    expect(props.id).toStrictEqual(Object.keys(json.sources)[0]);
    expect(props.url).toStrictEqual(imageSource.url);
    expect(props.coordinates).toStrictEqual(imageSource.coordinates);
  });

  test('renders shape source correctly', () => {
    const shapeSource = {
      type: 'geojson',
      data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson',
      cluster: true,
      clusterRadius: 80,
      clusterMaxZoom: 10,
      maxzoom: 22,
      minzoom: 1,
      buffer: 128,
      tolerance: 0.5,
    };

    const json = {
      layers: [],
      sources: {
        imageSource: shapeSource,
      },
    };

    const { UNSAFE_getByType } = render(<Style json={json} />);
    const component = UNSAFE_getByType(ShapeSource);
    const { props } = component;

    expect(props.id).toStrictEqual(Object.keys(json.sources)[0]);
    expect(props.url).toStrictEqual(shapeSource.data);
    expect(props.shape).toBeUndefined();
    expect(props.clusterRadius).toStrictEqual(shapeSource.clusterRadius);
    expect(props.clusterMaxZoomLevel).toStrictEqual(shapeSource.clusterMaxZoom);
    expect(props.maxZoomLevel).toStrictEqual(shapeSource.maxzoom);
    expect(props.buffer).toStrictEqual(shapeSource.buffer);
    expect(props.tolerance).toStrictEqual(shapeSource.tolerance);
  });

  test('renders shape source with json data correctly', () => {
    const shapeSource = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    };

    const json = {
      layers: [],
      sources: {
        imageSource: shapeSource,
      },
    };

    const { UNSAFE_getByType } = render(<Style json={json} />);
    const component = UNSAFE_getByType(ShapeSource);
    const { props } = component;

    expect(props.id).toStrictEqual(Object.keys(json.sources)[0]);
    expect(props.shape).toStrictEqual(shapeSource.data);
    expect(props.url).toBeUndefined();
  });

  test('renders supported layer types correctly', () => {
    const json = {
      layers: [
        {
          id: 'circle',
          type: 'circle',
        },
        {
          id: 'symbol',
          type: 'symbol',
        },
        {
          id: 'raster',
          type: 'raster',
        },
        {
          id: 'line',
          type: 'line',
        },
        {
          id: 'fill',
          type: 'fill',
        },
        {
          id: 'fill-extrusion',
          type: 'fill-extrusion',
        },
        {
          id: 'background',
          type: 'background',
        },
        {
          id: 'heatmap',
          type: 'heatmap',
        },
      ],
    };

    const { UNSAFE_getByType } = render(<Style json={json} />);
    const circleLayer = UNSAFE_getByType(CircleLayer);
    const symbolLayer = UNSAFE_getByType(SymbolLayer);
    const rasterLayer = UNSAFE_getByType(RasterLayer);
    const lineLayer = UNSAFE_getByType(LineLayer);
    const fillLayer = UNSAFE_getByType(FillLayer);
    const fillExtrusionLayer = UNSAFE_getByType(FillExtrusionLayer);
    const backgroundLayer = UNSAFE_getByType(BackgroundLayer);
    const heatmapLayer = UNSAFE_getByType(HeatmapLayer);

    expect(circleLayer.props.id).toStrictEqual('circle');
    expect(symbolLayer.props.id).toStrictEqual('symbol');
    expect(rasterLayer.props.id).toStrictEqual('raster');
    expect(lineLayer.props.id).toStrictEqual('line');
    expect(fillLayer.props.id).toStrictEqual('fill');
    expect(fillExtrusionLayer.props.id).toStrictEqual('fill-extrusion');
    expect(backgroundLayer.props.id).toStrictEqual('background');
    expect(heatmapLayer.props.id).toStrictEqual('heatmap');
  });

  test('renders layer props correctly', () => {
    const circleLayer = {
      id: 'circle',
      type: 'circle',
      source: 'population',
      'source-layer': 'state_county_population',
      filter: ['==', 'isState', true],
      minzoom: 1,
      maxzoom: 22,
      paint: {
        'circle-opacity': 0.75,
      },
      layout: {
        visibility: 'visible',
      },
    };
    const json = {
      layers: [circleLayer],
    };

    const { UNSAFE_getByType } = render(<Style json={json} />);
    const layerComponent = UNSAFE_getByType(CircleLayer);
    const { props } = layerComponent;
    expect(props.sourceID).toStrictEqual(circleLayer.source);
    expect(props.sourceLayerID).toStrictEqual(circleLayer['source-layer']);
    expect(props.filter).toStrictEqual(circleLayer.filter);
    expect(props.minZoomLevel).toStrictEqual(circleLayer.minzoom);
    expect(props.maxZoomLevel).toStrictEqual(circleLayer.maxzoom);
    expect(props.style.circleOpacity).toStrictEqual(
      circleLayer.paint['circle-opacity'],
    );
    expect(props.style.visibility).toStrictEqual(circleLayer.layout.visibility);
  });
});
