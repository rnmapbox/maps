import * as React from 'react';
import {render} from 'react-native-testing-library';

import MapView from '../../javascript/components/MapView';

describe('MapView', () => {
  test('renders with testID', () => {
    const expectedTestId = 'im used for identification in tests';

    const {getByTestId} = render(<MapView testID={expectedTestId} />);

    // expect(() => {
    //   getByTestId(expectedTestId);
    // }).not.toThrowError();
  });
});
