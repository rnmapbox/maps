import React from 'react';
import {render, fireEvent} from 'react-native-testing-library';

import UserLocation from '../../javascript/components/UserLocation';
import ShapeSource from '../../javascript/components/ShapeSource';
import CircleLayer from '../../javascript/components/CircleLayer';
import locationManager from '../../javascript/modules/location/locationManager';

const position = {
  coords: {
    accuracy: 9.977999687194824,
    altitude: 44.64373779296875,
    heading: 251.5358428955078,
    latitude: 51.5462244,
    longitude: 4.1036916,
    speed: 0.08543474227190018,
  },
  timestamp: 1573730357879,
};

describe('UserLocation', () => {
  beforeEach(() => {
    jest.spyOn(locationManager, 'start').mockImplementation(jest.fn());
    jest
      .spyOn(locationManager, 'getLastKnownLocation')
      .mockImplementation(() => position);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders with CircleLayers by default', done => {
    const {getAllByType} = render(<UserLocation />);

    setTimeout(() => {
      const shapeSource = getAllByType(ShapeSource);
      const circleLayer = getAllByType(CircleLayer);

      expect(shapeSource.length).toBe(1);
      expect(circleLayer.length).toBe(3);
      done();
    });
  });

  test('does not render with visible set to false', done => {
    const {queryByType} = render(<UserLocation visible={false} />);

    setTimeout(() => {
      const shapeSource = queryByType(ShapeSource);
      const circleLayer = queryByType(CircleLayer);

      expect(shapeSource).toEqual(null);
      expect(circleLayer).toEqual(null);
      done();
    });
  });

  test('renders with CustomChild when provided', done => {
    const circleLayerProps = {
      key: 'testUserLocationCircle',
      id: 'testUserLocationCircle',
      style: {
        circleRadius: 5,
        circleColor: '#ccc',
        circleOpacity: 1,
        circlePitchAlignment: 'map',
      },
    };

    const {queryByType, queryAllByType} = render(
      <UserLocation>
        <CircleLayer {...circleLayerProps} />
      </UserLocation>,
    );

    setTimeout(() => {
      const shapeSource = queryByType(ShapeSource);
      const circleLayer = queryAllByType(CircleLayer);

      expect(shapeSource).toBeDefined();
      expect(circleLayer[0]).toBeDefined();
      expect(circleLayer.length).toBe(1);

      expect(circleLayer[0].props.style).toEqual(circleLayerProps.style);
      done();
    });
  });

  test('calls onUpdate callback when new location is received', () => {
    const onUpdateCallback = jest.fn();

    render(<UserLocation onUpdate={onUpdateCallback} />);

    locationManager.onUpdate({
      coords: {
        accuracy: 9.977999687194824,
        altitude: 44.64373779296875,
        heading: 251.5358428955078,
        latitude: 51.5462244,
        longitude: 4.1036916,
        speed: 0.08543474227190018,
      },
      timestamp: 1573730357879,
    });

    expect(onUpdateCallback).toHaveBeenCalled();
  });

  test('calls onPress callback when location icon is pressed', () => {
    const onPressCallback = jest.fn();

    const {queryByType} = render(<UserLocation onPress={onPressCallback} />);

    const shapeSource = queryByType(ShapeSource);
    fireEvent(shapeSource, 'onPress');
    fireEvent(shapeSource, 'onPress');
    expect(onPressCallback).toHaveBeenCalledTimes(2);
  });
});
