import React from 'react';
import { render } from '@testing-library/react-native';

import Light from '../../javascript/components/Light';

export const NATIVE_MODULE_NAME = 'RCTMGLLight';

describe('Light', () => {
  test('renders correctly', () => {
    const { queryByTestId } = render(<Light />);
    const light = queryByTestId('rctmglLight');
    expect(light).toBeDefined();
  });

  test('renders correctly with custom styles', () => {
    const testStyles = {
      position: [1234, 1234, 1234],
      color: '#FA0000', // === ProcessedTestColor
      anchor: 'map',
      intensity: 1,
    };
    const processedTestColor = 4294574080;

    const { queryByTestId } = render(<Light style={testStyles} />);

    const customStyles = queryByTestId('rctmglLight').props.reactStyle;
    const { anchor } = customStyles;
    const { color } = customStyles;
    const { position } = customStyles;
    const { intensity } = customStyles;

    expect(anchor.stylevalue.value).toStrictEqual(testStyles.anchor);
    expect(color.stylevalue.value).toStrictEqual(processedTestColor);
    expect(intensity.stylevalue.value).toStrictEqual(testStyles.intensity);
    expect(position.stylevalue.value[0].value).toStrictEqual(
      testStyles.position[0],
    );
  });
});
