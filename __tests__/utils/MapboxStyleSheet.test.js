import MapboxGL from '../../javascript';

describe('MapboxStyleSheet', () => {
  const BLUE_INT = 4278190335;
  const GREEN_INT = 4278222848;

  it('should create constant item', () => {
    verifyStyleSheetsMatch({ fillOpacity: 0.84 }, {
      fillOpacity: {
        type: 'constant',
        payload: { value: 0.84 },
        __MAPBOX_STYLE__: true,
      },
    });
  });

  it('should create transition item', () => {
    verifyStyleSheetsMatch({ fillColorTransition: { delay: 10, duration: 200 } }, {
      fillColorTransition: {
        type: 'transition',
        payload: {
          value: {
            duration: 200,
            delay: 10,
          },
        },
        __MAPBOX_STYLE__: true,
      },
    });
  });

  it('should create image item', () => {
    verifyStyleSheetsMatch({ fillPattern: 'test' }, {
      fillPattern: {
        type: 'constant',
        payload: { value: 'test', image: true },
        __MAPBOX_STYLE__: true,
      },
    });
  });

  it('should create asset image item for when we require images directly in JS', () => {
    verifyStyleSheetsMatch({ fillPattern: 123 }, {
      fillPattern: {
        type: 'constant',
        payload: { value: 'asset://test.png', image: true },
        __MAPBOX_STYLE__: true,
      },
    });
  });

  it('should create translate item', () => {
    verifyStyleSheetsMatch({ fillTranslate: { x: 1, y: 2 } }, {
      fillTranslate: {
        type: 'translation',
        payload: { value: [1, 2] },
        __MAPBOX_STYLE__: true,
      },
    });
  });

  it('should create camera function', () => {
    const stops = { 1: 'blue', 2: 'green' };
    const styleFunction = MapboxGL.StyleSheet.camera(stops, 'mode');

    verifyStyleSheetsMatch({ fillColor: styleFunction }, {
      fillColor: {
        __MAPBOX_STYLE__: true,
        type: 'function',
        payload: {
          fn: 'camera',
          stops: {
            1: { type: 'color', payload: { value: BLUE_INT } },
            2: { type: 'color', payload: { value: GREEN_INT } },
          },
          mode: 'mode',
        },
      },
    });
  });

  it('should create composite function', () => {
    const stops = {
      1: [0, 'blue'],
      16: [3, 'green'],
      20: [5, 'blue'],
    };
    const styleFunction = MapboxGL.StyleSheet.composite(stops, 'rating', 'mode');

    verifyStyleSheetsMatch({ fillColor: styleFunction }, {
      fillColor: {
        __MAPBOX_STYLE__: true,
        type: 'function',
        payload: {
          fn: 'composite',
          mode: 'mode',
          attributeName: 'rating',
          stops: {
            1: { type: 'color', payload: { value: BLUE_INT, propertyValue: 0 } },
            16: { type: 'color', payload: { value: GREEN_INT, propertyValue: 3 } },
            20: { type: 'color', payload: { value: BLUE_INT, propertyValue: 5 } },
          },
        }, // payload
      }, // fillPattern
    });

  });

  it('should create source function', () => {
    const stops = { bergan: 'blue', hudson: 'green' };
    const styleFunction = MapboxGL.StyleSheet.source(stops, 'county', 'mode');

    verifyStyleSheetsMatch({ fillColor: styleFunction }, {
      fillColor: {
        __MAPBOX_STYLE__: true,
        type: 'function',
        payload: {
          fn: 'source',
          mode: 'mode',
          attributeName: 'county',
          stops: {
            bergan: { type: 'color', payload: { value: BLUE_INT } },
            hudson: { type: 'color', payload: { value: GREEN_INT } },
          },
        }, // payload
      }, // fillColor
    });
  });

  it('should create stylesheet with multiple constant style fields', () => {
    const styles = {
      fillOpacity: 0.84,
      fillPattern: 'test',
    };

    verifyStyleSheetsMatch(styles, {
      fillOpacity: { type: 'constant', payload: { value: 0.84 }, __MAPBOX_STYLE__: true },
      fillPattern: { type: 'constant', payload: { value: 'test', image: true }, __MAPBOX_STYLE__: true },
    });
  });

  it('should create stylesheet with a mix of stlye functions and constants', () => {
    const styles = {
      fillColor: MapboxGL.StyleSheet.source({ bergan: 'blue' }, 'county', 'mode'),
      fillOpacity: 0.84,
    };

    verifyStyleSheetsMatch(styles, {
      fillColor: {
        __MAPBOX_STYLE__: true,
        type: 'function',
        payload: {
          fn: 'source',
          mode: 'mode',
          attributeName: 'county',
          stops: {
            bergan: { type: 'color', payload: { value: BLUE_INT } },
          },
        },
      },
      fillOpacity: { type: 'constant', payload: { value: 0.84 }, __MAPBOX_STYLE__: true },
    });

  });

  it('should create config nested one level deep', () => {
    const styles = {
      water: {
        fillColor: 'green',
        fillOpacity: 0.40,
      },
      building: {
        fillColor: 'blue',
        fillOpacity: 0.84,
      },
    };

    verifyStyleSheetsMatch(styles, {
      water: {
        fillColor: { type: 'color', payload: { value: GREEN_INT }, __MAPBOX_STYLE__: true },
        fillOpacity: { type: 'constant', payload: { value: 0.40 }, __MAPBOX_STYLE__: true },
      },
      building: {
        fillColor: { type: 'color', payload: { value: BLUE_INT }, __MAPBOX_STYLE__: true },
        fillOpacity: { type: 'constant', payload: { value: 0.84 }, __MAPBOX_STYLE__: true },
      },
    });
  });

  it('should not recreate a stylesheet if it is already a stylesheet', () => {
    const styleSheet = MapboxGL.StyleSheet.create({ fillOpacity: 0.84 });
    expect(styleSheet).toEqual(MapboxGL.StyleSheet.create(styleSheet));
  });

  it('should throw error for invalid property', () => {
    expect(() => {
      MapboxGL.StyleSheet.create({ fakeProperty: 0.84 });
    }).toThrow();

    expect(() => {
      MapboxGL.StyleSheet.create({ fakeProperty: { idk: "?" } });
    }).toThrow();

    expect(() => {
      MapboxGL.StyleSheet.create({ building: { fakeProperty: 0.84 } });
    }).toThrow();
  });

  it('should throw error for passing in undefined or null', () => {
    expect(() => MapboxGL.StyleSheet.create()).toThrow();
    expect(() => MapboxGL.StyleSheet.create(null)).toThrow();
  });

  it('should create an identity source function', () => {
    expect(MapboxGL.StyleSheet.create({ fillExtrusionHeight: MapboxGL.StyleSheet.identity('height') } )).toEqual({
      fillExtrusionHeight: {
        __MAPBOX_STYLE__: true,
        type: 'function',
        payload: {
          fn: 'source',
          stops: {},
          attributeName: 'height',
          mode: MapboxGL.InterpolationMode.Identity,
        },
      },
    });
  });

  it('should add overrides to special case styles', () => {
    expect(MapboxGL.StyleSheet.create({ textOffset: [2, 2] } )).toEqual({
      textOffset: {
        __MAPBOX_STYLE__: true,
        type: 'constant',
        payload: {
          value: [2, 2],
          iosType: 'vector',
        },
      },
    });

    expect(MapboxGL.StyleSheet.create({ iconOffset: [2, 2] } )).toEqual({
      iconOffset: {
        __MAPBOX_STYLE__: true,
        type: 'constant',
        payload: {
          value: [2, 2],
          iosType: 'vector',
        },
      },
    });
  });
});

function verifyStyleSheetsMatch (styles, expectedStyleSheet) {
  expect(MapboxGL.StyleSheet.create(styles)).toEqual(expectedStyleSheet);
}
