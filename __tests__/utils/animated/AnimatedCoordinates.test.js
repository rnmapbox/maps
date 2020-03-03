import AnimatedCoordinates from '../../../javascript/utils/animated/AnimatedCoordinates';

jest.useFakeTimers();

describe('AnimatedCoordinates', () => {
  it('should animate', () => {
    const coords = new AnimatedCoordinates([1, 2]);
    const callback = jest.fn();
    coords
      .timing({
        coordinates: [3, 4],
        duration: 20,
      })
      .start(callback);

    expect(coords.__getValue()).toStrictEqual([1, 2]);
    jest.advanceTimersByTime(20);

    expect(callback).toBeCalledWith({finished: true});
    expect(coords.__getValue()).toStrictEqual([3, 4]);
  });
});
