import React from 'react';
import { render } from '@testing-library/react-native';

import Camera from '../../javascript/components/Camera';

const cameraWithoutFollowDefault = {
  ...Camera.defaultProps,
  animationDuration: 2000,
  animationMode: 'easeTo',
  centerCoordinate: [-111.8678, 40.2866],
  zoomLevel: 16,
  followUserLocation: false,
  followUserMode: 'normal',
  isUserInteraction: false,
};

const cameraWithoutFollowChanged = {
  ...Camera.defaultProps,
  animationDuration: 1000,
  animationMode: 'easeTo',
  centerCoordinate: [-110.8678, 37.2866],
  zoomLevel: 13,
  followUserLocation: false,
  followUserMode: 'normal',
  isUserInteraction: false,
};

const cameraWithFollowCourse = {
  ...Camera.defaultProps,
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
  ...Camera.defaultProps,
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
  describe('render', () => {
    test('renders correctly', () => {
      const { getByTestId } = render(<Camera />);

      expect(getByTestId('Camera')).toBeDefined();
    });

    test('has proper default props', () => {
      const { getByTestId } = render(<Camera />);

      expect(getByTestId('Camera').props).toStrictEqual({
        children: undefined,
        testID: 'Camera',
        followUserLocation: undefined,
        followUserMode: undefined,
        followPitch: undefined,
        followHeading: undefined,
        followZoomLevel: undefined,
        stop: {
          mode: 'Ease',
          pitch: undefined,
          heading: undefined,
          duration: 2000,
          zoom: undefined,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 0,
        },
        maxZoomLevel: undefined,
        minZoomLevel: undefined,
        maxBounds: null,
        defaultStop: null,
        onUserTrackingModeChange: undefined,
      });
    });
  });

  describe('class', () => {
    test('correct "UserTrackingModes" statics', () => {
      expect(Camera.UserTrackingModes).toStrictEqual({
        Follow: 'normal',
        FollowWithCourse: 'course',
        FollowWithHeading: 'compass',
      });
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

      test('does not call "#_setCamera" or "#setNativeProps" when "nextCamera" has no changes to "currentCamera"', () => {
        camera._handleCameraChange(
          cameraWithoutFollowDefault,
          cameraWithoutFollowDefault,
        );

        expect(camera._hasCameraChanged).toHaveBeenCalled();
        expect(camera._setCamera).not.toHaveBeenCalled();
        expect(camera.refs.camera.setNativeProps).not.toHaveBeenCalled();
      });

      test('sets "followUserLocation" to false when it was removed on "nextCamera"', () => {
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

      test('sets "followUserLocation" to true when it was added on "nextCamera"', () => {
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

      test('calls "#_setCamera" when "nextCamera" "hasChanged" without bounds', () => {
        camera._handleCameraChange(
          cameraWithoutFollowDefault,
          cameraWithoutFollowChanged,
        );

        expect(camera._hasCameraChanged).toHaveBeenCalled();
        expect(camera._hasBoundsChanged).toHaveBeenCalled();
        expect(camera._setCamera).toHaveBeenCalledWith({
          animationDuration: 1000,
          animationMode: 'easeTo',
          centerCoordinate: [-110.8678, 37.2866],
          heading: undefined,
          pitch: undefined,
          zoomLevel: 13,
        });
      });

      test('calls "#_hasBoundsChanged" & "#_setCamera" when "nextCamera" "hasChanged" with bounds', () => {
        camera._handleCameraChange(
          cameraWithoutFollowDefault,
          cameraWithBounds,
        );

        expect(camera._hasCameraChanged).toHaveBeenCalled();
        expect(camera._hasBoundsChanged).toHaveBeenCalledTimes(2);
        expect(camera._setCamera).toHaveBeenCalledWith({
          animationDuration: 2000,
          animationMode: 'easeTo',
          bounds: { ne: [-74.12641, 40.797968], sw: [-74.143727, 40.772177] },
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
          [{ heading: 120 }, { heading: 121 }],
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

        testCases.forEach((c) => {
          expect(camera._hasCameraChanged(c[0], c[1])).toBe(true);
        });
      });

      test('returns true if "hasFollowPropsChanged"', () => {
        const testCases = [
          [{ followUserLocation: false }, { followUserLocation: true }],
          [{ followUserMode: 'normal' }, { followUserMode: 'course' }],
          [{ followZoomLevel: 10 }, { followZoomLevel: 13 }],
          [{ followHeading: 100 }, { followHeading: 110 }],
          [{ followPitch: 40 }, { followPitch: 49 }],
        ];

        testCases.forEach((c) => {
          expect(camera._hasCameraChanged(c[0], c[1])).toBe(true);
        });
      });

      test('returns true if "hasAnimationPropsChanged"', () => {
        const testCases = [
          [{ animationDuration: 3000 }, { animationDuration: 1000 }],
          [{ animationMode: 'flyTo' }, { animationMode: 'easeTo' }],
        ];

        testCases.forEach((c) => {
          expect(camera._hasCameraChanged(c[0], c[1])).toBe(true);
        });
      });
    });

    describe('#_hasCenterCoordinateChanged', () => {
      const camera = new Camera();

      test('returns false when centerCoordinates are missing', () => {
        expect(camera._hasCenterCoordinateChanged({}, {})).toBe(false);
      });

      test('returns false when centerCoordinates have not changed', () => {
        expect(
          camera._hasCenterCoordinateChanged(
            [-111.8678, 40.2866],
            [-111.8678, 40.2866],
          ),
        ).toBe(false);
      });

      test('returns true when centerCoordinates have changed', () => {
        expect(
          camera._hasCenterCoordinateChanged([-111.8678, 40.2866], undefined),
        ).toBe(true);

        expect(
          camera._hasCenterCoordinateChanged(undefined, [-111.8678, 40.2866]),
        ).toBe(true);

        // isLngDiff
        expect(
          camera._hasCenterCoordinateChanged(
            [-111.2678, 40.2866],
            [-111.8678, 40.2866],
          ),
        ).toBe(true);

        // isLatDiff
        expect(
          camera._hasCenterCoordinateChanged(
            [-111.2678, 40.2866],
            [-111.8678, 33.2866],
          ),
        ).toBe(true);
      });
    });

    describe('#_hasBoundsChanged', () => {
      const camera = new Camera();
      const bounds = {
        ne: [-74.12641, 40.797968],
        sw: [-74.143727, 40.772177],
        paddingTop: 5,
        paddingLeft: 5,
        paddingRight: 5,
        paddingBottom: 5,
      };

      test('returns false when bounds are missing', () => {
        expect(camera._hasBoundsChanged(undefined, undefined)).toBe(false);
      });

      test('returns false when bounds have not changed', () => {
        expect(camera._hasBoundsChanged(bounds, bounds)).toBe(false);
      });

      test('returns true when bound props have changed', () => {
        // ne[0]
        expect(
          camera._hasBoundsChanged(bounds, {
            ...bounds,
            ne: [-34.12641, 40.797968],
          }),
        ).toBe(true);

        // ne[1]
        expect(
          camera._hasBoundsChanged(bounds, {
            ...bounds,
            ne: [-74.12641, 30.797968],
          }),
        ).toBe(true);

        // sw[0]
        expect(
          camera._hasBoundsChanged(bounds, {
            ...bounds,
            sw: [-74.143723, 40.772177],
          }),
        ).toBe(true);

        // sw[1]
        expect(
          camera._hasBoundsChanged(bounds, {
            ...bounds,
            sw: [-74.143727, 40.772137],
          }),
        ).toBe(true);

        // paddingTop
        expect(
          camera._hasBoundsChanged(bounds, {
            ...bounds,
            paddingTop: 3,
          }),
        ).toBe(true);

        // paddingLeft
        expect(
          camera._hasBoundsChanged(bounds, {
            ...bounds,
            paddingLeft: 3,
          }),
        ).toBe(true);

        // paddingRight
        expect(
          camera._hasBoundsChanged(bounds, {
            ...bounds,
            paddingRight: 3,
          }),
        ).toBe(true);

        // paddingBottom
        expect(
          camera._hasBoundsChanged(bounds, {
            ...bounds,
            paddingBottom: 3,
          }),
        ).toBe(true);
      });

      describe('does work with maxBounds', () => {
        const currentMaxBounds = {
          ne: [-74.12641, 40.797968],
          sw: [-74.143727, 40.772177],
        };

        const nextMaxBounds = {
          ne: [-83.12641, 42.797968],
          sw: [-64.143727, 35.772177],
        };

        test('returns true if changed', () => {
          expect(
            camera._hasBoundsChanged(currentMaxBounds, nextMaxBounds),
          ).toBe(true);
        });

        test('returns false if unchanged', () => {
          expect(
            camera._hasBoundsChanged(currentMaxBounds, currentMaxBounds),
          ).toBe(false);
        });

        test('returns false if both undefined', () => {
          expect(camera._hasBoundsChanged(undefined, undefined)).toBe(false);
        });

        test('does work with currentBounds being undefined', () => {
          expect(camera._hasBoundsChanged(undefined, nextMaxBounds)).toBe(true);
        });

        test('does work with nextBounds being undefined', () => {
          expect(camera._hasBoundsChanged(currentMaxBounds, undefined)).toBe(
            true,
          );
        });
      });
    });

    describe('#fitBounds', () => {
      const camera = new Camera();
      const ne = [-63.12641, 39.797968];
      const sw = [-74.143727, 40.772177];

      beforeEach(() => {
        camera.setCamera = jest.fn();
      });

      test('works without provided "padding" and/ or "animationDuration"', () => {
        // FIXME: animationDuration and padding of null lead to malformed setCamera config

        const expectedCallResults = [
          {
            animationDuration: null,
            animationMode: 'easeTo',
            bounds: {
              ne: [-63.12641, 39.797968],
              sw: [-74.143727, 40.772177],
            },
            padding: {
              paddingBottom: null,
              paddingLeft: null,
              paddingRight: null,
              paddingTop: null,
            },
          },
          {
            animationDuration: 0,
            animationMode: 'easeTo',
            bounds: {
              ne: [-63.12641, 39.797968],
              sw: [-74.143727, 40.772177],
            },
            padding: {
              paddingBottom: null,
              paddingLeft: null,
              paddingRight: null,
              paddingTop: null,
            },
          },
          {
            animationDuration: 0,
            animationMode: 'easeTo',
            bounds: {
              ne: [-63.12641, 39.797968],
              sw: [-74.143727, 40.772177],
            },
            padding: {
              paddingBottom: 0,
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
            },
          },
        ];

        camera.fitBounds(ne, sw, null, null);
        camera.fitBounds(ne, sw, null);
        camera.fitBounds(ne, sw);

        camera.setCamera.mock.calls.forEach((call, i) => {
          expect(call[0]).toStrictEqual(expectedCallResults[i]);
        });
      });

      // TODO: Refactor #fitBounds to throw when ne or sw aren't provided
      // This is a public method and people will call it with all sorts of data
      test.skip('throws when "ne" or "sw" are missing', () => {});

      test('works with "padding" being a single number', () => {
        const expectedCallResult = {
          animationDuration: 500,
          animationMode: 'easeTo',
          bounds: {
            ne: [-63.12641, 39.797968],
            sw: [-74.143727, 40.772177],
          },
          padding: {
            paddingBottom: 3,
            paddingLeft: 3,
            paddingRight: 3,
            paddingTop: 3,
          },
        };

        camera.fitBounds(ne, sw, 3, 500);
        expect(camera.setCamera).toHaveBeenCalledWith(expectedCallResult);
      });

      test('works with "padding" being an array of two numbers', () => {
        const expectedCallResult = {
          animationDuration: 500,
          animationMode: 'easeTo',
          bounds: {
            ne: [-63.12641, 39.797968],
            sw: [-74.143727, 40.772177],
          },
          padding: {
            paddingBottom: 3,
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 3,
          },
        };

        camera.fitBounds(ne, sw, [3, 5], 500);
        expect(camera.setCamera).toHaveBeenCalledWith(expectedCallResult);
      });

      test('works with "padding" being an array of four numbers', () => {
        const expectedCallResult = {
          animationDuration: 500,
          animationMode: 'easeTo',
          bounds: {
            ne: [-63.12641, 39.797968],
            sw: [-74.143727, 40.772177],
          },
          padding: {
            paddingBottom: 8,
            paddingLeft: 10,
            paddingRight: 5,
            paddingTop: 3,
          },
        };

        camera.fitBounds(ne, sw, [3, 5, 8, 10], 500);
        expect(camera.setCamera).toHaveBeenCalledWith(expectedCallResult);
      });
    });

    describe('#flyTo', () => {
      const camera = new Camera();

      beforeEach(() => {
        camera.setCamera = jest.fn();
      });

      test.skip('throws when no coordinates are provided', () => {
        // TODO: Refactor #flyTo to throw when coordinates aren't provided
        // This is a public method and people will call it with all sorts of data
      });

      test('sets default "animationDuration" when called without it', () => {
        camera.flyTo([-111.8678, 40.2866]);
        expect(camera.setCamera).toHaveBeenCalledWith({
          animationDuration: 2000,
          animationMode: 'flyTo',
          centerCoordinate: [-111.8678, 40.2866],
        });
      });

      test('calls "setCamera" with correct config', () => {
        camera.flyTo([-111.8678, 40.2866], 5000);
        expect(camera.setCamera).toHaveBeenCalledWith({
          animationDuration: 5000,
          animationMode: 'flyTo',
          centerCoordinate: [-111.8678, 40.2866],
        });
      });
    });

    describe('#moveTo', () => {
      const camera = new Camera();

      beforeEach(() => {
        // FIXME: Why is moveTo calling #_setCamera instead of #setCamera?
        // let's be consistent here - have all methods use one of both
        camera._setCamera = jest.fn();
      });

      test.skip('throws when no coordinates are provided', () => {
        // TODO: Refactor #moveTo to throw when coordinates aren't provided
        // This is a public method and people will call it with all sorts of data
      });

      test('sets default "animationDuration" when called without it', () => {
        camera.moveTo([-111.8678, 40.2866]);
        expect(camera._setCamera).toHaveBeenCalledWith({
          animationDuration: 0,
          centerCoordinate: [-111.8678, 40.2866],
        });
      });

      test('calls "_setCamera" with correct config', () => {
        camera.moveTo([-111.8678, 40.2866], 5000);
        expect(camera._setCamera).toHaveBeenCalledWith({
          animationDuration: 5000,
          centerCoordinate: [-111.8678, 40.2866],
        });
      });
    });

    describe('#zoomTo', () => {
      const camera = new Camera();

      beforeEach(() => {
        camera._setCamera = jest.fn();
      });

      test.skip('throws when no zoomLevel is provided', () => {
        // TODO: Refactor #moveTo to throw when coordinates aren't provided
        // This is a public method and people will call it with all sorts of data
      });

      test('sets default "animationDuration" when called without it', () => {
        camera.zoomTo(10);
        expect(camera._setCamera).toHaveBeenCalledWith({
          animationDuration: 2000,
          zoomLevel: 10,
          animationMode: 'flyTo',
        });
      });

      test('calls "_setCamera" with correct config', () => {
        camera.zoomTo(10, 3000);
        expect(camera._setCamera).toHaveBeenCalledWith({
          animationDuration: 3000,
          zoomLevel: 10,
          animationMode: 'flyTo',
        });
      });
    });

    describe('#setCamera', () => {
      const camera = new Camera();

      beforeEach(() => {
        camera._setCamera = jest.fn();
      });

      test('sets default empty "config" when called without one', () => {
        camera.setCamera();
        expect(camera._setCamera).toHaveBeenCalledWith({});
      });

      test('calls "_setCamera" with passed config', () => {
        const config = {
          animationDuration: 500,
          animationMode: 'easeTo',
          bounds: {
            ne: [-63.12641, 39.797968],
            paddingBottom: 8,
            paddingLeft: 10,
            paddingRight: 5,
            paddingTop: 3,
            sw: [-74.143727, 40.772177],
          },
        };

        camera.setCamera(config);
        expect(camera._setCamera).toHaveBeenCalledWith(config);
      });
    });

    describe('#_setCamera', () => {
      const camera = new Camera();

      beforeEach(() => {
        jest.spyOn(Camera.prototype, '_createStopConfig');

        // set up fake ref
        camera.refs = {
          camera: {
            setNativeProps: jest.fn(),
          },
        };

        // set up fake props
        // we only do this, because we want to test the class methods!
        camera.props = {};

        jest.clearAllMocks();
      });

      test('calls "_createStopConfig" and passes stopConfig to "setNativeProps"', () => {
        const config = {
          animationDuration: 500,
          animationMode: 'easeTo',
          bounds: {
            ne: [-63.12641, 39.797968],
            paddingBottom: 8,
            paddingLeft: 10,
            paddingRight: 5,
            paddingTop: 3,
            sw: [-74.143727, 40.772177],
          },
          heading: 100,
          pitch: 45,
          zoomLevel: 11,
        };

        camera._setCamera(config);

        expect(camera._createStopConfig).toHaveBeenCalledWith({
          animationDuration: 500,
          animationMode: 'easeTo',
          bounds: {
            ne: [-63.12641, 39.797968],
            paddingBottom: 8,
            paddingLeft: 10,
            paddingRight: 5,
            paddingTop: 3,
            sw: [-74.143727, 40.772177],
          },
          heading: 100,
          pitch: 45,
          zoomLevel: 11,
        });

        expect(camera._createStopConfig).toHaveBeenCalledTimes(1);

        expect(camera.refs.camera.setNativeProps).toHaveBeenCalledWith({
          stop: {
            bounds:
              '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-63.12641,39.797968]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-74.143727,40.772177]}}]}',
            paddingBottom: 8,
            paddingLeft: 10,
            paddingRight: 5,
            paddingTop: 3,
            duration: 500,
            heading: 100,
            mode: 'Ease',
            pitch: 45,
            zoom: 11,
          },
        });
      });

      test('creates multiple stops when provided', () => {
        const config = {
          stops: [
            {
              animationDuration: 50,
              animationMode: 'easeTo',
              bounds: {
                ne: [-63.12641, 39.797968],
                paddingBottom: 2,
                paddingLeft: 2,
                paddingRight: 2,
                paddingTop: 2,
                sw: [-74.143727, 40.772177],
              },
              heading: 20,
              pitch: 25,
              zoomLevel: 16,
            },
            {
              animationDuration: 3000,
              animationMode: 'flyTo',
              bounds: {
                ne: [-63.12641, 59.797968],
                paddingBottom: 8,
                paddingLeft: 10,
                paddingRight: 5,
                paddingTop: 3,
                sw: [-71.143727, 40.772177],
              },
              heading: 40,
              pitch: 45,
              zoomLevel: 8,
            },
            {
              animationDuration: 500,
              animationMode: 'easeTo',
              bounds: {
                ne: [-63.12641, 39.797968],
                paddingBottom: 8,
                paddingLeft: 10,
                paddingRight: 5,
                paddingTop: 3,
                sw: [-74.143727, 40.772177],
              },
              heading: 100,
              pitch: 45,
              zoomLevel: 11,
            },
          ],
        };

        camera._setCamera(config);

        expect(camera._createStopConfig).toHaveBeenCalledTimes(3);

        expect(camera._createStopConfig).toHaveBeenCalledWith({
          animationDuration: 500,
          animationMode: 'easeTo',
          bounds: {
            ne: [-63.12641, 39.797968],
            paddingBottom: 8,
            paddingLeft: 10,
            paddingRight: 5,
            paddingTop: 3,
            sw: [-74.143727, 40.772177],
          },
          heading: 100,
          pitch: 45,
          zoomLevel: 11,
        });

        expect(camera.refs.camera.setNativeProps).toHaveBeenCalledWith({
          stop: {
            stops: [
              {
                bounds:
                  '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-63.12641,39.797968]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-74.143727,40.772177]}}]}',
                paddingBottom: 2,
                paddingLeft: 2,
                paddingRight: 2,
                paddingTop: 2,
                duration: 50,
                heading: 20,
                mode: 'Ease',
                pitch: 25,
                zoom: 16,
              },
              {
                bounds:
                  '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-63.12641,59.797968]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-71.143727,40.772177]}}]}',
                paddingBottom: 8,
                paddingLeft: 10,
                paddingRight: 5,
                paddingTop: 3,
                duration: 3000,
                heading: 40,
                mode: 'Flight',
                pitch: 45,
                zoom: 8,
              },
              {
                bounds:
                  '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-63.12641,39.797968]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-74.143727,40.772177]}}]}',
                paddingBottom: 8,
                paddingLeft: 10,
                paddingRight: 5,
                paddingTop: 3,
                duration: 500,
                heading: 100,
                mode: 'Ease',
                pitch: 45,
                zoom: 11,
              },
            ],
          },
        });
      });
    });

    describe('#_createDefaultCamera', () => {
      const camera = new Camera();

      beforeEach(() => {});

      test('returns null without "defaultSettings"', () => {
        camera.props = {};
        expect(camera._createDefaultCamera()).toBe(null);
      });

      test('returns "defaultCamera" with "defaultSettings" and sets property', () => {
        camera.props = {
          defaultSettings: {
            centerCoordinate: [-111.8678, 40.2866],
            zoomLevel: 16,
            animationMode: 'moveTo',
          },
        };

        const defaultCamera = {
          centerCoordinate:
            '{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-111.8678,40.2866]}}',
          duration: 0,
          heading: undefined,
          mode: 'Move',
          pitch: undefined,
          zoom: 16,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 0,
        };

        expect(camera.defaultCamera).toStrictEqual(undefined);
        expect(camera._createDefaultCamera()).toStrictEqual(defaultCamera);
        expect(camera.defaultCamera).toStrictEqual(defaultCamera);
      });
    });

    describe('#_createStopConfig', () => {
      const camera = new Camera();
      const configWithoutBounds = {
        animationDuration: 2000,
        animationMode: 'easeTo',
        pitch: 45,
        heading: 110,
        zoomLevel: 9,
      };

      const configWithBounds = {
        animationDuration: 500,
        animationMode: 'easeTo',
        bounds: {
          ne: [-63.12641, 39.797968],
          paddingBottom: 8,
          paddingLeft: 10,
          paddingRight: 5,
          paddingTop: 3,
          sw: [-74.143727, 40.772177],
        },
        heading: 100,
        pitch: 45,
        zoomLevel: 11,
      };

      beforeEach(() => {
        jest.spyOn(Camera.prototype, '_getNativeCameraMode');

        jest.clearAllMocks();
      });

      test('returns null with "followUserLocation" prop and "!ignoreFollowUserLocation"', () => {
        camera.props = {
          followUserLocation: true,
        };
        expect(camera._createStopConfig()).toBe(null);
      });

      test('returns correct "stopConfig" without bounds', () => {
        camera.props = {
          followUserLocation: true,
        };

        expect(
          camera._createStopConfig(configWithoutBounds, true),
        ).toStrictEqual({
          duration: 2000,
          heading: 110,
          mode: 'Ease',
          pitch: 45,
          zoom: 9,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 0,
        });

        // with centerCoordinate
        expect(
          camera._createStopConfig(
            { ...configWithoutBounds, centerCoordinate: [-111.8678, 40.2866] },
            true,
          ),
        ).toStrictEqual({
          centerCoordinate:
            '{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-111.8678,40.2866]}}',
          duration: 2000,
          heading: 110,
          mode: 'Ease',
          pitch: 45,
          zoom: 9,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 0,
        });
      });

      test('returns correct "stopConfig" with bounds', () => {
        camera.props = {
          followUserLocation: true,
        };

        expect(camera._createStopConfig(configWithBounds, true)).toStrictEqual({
          bounds:
            '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-63.12641,39.797968]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-74.143727,40.772177]}}]}',
          paddingBottom: 8,
          paddingLeft: 10,
          paddingRight: 5,
          paddingTop: 3,
          duration: 500,
          heading: 100,
          mode: 'Ease',
          pitch: 45,
          zoom: 11,
        });

        // with centerCoordinate
        expect(
          camera._createStopConfig(
            { ...configWithBounds, centerCoordinate: [-111.8678, 40.2866] },
            true,
          ),
        ).toStrictEqual({
          bounds:
            '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-63.12641,39.797968]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-74.143727,40.772177]}}]}',
          paddingBottom: 8,
          paddingLeft: 10,
          paddingRight: 5,
          paddingTop: 3,
          centerCoordinate:
            '{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-111.8678,40.2866]}}',
          duration: 500,
          heading: 100,
          mode: 'Ease',
          pitch: 45,
          zoom: 11,
        });
      });
    });

    describe('#_getNativeCameraMode', () => {
      const camera = new Camera();

      test('returns "Flight" for "flyTo"', () => {
        expect(
          camera._getNativeCameraMode({ animationMode: 'flyTo' }),
        ).toStrictEqual('Flight');
      });

      test('returns "None" for "moveTo"', () => {
        expect(
          camera._getNativeCameraMode({ animationMode: 'moveTo' }),
        ).toStrictEqual('Move');
      });

      test('returns "Ease" as default', () => {
        expect(camera._getNativeCameraMode({})).toStrictEqual('Ease');
      });
    });

    describe('#_getMaxBounds', () => {
      const camera = new Camera();

      test('returns null if no "maxBounds"', () => {
        camera.props = {};
        expect(camera._getMaxBounds()).toStrictEqual(null);

        camera.props = {
          maxBounds: {
            ne: [-74.12641, 40.797968],
          },
        };
        expect(camera._getMaxBounds()).toStrictEqual(null);

        camera.props = {
          maxBounds: {
            sw: [-74.143727, 40.772177],
          },
        };
        expect(camera._getMaxBounds()).toStrictEqual(null);
      });

      test('returns maxBounds when "maxBounds" property is set', () => {
        camera.props = {
          maxBounds: {
            ne: [-74.12641, 40.797968],
            sw: [-74.143727, 40.772177],
          },
        };

        expect(camera._getMaxBounds()).toStrictEqual(
          '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-74.12641,40.797968]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-74.143727,40.772177]}}]}',
        );
      });
    });
  });
});
