import React from 'react';
import {render} from 'react-native-testing-library';

import Camera from '../../javascript/components/Camera';

describe('Camera', () => {
  test('renders', () => {
    const {getByTestId} = render(<Camera />);

    expect(getByTestId('Camera')).toBeDefined();
  });

  test('has proper default props', () => {
    const {getByTestId} = render(<Camera />);

    expect(getByTestId('Camera').props).toStrictEqual({
      testID: 'Camera',
      followUserLocation: undefined,
      followUserMode: undefined,
      followUserPitch: undefined,
      followHeading: undefined,
      followZoomLevel: undefined,
      stop: {
        mode: 'Ease',
        pitch: undefined,
        heading: undefined,
        duration: 2000,
        zoom: undefined,
      },
      maxZoomLevel: undefined,
      minZoomLevel: undefined,
      maxBounds: null,
      defaultStop: null,
      onUserTrackingModeChange: undefined,
    });
  });
});
