import { render } from '@testing-library/react-native';

import {
  Viewport,
  normalizeTransitionsToIdleUponUserInteraction,
} from '../../src/components/Viewport';
import RNMBXViewport from '../../src/specs/RNMBXViewportNativeComponent';

function nativeTransitionsToIdle(element: React.ReactElement) {
  const { UNSAFE_getByType } = render(element);
  return UNSAFE_getByType(RNMBXViewport).props
    .transitionsToIdleUponUserInteraction;
}

describe('Viewport transitionsToIdleUponUserInteraction', () => {
  it('passes booleans through unchanged', () => {
    expect(
      nativeTransitionsToIdle(
        <Viewport transitionsToIdleUponUserInteraction={true} />,
      ),
    ).toBe(true);
    expect(
      nativeTransitionsToIdle(
        <Viewport transitionsToIdleUponUserInteraction={false} />,
      ),
    ).toBe(false);
  });

  it('passes nothing when unset', () => {
    expect(nativeTransitionsToIdle(<Viewport />)).toBeUndefined();
  });

  it('defaults omitted gestures to true', () => {
    expect(
      nativeTransitionsToIdle(
        <Viewport
          transitionsToIdleUponUserInteraction={{ pinch: false, rotate: false }}
        />,
      ),
    ).toEqual({
      pan: true,
      pinch: false,
      doubleTap: true,
      rotate: false,
      pitch: true,
    });
  });

  it('treats an empty object like true for every gesture', () => {
    expect(normalizeTransitionsToIdleUponUserInteraction({})).toEqual({
      pan: true,
      pinch: true,
      doubleTap: true,
      rotate: true,
      pitch: true,
    });
  });

  it('drops unknown keys', () => {
    expect(
      normalizeTransitionsToIdleUponUserInteraction({
        pan: false,
        // @ts-expect-error unknown gesture
        swipe: false,
      }),
    ).toEqual({
      pan: false,
      pinch: true,
      doubleTap: true,
      rotate: true,
      pitch: true,
    });
  });
});
