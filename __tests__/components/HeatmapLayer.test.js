import React from 'react';
import { render } from '@testing-library/react-native';

import HeatmapLayer from '../../src/components/HeatmapLayer';

describe('HeatmapLayer', () => {
  test('renders correctly with default props', () => {
    const { UNSAFE_root: heatmapLayer } = render(
      <HeatmapLayer id="requiredHeatmapLayerID" />,
    );
    const { props } = heatmapLayer;
    expect(props.sourceID).toStrictEqual('DefaultSourceID');
  });

  test('renders correctly with custom props', () => {
    const testProps = {
      id: 'customId',
      sourceID: 'customSourceId',
      sourceLayerID: 'customSourceLayerId',
      aboveLayerID: 'customAboveLayerId',
      belowLayerID: 'customBelowLayerId',
      layerIndex: 0,
      filter: ['==', 'arbitraryFilter', true],
      minZoomLevel: 3,
      maxZoomLevel: 8,
      style: { visibility: 'none' },
    };
    const { UNSAFE_root: heatmapLayer } = render(
      <HeatmapLayer {...testProps} />,
    );
    const { props } = heatmapLayer;

    expect(props.id).toStrictEqual(testProps.id);
    expect(props.sourceID).toStrictEqual(testProps.sourceID);
    expect(props.sourceLayerID).toStrictEqual(testProps.sourceLayerID);
    expect(props.aboveLayerID).toStrictEqual(testProps.aboveLayerID);
    expect(props.belowLayerID).toStrictEqual(testProps.belowLayerID);
    expect(props.layerIndex).toStrictEqual(testProps.layerIndex);
    expect(props.filter).toStrictEqual(testProps.filter);
    expect(props.minZoomLevel).toStrictEqual(testProps.minZoomLevel);
    expect(props.maxZoomLevel).toStrictEqual(testProps.maxZoomLevel);
    expect(props.style).toStrictEqual(testProps.style);

    // abstract layer props
    expect(heatmapLayer.children[0].props.reactStyle).toStrictEqual({
      visibility: {
        styletype: 'constant',
        stylevalue: { type: 'string', value: testProps.style.visibility },
      },
    });
  });
});
