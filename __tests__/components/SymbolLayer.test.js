import React from 'react';
import { render } from '@testing-library/react-native';

import SymbolLayer, {
  NATIVE_MODULE_NAME,
} from '../../javascript/components/SymbolLayer';

describe('SymbolLayer', () => {
  test('renders correctly with default props', () => {
    const { UNSAFE_getByType } = render(
      <SymbolLayer id="requiredSymbolLayerID" />,
    );
    const symbolLayer = UNSAFE_getByType(NATIVE_MODULE_NAME);
    const { props } = symbolLayer;

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

    const { UNSAFE_getByType } = render(<SymbolLayer {...customProps} />);
    const symbolLayer = UNSAFE_getByType(NATIVE_MODULE_NAME);
    const { props } = symbolLayer;

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
