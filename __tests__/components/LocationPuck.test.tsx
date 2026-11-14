import { render } from '@testing-library/react-native';
import { Image } from 'react-native';

import LocationPuck from '../../src/components/LocationPuck';
import RNMBXNativeUserLocation from '../../src/specs/RNMBXNativeUserLocationNativeComponent';

function renderedNativeModel(element: React.ReactElement) {
  const { UNSAFE_getByType } = render(element);
  return UNSAFE_getByType(RNMBXNativeUserLocation).props.model;
}

describe('LocationPuck', () => {
  it('passes a model url through unchanged', () => {
    const model = renderedNativeModel(
      <LocationPuck
        model={{ uri: 'https://example.com/car.glb?v=1', scale: [2, 2, 2] }}
      />,
    );
    expect(model).toEqual({
      uri: 'https://example.com/car.glb?v=1',
      scale: [2, 2, 2],
    });
  });

  it('resolves a required model asset without the packager query', () => {
    jest.spyOn(Image, 'resolveAssetSource').mockReturnValue({
      uri: 'http://localhost:8081/assets/car.glb?platform=ios&hash=abc',
      width: 0,
      height: 0,
      scale: 1,
    });
    const model = renderedNativeModel(<LocationPuck model={{ uri: 42 }} />);
    expect(model).toEqual({ uri: 'http://localhost:8081/assets/car.glb' });
  });

  it('passes no model when none is set', () => {
    expect(renderedNativeModel(<LocationPuck />)).toBeUndefined();
  });
});
