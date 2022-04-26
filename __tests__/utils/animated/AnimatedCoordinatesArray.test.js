/* eslint-disable fp/no-mutating-methods */
import FakeTimers from '@sinonjs/fake-timers';
import { Animated, Easing } from 'react-native';
import TestRenderer from 'react-test-renderer';
import React from 'react';

import AnimatedCoordinatesArray from '../../../javascript/utils/animated/AnimatedCoordinatesArray';
import AnimatedShape from '../../../javascript/utils/animated/AnimatedShape';
import ShapeSource from '../../../javascript/components/ShapeSource';

let clock = null;
let oldNodeEnv = null;

beforeAll(() => {
  clock = FakeTimers.install();
  clock._requestedAnimationFrames = [];
  clock.requestAnimationFrame = (callback) => {
    clock._requestedAnimationFrames.push(callback);
  };
  clock.fireRequestAnimationFrames = () => {
    const oldRAF = clock._requestedAnimationFrames;
    clock._requestedAnimationFrames = [];
    oldRAF.forEach((cb) => cb(Date.now()));
  };

  // animated will not call nativeProps in test mode
  // https://github.com/facebook/react-native/blob/34d3373bb0f7ee405292bf993163f29759ba5205/Libraries/Animated/createAnimatedComponent.js#L150-L156
  oldNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'dev';
});

afterAll(() => {
  process.env.NODE_ENV = oldNodeEnv;
  clock.uninstall();
});

const AnimatedShapeSource = Animated.createAnimatedComponent(ShapeSource);

function _nativeRef(ref) {
  return ref._nativeRef;
}

describe('AnimatedShapeSource', () => {
  test('testSetNativeProps', () => {
    AnimatedShapeSource.__skipSetNativeProps_FOR_TESTS_ONLY = false;
    const coordinates = new AnimatedCoordinatesArray([
      [1, 1],
      [10, 10],
    ]);

    let shapeSourceRef;
    // eslint-disable-next-line no-unused-vars
    const testRenderer = TestRenderer.create(
      <AnimatedShapeSource
        shape={new AnimatedShape({ type: 'LineString', coordinates })}
        ref={(ref) => (shapeSourceRef = ref)}
      />,
    );
    const setNativeProps = jest.fn();
    _nativeRef(shapeSourceRef).setNativeProps = setNativeProps;

    coordinates
      .timing({
        toValue: [
          [21, 21],
          [30, 30],
        ],
        duration: 20,
        easing: Easing.linear,
        useNativeDriver: false,
      })
      .start();

    expect(setNativeProps).toHaveBeenCalledTimes(0);
    // process.env.NODE_ENV = 'TEST_butDontSkipSetNativeProps' for future RN
    for (let i = 0; i < 5; i++) {
      clock.tick(4);
      clock.fireRequestAnimationFrames();
      expect(setNativeProps).toHaveBeenCalledTimes(i + 1);
      expect(setNativeProps).toHaveBeenCalledWith({
        shape: JSON.stringify({
          type: 'LineString',
          coordinates: [
            [1 + (i + 1) * 4, 1 + (i + 1) * 4],
            [10 + (i + 1) * 4, 10 + (i + 1) * 4],
          ],
        }),
      });
    }
    // process.env.NODE_ENV = 'TEST';
  });

  test('testAddingCoords', () => {
    AnimatedShapeSource.__skipSetNativeProps_FOR_TESTS_ONLY = false;
    const coordinates = new AnimatedCoordinatesArray([
      [1, 1],
      [10, 10],
    ]);

    let shapeSourceRef;
    // eslint-disable-next-line no-unused-vars
    const testRenderer = TestRenderer.create(
      <AnimatedShapeSource
        shape={new AnimatedShape({ type: 'LineString', coordinates })}
        ref={(ref) => (shapeSourceRef = ref)}
      />,
    );
    const setNativeProps = jest.fn();
    _nativeRef(shapeSourceRef).setNativeProps = setNativeProps;

    coordinates
      .timing({
        toValue: [
          [21, 21],
          [30, 30],
          [50, 50],
        ],
        duration: 20,
        easing: Easing.linear,
        useNativeDriver: false,
      })
      .start();

    expect(setNativeProps).toHaveBeenCalledTimes(0);
    // process.env.NODE_ENV = 'TEST_butDontSkipSetNativeProps' for future RN
    for (let i = 0; i < 5; i++) {
      clock.tick(4);
      clock.fireRequestAnimationFrames();
      expect(setNativeProps).toHaveBeenCalledTimes(i + 1);
      expect(setNativeProps).toHaveBeenCalledWith({
        shape: JSON.stringify({
          type: 'LineString',
          coordinates: [
            [1 + (i + 1) * 4, 1 + (i + 1) * 4],
            [10 + (i + 1) * 4, 10 + (i + 1) * 4],
            [10 + (i + 1) * 8, 10 + (i + 1) * 8],
          ],
        }),
      });
    }
    // process.env.NODE_ENV = 'TEST';
  });

  test('testRemovingCoords', () => {
    AnimatedShapeSource.__skipSetNativeProps_FOR_TESTS_ONLY = false;
    const coordinates = new AnimatedCoordinatesArray([
      [1, 1],
      [10, 10],
      [50, 50],
    ]);

    let shapeSourceRef;
    // eslint-disable-next-line no-unused-vars
    const testRenderer = TestRenderer.create(
      <AnimatedShapeSource
        shape={new AnimatedShape({ type: 'LineString', coordinates })}
        ref={(ref) => (shapeSourceRef = ref)}
      />,
    );
    const setNativeProps = jest.fn();
    _nativeRef(shapeSourceRef).setNativeProps = setNativeProps;

    coordinates
      .timing({
        toValue: [
          [21, 21],
          [30, 30],
        ],
        duration: 20,
        easing: Easing.linear,
        useNativeDriver: false,
      })
      .start();

    expect(setNativeProps).toHaveBeenCalledTimes(0);
    // process.env.NODE_ENV = 'TEST_butDontSkipSetNativeProps' for future RN
    for (let i = 0; i < 5; i++) {
      clock.tick(4);
      clock.fireRequestAnimationFrames();
      expect(setNativeProps).toHaveBeenCalledTimes(i + 1);
      expect(setNativeProps).toHaveBeenCalledWith({
        shape: JSON.stringify({
          type: 'LineString',
          coordinates: [
            [1 + (i + 1) * 4, 1 + (i + 1) * 4],
            [10 + (i + 1) * 4, 10 + (i + 1) * 4],
            [50 - (i + 1) * 4, 50 - (i + 1) * 4],
          ],
        }),
      });
    }
    // process.env.NODE_ENV = 'TEST';
  });
});
