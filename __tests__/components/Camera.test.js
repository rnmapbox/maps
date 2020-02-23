import React from 'react';
import {render} from 'react-native-testing-library';

import Camera from '../../javascript/components/Camera';

const cameraWithoutFollowDefault = {
  animationDuration: 2000,
  animationMode: 'easeTo',
  centerCoordinate: [-111.8678, 40.2866],
  zoomLevel: 16,
  followUserLocation: false,
  followUserMode: 'normal',
  isUserInteraction: false,
};

const cameraWithoutFollowChanged = {
  animationDuration: 1000,
  animationMode: 'easeTo',
  centerCoordinate: [-110.8678, 37.2866],
  zoomLevel: 13,
  followUserLocation: false,
  followUserMode: 'normal',
  isUserInteraction: false,
};

const cameraWithFollowCourse = {
  animationDuration: 2000,
  animationMode: 'easeTo',
  defaultSettings: {
    centerCoordinate: [-111.8678, 40.2866],
    zoomLevel: 16,
  },
  followUserLocation: true,
  followUserMode: 'course',
  isUserInteraction: false,
};

const cameraWithBounds = {
  animationDuration: 2000,
  animationMode: 'easeTo',
  bounds: {
    ne: [-74.12641, 40.797968],
    sw: [-74.143727, 40.772177],
  },
  isUserInteraction: false,
  maxZoomLevel: 19,
};

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

  describe('methods', () => {
    describe('#_handleCameraChange', () => {
      let camera;

      beforeEach(() => {
        camera = new Camera();

        // set up fake ref
        camera.refs = {
          camera: {
            setNativeProps: jest.fn(),
          },
        };

        // set up fake props
        // we only do this, because we want to test the class methods!
        camera.props = {};

        jest.spyOn(camera, '_setCamera');
        jest.spyOn(camera, '_hasCameraChanged');
        jest.spyOn(camera, '_hasBoundsChanged');
      });

      test('does not call "#_setCamera" or "#setNativeProps" when `nextCamera` has no changes to `currentCamera`', () => {
        camera._handleCameraChange(
          cameraWithoutFollowDefault,
          cameraWithoutFollowDefault,
        );

        expect(camera._hasCameraChanged).toHaveBeenCalled();
        expect(camera._setCamera).not.toHaveBeenCalled();
        expect(camera.refs.camera.setNativeProps).not.toHaveBeenCalled();
      });

      test('sets `followUserLocation` to false when it was removed on `nextCamera`', () => {
        camera._handleCameraChange(
          cameraWithFollowCourse,
          cameraWithoutFollowDefault,
        );

        expect(camera._hasCameraChanged).toHaveBeenCalled();
        expect(camera._setCamera).not.toHaveBeenCalled();

        expect(camera.refs.camera.setNativeProps).toHaveBeenCalledTimes(1);

        expect(camera.refs.camera.setNativeProps).toHaveBeenCalledWith({
          followUserLocation: false,
        });
      });

      test('sets `followUserLocation` to true when it was added on `nextCamera`', () => {
        camera._handleCameraChange(
          cameraWithoutFollowDefault,
          cameraWithFollowCourse,
        );

        expect(camera._hasCameraChanged).toHaveBeenCalled();
        expect(camera._setCamera).not.toHaveBeenCalled();

        expect(camera.refs.camera.setNativeProps).toHaveBeenCalledTimes(2);

        expect(camera.refs.camera.setNativeProps).toHaveBeenNthCalledWith(1, {
          followUserLocation: true,
        });
        expect(camera.refs.camera.setNativeProps).toHaveBeenNthCalledWith(2, {
          followHeading: undefined,
          followPitch: undefined,
          followUserMode: 'course',
          followZoomLevel: undefined,
        });
      });

      test('calls `#_setCamera` when `nextCamera` "hasChanged" without bounds', () => {
        camera._handleCameraChange(
          cameraWithoutFollowDefault,
          cameraWithoutFollowChanged,
        );

        expect(camera._hasCameraChanged).toHaveBeenCalled();
        expect(camera._hasBoundsChanged).not.toHaveBeenCalled();
        expect(camera._setCamera).toHaveBeenCalledWith({
          animationDuration: 1000,
          animationMode: 'easeTo',
          centerCoordinate: [-110.8678, 37.2866],
          heading: undefined,
          pitch: undefined,
          zoomLevel: 13,
        });
      });

      test('calls `#_hasBoundsChanged` & `#_setCamera` when `nextCamera` "hasChanged" with bounds', () => {
        camera._handleCameraChange(
          cameraWithoutFollowDefault,
          cameraWithBounds,
        );

        expect(camera._hasCameraChanged).toHaveBeenCalled();
        expect(camera._hasBoundsChanged).toHaveBeenCalledTimes(1);
        expect(camera._setCamera).toHaveBeenCalledWith({
          animationDuration: 2000,
          animationMode: 'easeTo',
          bounds: {ne: [-74.12641, 40.797968], sw: [-74.143727, 40.772177]},
          heading: undefined,
          pitch: undefined,
          zoomLevel: undefined,
        });
      });
    });

    describe('#_hasCameraChanged', () => {
      let camera;

      beforeEach(() => {
        camera = new Camera();

        // set up fake ref
        camera.refs = {
          camera: {
            setNativeProps: jest.fn(),
          },
        };

        // set up fake props
        // we only do this, because we want to test the class methods!
        camera.props = {};

        jest.spyOn(camera, '_hasCenterCoordinateChanged');
        jest.spyOn(camera, '_hasBoundsChanged');
      });

      test('returns true if "hasDefaultPropsChanged"', () => {
        const testCases = [
          [{heading: 120}, {heading: 121}],
          [
            {
              centerCoordinate: [-111.8678, 40.2866],
            },
            {
              centerCoordinate: [-111.8678, 38.2866],
            },
          ],
          [
            {
              bounds: {
                ne: [-74.12641, 40.797968],
                sw: [-74.143727, 40.772177],
              },
            },
            {
              bounds: {
                ne: [-64.12641, 40.797968],
                sw: [-74.143727, 40.772177],
              },
            },
          ],
          [
            {
              pitch: 45,
            },
            {
              pitch: 55,
            },
          ],
          [
            {
              zoomLevel: 10,
            },
            {
              zoomLevel: 15,
            },
          ],
          [
            // using the usecase in /example
            {
              triggerKey: 1582486618640, // Date.now()
            },
            {
              triggerKey: 1582486626818, // Date.now()
            },
          ],
        ];

        testCases.forEach(c => {
          expect(camera._hasCameraChanged(c[0], c[1])).toBe(true);
        });
      });

      test('returns true if "hasFollowPropsChanged"', () => {
        const testCases = [
          [{followUserLocation: false}, {followUserLocation: true}],
          [{followUserMode: 'normal'}, {followUserMode: 'course'}],
          [{followZoomLevel: 10}, {followZoomLevel: 13}],
          [{followHeading: 100}, {followHeading: 110}],
          [{followPitch: 40}, {followPitch: 49}],
        ];

        testCases.forEach(c => {
          expect(camera._hasCameraChanged(c[0], c[1])).toBe(true);
        });
      });

      test('returns true if "hasAnimationPropsChanged"', () => {
        const testCases = [
          [{animationDuration: 3000}, {animationDuration: 1000}],
          [{animationMode: 'flyTo'}, {animationMode: 'easeTo'}],
        ];

        testCases.forEach(c => {
          expect(camera._hasCameraChanged(c[0], c[1])).toBe(true);
        });
      });
    });
  });
});
