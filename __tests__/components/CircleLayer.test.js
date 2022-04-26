import React from 'react';
import { render } from '@testing-library/react-native';

import CircleLayer from '../../javascript/components/CircleLayer';

describe('CircleLayer', () => {
  test('renders correctly with default props', () => {
    const { queryByTestId } = render(
      <CircleLayer id="requiredCircleLayerID" />,
    );
    const circleLayer = queryByTestId('rctmglCircleLayer');
    const { props } = circleLayer;

    expect(props.sourceID).toStrictEqual('DefaultSourceID');
  });

  test('renders correctly with custom props', () => {
    const customProps = {
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

    const { queryByTestId } = render(<CircleLayer {...customProps} />);
    const circleLayer = queryByTestId('rctmglCircleLayer');
    const { props } = circleLayer;

    expect(props.id).toStrictEqual(customProps.id);
    expect(props.sourceID).toStrictEqual(customProps.sourceID);
    expect(props.sourceLayerID).toStrictEqual(customProps.sourceLayerID);
    expect(props.aboveLayerID).toStrictEqual(customProps.aboveLayerID);
    expect(props.belowLayerID).toStrictEqual(customProps.belowLayerID);
    expect(props.layerIndex).toStrictEqual(customProps.layerIndex);
    expect(props.filter).toStrictEqual(customProps.filter);
    expect(props.minZoomLevel).toStrictEqual(customProps.minZoomLevel);
    expect(props.maxZoomLevel).toStrictEqual(customProps.maxZoomLevel);
    expect(props.reactStyle).toStrictEqual({
      visibility: {
        styletype: 'constant',
        stylevalue: { type: 'string', value: customProps.style.visibility },
      },
    });
  });
});
