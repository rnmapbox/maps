import * as React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import MapView from '../../src/components/MapView';
import NativeMapViewModule from '../../src/specs/NativeMapViewModule';
import NativeMapView from '../../src/specs/RNMBXMapViewNativeComponent';

// `_runNativeMethod` lives on the class produced by `NativeBridgeComponent`,
// which `MapView` extends - it is not an own property of `MapView.prototype`.
const bridgePrototype = Object.getPrototypeOf(MapView.prototype);

// Let the microtask queue drain and give node a macrotask turn, which is when
// an unhandled rejection would be reported.
const flushRejections = async () => {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
};

describe('MapView', () => {
  test('renders with testID', () => {
    const expectedTestId = 'im used for identification in tests';

    const { getByTestId } = render(<MapView testID={expectedTestId} />);

    expect(() => {
      getByTestId(expectedTestId);
    }).not.toThrow();
  });

  describe('setHandledMapChangedEvents', () => {
    let unhandledRejection;
    let warnSpy;

    beforeEach(() => {
      unhandledRejection = jest.fn();
      process.on('unhandledRejection', unhandledRejection);
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      process.off('unhandledRejection', unhandledRejection);
      jest.restoreAllMocks();
    });

    // Regression guard for the fix itself: on a plain render the native ref is
    // not resolved yet, so the call is queued rather than sent to the native
    // module. The queued branch must still hand back a real promise, otherwise
    // attaching a rejection handler to it would throw.
    test('queues the call while the native ref is unresolved', () => {
      const nativeSpy = jest.spyOn(
        NativeMapViewModule,
        'setHandledMapChangedEvents',
      );
      const ref = React.createRef();

      render(<MapView ref={ref} onMapIdle={() => {}} />);

      expect(ref.current._nativeRef).toBeUndefined();
      expect(nativeSpy).not.toHaveBeenCalled();
      expect(ref.current._preRefMapMethodQueue).toHaveLength(1);
      expect(
        ref.current._runNativeMethod('setHandledMapChangedEvents', undefined, [
          [],
        ]),
      ).toBeInstanceOf(Promise);
    });

    // https://github.com/rnmapbox/maps/issues/3492 - unmounting the map while
    // the call is in flight rejects with `Unknown reactTag: <n>`.
    test('does not leak an unhandled rejection on mount', async () => {
      let error;
      jest.spyOn(bridgePrototype, '_runNativeMethod').mockImplementation(() => {
        // Built here so the stack points at the real bridge call site.
        error = new Error('Unknown reactTag: 123');
        return Promise.reject(error);
      });

      render(<MapView onMapIdle={() => {}} />);
      await flushRejections();

      expect(unhandledRejection).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('setHandledMapChangedEvents'),
        error,
      );
    });

    test('does not leak an unhandled rejection on update', async () => {
      const ref = React.createRef();
      const { rerender } = render(<MapView ref={ref} onMapIdle={() => {}} />);

      let error;
      const runNativeMethod = jest
        .spyOn(bridgePrototype, '_runNativeMethod')
        .mockImplementation(() => {
          // Built here so the stack points at the real bridge call site.
          error = new Error('Unknown reactTag: 123');
          return Promise.reject(error);
        });

      // A new inline handler changes the callback prop identity, which is what
      // makes `componentDidUpdate` resend the handled events.
      rerender(<MapView ref={ref} onMapIdle={() => {}} />);
      await flushRejections();

      expect(runNativeMethod).toHaveBeenCalledWith(
        'setHandledMapChangedEvents',
        undefined,
        [expect.arrayContaining([expect.any(String)])],
      );
      expect(unhandledRejection).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('setHandledMapChangedEvents'),
        error,
      );
    });

    // `runNativeMethod` throws synchronously when the view handle has already
    // gone, so a bare `.catch()` would not cover it.
    test('reports a synchronous failure instead of throwing', async () => {
      const error = new Error('Could not find handle for native ref');
      jest
        .spyOn(bridgePrototype, '_runNativeMethod')
        .mockImplementation(() => {
          throw error;
        });

      expect(() => render(<MapView onMapIdle={() => {}} />)).not.toThrow();
      await flushRejections();

      expect(unhandledRejection).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('setHandledMapChangedEvents'),
        error,
      );
    });

    // The mount-time call is queued until the native ref lands, so it is
    // drained by `_runPendingNativeMethods` - an async method every caller
    // invokes fire-and-forget, which leaks the rejection just the same.
    test('does not leak an unhandled rejection while draining the queue', async () => {
      const ref = React.createRef();
      render(<MapView ref={ref} onMapIdle={() => {}} />);

      expect(ref.current._preRefMapMethodQueue).toHaveLength(1);

      let error;
      jest.spyOn(bridgePrototype, '_runNativeMethod').mockImplementation(() => {
        error = new Error('Unknown reactTag: 123');
        return Promise.reject(error);
      });

      ref.current._setNativeRef({});
      await flushRejections();

      expect(unhandledRejection).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('setHandledMapChangedEvents'),
        error,
      );
    });

    // Non-vacuity: the tests above must not pass merely because every outcome
    // is being swallowed - a successful call still resolves and stays quiet.
    test('stays quiet when the native call succeeds', async () => {
      const runNativeMethod = jest
        .spyOn(bridgePrototype, '_runNativeMethod')
        .mockImplementation(() => Promise.resolve(undefined));

      render(<MapView onMapIdle={() => {}} />);
      await flushRejections();

      expect(runNativeMethod).toHaveBeenCalledTimes(1);
      expect(unhandledRejection).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('native props', () => {
    const renderNativeProps = (props) => {
      const { getByTestId, UNSAFE_getByType } = render(
        <MapView testID="map" {...props} />,
      );
      fireEvent(getByTestId('map'), 'layout', {
        nativeEvent: { layout: { width: 100, height: 100 } },
      });
      return UNSAFE_getByType(NativeMapView).props;
    };

    // Native code can only tell an explicit `surfaceView` from the default
    // when the default is not filled in on the JS side.
    test('does not pass surfaceView unless set', () => {
      const props = renderNativeProps({});
      expect(props).not.toHaveProperty('surfaceView');
      expect(props).not.toHaveProperty('transparent');
    });

    test('passes both explicitly set props through', () => {
      const props = renderNativeProps({ transparent: true, surfaceView: true });
      expect(props.transparent).toBe(true);
      expect(props.surfaceView).toBe(true);
    });

    test('passes debugOptions through', () => {
      const props = renderNativeProps({
        debugOptions: ['tileBorders', 'collision'],
      });
      expect(props.debugOptions).toEqual(['tileBorders', 'collision']);
    });
  });
});
