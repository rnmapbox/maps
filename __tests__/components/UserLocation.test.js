import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';

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
    course: 251.5358428955078,
  },
  timestamp: 1573730357879,
};

describe('UserLocation', () => {
  describe('render', () => {
    jest.spyOn(locationManager, 'start').mockImplementation(jest.fn());
    jest
      .spyOn(locationManager, 'getLastKnownLocation')
      .mockImplementation(() => position);

    jest.spyOn(locationManager, 'addListener');

    jest.spyOn(locationManager, 'removeListener');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('renders with CircleLayers by default', done => {
      const {UNSAFE_getAllByType} = render(<UserLocation />);

      setTimeout(() => {
        const shapeSource = UNSAFE_getAllByType(ShapeSource);
        const circleLayer = UNSAFE_getAllByType(CircleLayer);

        expect(shapeSource.length).toBe(1);
        expect(circleLayer.length).toBe(3);
        done();
      });
    });

    test('does not render with visible set to false', done => {
      const {UNSAFE_queryByType} = render(<UserLocation visible={false} />);

      setTimeout(() => {
        const shapeSource = UNSAFE_queryByType(ShapeSource);
        const circleLayer = UNSAFE_queryByType(CircleLayer);

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

      const {UNSAFE_queryByType, UNSAFE_queryAllByType} = render(
        <UserLocation>
          <CircleLayer {...circleLayerProps} />
        </UserLocation>,
      );

      setTimeout(() => {
        const shapeSource = UNSAFE_queryByType(ShapeSource);
        const circleLayer = UNSAFE_queryAllByType(CircleLayer);

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
          course: 251.5358428955078,
        },
        timestamp: 1573730357879,
      });

      expect(onUpdateCallback).toHaveBeenCalled();
    });

    test('calls onPress callback when location icon is pressed', () => {
      const onPressCallback = jest.fn();

      const {UNSAFE_queryByType} = render(
        <UserLocation onPress={onPressCallback} />,
      );

      const shapeSource = UNSAFE_queryByType(ShapeSource);
      fireEvent(shapeSource, 'onPress');
      fireEvent(shapeSource, 'onPress');
      expect(onPressCallback).toHaveBeenCalledTimes(2);
    });

    test('correctly unmounts', async () => {
      const {unmount} = render(<UserLocation />);

      expect(locationManager.addListener).toHaveBeenCalled();
      expect(locationManager.removeListener).not.toHaveBeenCalled();

      unmount();

      expect(locationManager.removeListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('methods', () => {
    let ul;

    beforeEach(() => {
      ul = new UserLocation();

      jest.spyOn(locationManager, 'start').mockImplementation(jest.fn());
      jest.spyOn(locationManager, 'stop').mockImplementation(jest.fn());
      jest
        .spyOn(locationManager, 'getLastKnownLocation')
        .mockImplementation(() => position);

      ul.setState = jest.fn();

      ul.props = UserLocation.defaultProps;

      ul._isMounted = true;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('initial state is as expected', () => {
      const initialState = {
        coordinates: null,
        shouldShowUserLocation: false,
        heading: null,
      };

      expect(ul.state).toStrictEqual(initialState);
      expect(ul.locationManagerRunning).toStrictEqual(false);
    });

    // TODO: replace object { running: boolean } argument with simple boolean
    describe('#setLocationManager', () => {
      test('called with "running" true', async () => {
        const lastKnownLocation = [4.1036916, 51.5462244];
        const heading = 251.5358428955078;

        expect(ul.locationManagerRunning).toStrictEqual(false);

        await ul.setLocationManager({running: true});

        expect(ul.locationManagerRunning).toStrictEqual(true);
        expect(locationManager.start).toHaveBeenCalledTimes(1);
        expect(locationManager.getLastKnownLocation).toHaveBeenCalledTimes(1);
        expect(ul.setState).toHaveBeenCalledTimes(2);
        expect(ul.setState).toHaveBeenCalledWith({
          coordinates: lastKnownLocation,
          heading,
        });
        expect(locationManager.stop).not.toHaveBeenCalled();
      });

      test('called with "running" false', async () => {
        // start
        expect(ul.locationManagerRunning).toStrictEqual(false);
        await ul.setLocationManager({running: true});
        expect(ul.locationManagerRunning).toStrictEqual(true);

        // stop
        await ul.setLocationManager({running: false});

        expect(ul.locationManagerRunning).toStrictEqual(false);
        // only once from start
        expect(locationManager.start).toHaveBeenCalledTimes(1);
        // stop should not be called
        expect(locationManager.stop).not.toHaveBeenCalled();
      });
    });

    describe('#needsLocationManagerRunning', () => {
      test('returns true correctly', () => {
        // default props "onUpdate: undefined, visible: true"
        expect(ul.needsLocationManagerRunning()).toStrictEqual(true);

        ul.props = {
          onUpdate: () => {},
          visible: true,
        };

        expect(ul.needsLocationManagerRunning()).toStrictEqual(true);

        ul.props = {
          onUpdate: () => {},
          visible: false,
        };

        expect(ul.needsLocationManagerRunning()).toStrictEqual(true);
      });

      test('returns false correctly', () => {
        ul.props = {
          visible: false,
        };

        expect(ul.needsLocationManagerRunning()).toStrictEqual(false);
      });
    });

    describe('#_onLocationUpdate', () => {
      test('sets state with new location', () => {
        expect(ul.state.coordinates).toStrictEqual(null);
        ul._onLocationUpdate(position);
        expect(ul.setState).toHaveBeenCalledTimes(1);
        expect(ul.setState).toHaveBeenCalledWith({
          coordinates: [4.1036916, 51.5462244],
          heading: 251.5358428955078,
        });
      });

      test('calls "onUpdate"', () => {
        ul.props.onUpdate = jest.fn();
        ul._onLocationUpdate(position);
        expect(ul.props.onUpdate).toHaveBeenCalledTimes(1);
        expect(ul.props.onUpdate).toHaveBeenCalledWith(position);
      });
    });
  });
});
