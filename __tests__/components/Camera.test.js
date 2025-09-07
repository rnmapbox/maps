import React from 'react';
import { render } from '@testing-library/react-native';

import { Camera } from '../../src/components/Camera';

const coordinate1 = [-111.8678, 40.2866];

const bounds1 = {
  ne: [-74.12641, 40.797968],
  sw: [-74.143727, 40.772177],
};

const toFeature = position => {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: position,
    },
    properties: {},
  };
};

const toFeatureCollection = bounds => {
  return {
    type: 'FeatureCollection',
    features: [toFeature(bounds.ne), toFeature(bounds.sw)],
  };
};
describe('Camera', () => {
  test('defaults are set', () => {
    const result = render(<Camera />);
    const { props } = result.queryByTestId('Camera');
    expect(props.stop).toStrictEqual({});
  });
  test('set location by center', () => {
    const result = render(
      <Camera centerCoordinate={coordinate1} zoomLevel={14} />,
    );
    const { props } = result.queryByTestId('Camera');
    props.stop.centerCoordinate = JSON.parse(props.stop.centerCoordinate);
    expect(props.stop).toStrictEqual({
      centerCoordinate: toFeature(coordinate1),
      zoom: 14,
    });
  });
  test('set location by bounds', () => {
    const result = render(<Camera bounds={bounds1} />);
    const { props } = result.queryByTestId('Camera');
    props.stop.bounds = JSON.parse(props.stop.bounds);
    expect(props.stop).toStrictEqual({
      bounds: toFeatureCollection(bounds1),
    });
  });
  test('animation mode', () => {
    const result = render(<Camera bounds={bounds1} animationMode={'moveTo'} />);
    const { props } = result.queryByTestId('Camera');
    expect(props.stop.mode).toEqual('Move');
  });
});
