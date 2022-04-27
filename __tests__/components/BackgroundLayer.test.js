import React from 'react';
import { render } from '@testing-library/react-native';

import BackgroundLayer from '../../javascript/components/BackgroundLayer';

export const NATIVE_MODULE_NAME = 'RCTMGLBackgroundLayer';

describe('BackgroundLayer', () => {
  test('renders correctly with default props', () => {
    const { queryByTestId } = render(
      <BackgroundLayer id="requiredBackgroundLayerID" />,
    );

    const backgroundLayer = queryByTestId('rctmglBackgroundLayer');
    const { props } = backgroundLayer;

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

    const { queryByTestId } = render(<BackgroundLayer {...testProps} />);
    const backgroundLayer = queryByTestId('rctmglBackgroundLayer');
    const { props } = backgroundLayer;

    expect(props.id).toStrictEqual(testProps.id);
    expect(props.sourceID).toStrictEqual(testProps.sourceID);
    expect(props.sourceLayerID).toStrictEqual(testProps.sourceLayerID);
    expect(props.aboveLayerID).toStrictEqual(testProps.aboveLayerID);
    expect(props.belowLayerID).toStrictEqual(testProps.belowLayerID);
    expect(props.layerIndex).toStrictEqual(testProps.layerIndex);
    expect(props.filter).toStrictEqual(testProps.filter);
    expect(props.minZoomLevel).toStrictEqual(testProps.minZoomLevel);
    expect(props.maxZoomLevel).toStrictEqual(testProps.maxZoomLevel);
    expect(props.reactStyle).toStrictEqual({
      visibility: {
        styletype: 'constant',
        stylevalue: { type: 'string', value: testProps.style.visibility },
      },
    });
  });
});
