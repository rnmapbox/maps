import { featureCollection, point } from '@turf/helpers';

import OfflineCreatePackOptions from '../../../javascript/modules/offline/OfflineCreatePackOptions';

describe('OfflineCreatePackOptions', () => {
  const options = {
    name: 'test',
    styleURL: 'mapbox://fake-style-url',
    bounds: [
      [0, 1],
      [2, 3],
    ],
    minZoom: 1,
    maxZoom: 22,
    metadata: {
      customData: 'hiking',
    },
  };

  it('should create valid options', () => {
    const actualOptions = new OfflineCreatePackOptions(options);
    expect(actualOptions.name).toEqual(options.name);
    expect(actualOptions.styleURL).toEqual(options.styleURL);

    // we expect a feature collection string
    expect(actualOptions.bounds).toEqual(
      JSON.stringify(
        featureCollection([point(options.bounds[0]), point(options.bounds[1])]),
      ),
    );

    expect(actualOptions.minZoom).toEqual(options.minZoom);
    expect(actualOptions.maxZoom).toEqual(options.maxZoom);

    // we expect a json string
    expect(actualOptions.metadata).toEqual(
      JSON.stringify({
        customData: options.metadata.customData,
        name: options.name,
      }),
    );
  });

  it('should throw error without a styleURL', () => {
    const invalidOptions = Object.assign({}, options, {
      styleURL: undefined,
    });
    verifyErrorThrown(invalidOptions);
  });

  it('should throw error without a name', () => {
    const invalidOptions = Object.assign({}, options, {
      name: undefined,
    });
    verifyErrorThrown(invalidOptions);
  });

  it('should throw error without bounds', () => {
    const invalidOptions = Object.assign({}, options, {
      bounds: undefined,
    });
    verifyErrorThrown(invalidOptions);
  });

  it('should throw error without options', () => {
    verifyErrorThrown();
    verifyErrorThrown(null);
    verifyErrorThrown({});
  });
});

function verifyErrorThrown(invalidOptions) {
  expect(() => new OfflineCreatePackOptions(invalidOptions)).toThrow();
}
