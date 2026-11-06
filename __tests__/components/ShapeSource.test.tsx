import React from 'react';
import { NativeModules } from 'react-native';
import { render } from '@testing-library/react-native';

import { ShapeSource } from '../../src/components/ShapeSource';

const point = (properties = {}, id?: string | number): GeoJSON.Feature => ({
  type: 'Feature',
  ...(id === undefined ? {} : { id }),
  properties,
  geometry: { type: 'Point', coordinates: [1, 2] },
});

const nativeModule = NativeModules.RNMBXShapeSourceModule;

const mount = (props: Partial<React.ComponentProps<typeof ShapeSource>>) => {
  const ref = React.createRef<ShapeSource>();
  render(<ShapeSource ref={ref} id="source" {...props} />);
  return ref.current as ShapeSource;
};

const shape: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [point({}, 'a')],
};

describe('ShapeSource partial updates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each(['addFeatures', 'updateFeatures'] as const)(
    '%s sends the features and their ids',
    async (method) => {
      const features = [point({}, 'a'), point({}, 2)];

      await mount({ shape })[method](features);

      const [, featuresJSON, featureIds, shapeRevision] =
        nativeModule[method].mock.calls[0];
      expect(JSON.parse(featuresJSON)).toEqual({
        type: 'FeatureCollection',
        features,
      });
      expect(featureIds).toEqual(['a', '2']);
      expect(shapeRevision).toEqual(1);
    },
  );

  test('removeFeatures sends the ids as strings', async () => {
    await mount({ shape }).removeFeatures(['a', 2]);

    const [, featureIds, shapeRevision] =
      nativeModule.removeFeatures.mock.calls[0];
    expect(featureIds).toEqual(['a', '2']);
    expect(shapeRevision).toEqual(1);
  });

  test('passes on the rejection of a change the map refused', async () => {
    nativeModule.updateFeatures.mockRejectedValueOnce(new Error('refused'));

    await expect(
      mount({ shape }).updateFeatures([point({}, 'missing')]),
    ).rejects.toThrow('refused');
  });

  test('a new shape gets a new revision, an equal one does not', async () => {
    const ref = React.createRef<ShapeSource>();
    const source = (next: GeoJSON.FeatureCollection) => (
      <ShapeSource ref={ref} id="source" shape={next} />
    );
    const { rerender } = render(source(shape));

    rerender(source(JSON.parse(JSON.stringify(shape))));
    await ref.current?.removeFeatures(['a']);
    expect(nativeModule.removeFeatures.mock.calls[0][2]).toEqual(1);

    rerender(source({ type: 'FeatureCollection', features: [] }));
    await ref.current?.removeFeatures(['a']);
    expect(nativeModule.removeFeatures.mock.calls[1][2]).toEqual(2);
  });

  test('takes the id from the promoteId property', async () => {
    await mount({ shape, promoteId: 'uid' }).updateFeatures([
      point({ uid: 0 }),
    ]);

    expect(nativeModule.updateFeatures.mock.calls[0][2]).toEqual(['0']);
  });

  test('prefers the promoteId property over the feature id, as the map does', async () => {
    await mount({ shape, promoteId: 'uid' }).updateFeatures([
      point({ uid: 'promoted' }, 'own'),
    ]);

    expect(nativeModule.updateFeatures.mock.calls[0][2]).toEqual(['promoted']);
  });

  test('rejects a feature without an id', async () => {
    await expect(mount({ shape }).updateFeatures([point()])).rejects.toThrow(
      'need a feature `id`',
    );
    expect(nativeModule.updateFeatures).not.toHaveBeenCalled();
  });

  test('rejects a url source', async () => {
    const source = mount({ url: 'https://example.com/data.geojson' });

    await expect(source.addFeatures([point({}, 'a')])).rejects.toThrow('`url`');
    await expect(source.removeFeatures(['a'])).rejects.toThrow('`url`');
  });

  test('rejects a shape animator', async () => {
    const source = mount({ shape: { __nativeTag: 1 } });

    await expect(source.updateFeatures([point({}, 'a')])).rejects.toThrow(
      'shape animator',
    );
  });
});
