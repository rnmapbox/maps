import MapboxGL from '../../javascript';

describe('MapboxStyleSheet', () => {
  const BLUE_INT = 4278190335;
  const GREEN_INT = 4278222848;

  it('should create constant item', () => {
    verifyStyleSheetsMatch(
      {fillOpacity: 0.84},
      {
        fillOpacity: {
          styletype: 'constant',
          payload: {value: 0.84},
          __MAPBOX_STYLE__: true,
        },
      },
    );
  });

  it('should create transition item', () => {
    verifyStyleSheetsMatch(
      {fillColorTransition: {delay: 10, duration: 200}},
      {
        fillColorTransition: {
          styletype: 'transition',
          payload: {
            value: {
              duration: 200,
              delay: 10,
            },
          },
          __MAPBOX_STYLE__: true,
        },
      },
    );
  });

  it('should create image item', () => {
    verifyStyleSheetsMatch(
      {fillPattern: 'test'},
      {
        fillPattern: {
          styletype: 'constant',
          payload: {value: 'test', image: true, shouldAddImage: false},
          __MAPBOX_STYLE__: true,
        },
      },
    );
  });

  it('should create asset image item for when we require images directly in JS', () => {
    verifyStyleSheetsMatch(
      {fillPattern: 123},
      {
        fillPattern: {
          styletype: 'constant',
          payload: {
            value: 'asset://test.png',
            image: true,
            shouldAddImage: true,
          },
          __MAPBOX_STYLE__: true,
        },
      },
    );
  });

  it('should create translate item from object', () => {
    verifyStyleSheetsMatch(
      {fillTranslate: {x: 1, y: 2}},
      {
        fillTranslate: {
          styletype: 'translation',
          payload: {value: [1, 2], iosType: 'vector'},
          __MAPBOX_STYLE__: true,
        },
      },
    );
  });

  it('should create translate item from array', () => {
    verifyStyleSheetsMatch(
      {fillTranslate: [1, 2]},
      {
        fillTranslate: {
          styletype: 'translation',
          payload: {value: [1, 2], iosType: 'vector'},
          __MAPBOX_STYLE__: true,
        },
      },
    );
  });

  it('should create camera function', () => {
    const stops = {1: 'blue', 2: 'green'};
    const styleFunction = MapboxGL.StyleSheet.camera(stops, 'mode');

    verifyStyleSheetsMatch(
      {fillColor: styleFunction},
      {
        fillColor: {
          __MAPBOX_STYLE__: true,
          styletype: 'function',
          payload: {
            fn: 'camera',
            attributeName: undefined,
            stops: [
              [
                {type: 'number', value: 1},
                {styletype: 'color', payload: {value: BLUE_INT}},
              ],
              [
                {type: 'number', value: 2},
                {styletype: 'color', payload: {value: GREEN_INT}},
              ],
            ],
            mode: 'mode',
          },
        },
      },
    );
  });

  it('should create composite function', () => {
    const stops = {
      1: [0, 'blue'],
      16: [3, 'green'],
      20: [5, 'blue'],
    };
    const styleFunction = MapboxGL.StyleSheet.composite(
      stops,
      'rating',
      'mode',
    );

    verifyStyleSheetsMatch(
      {fillColor: styleFunction},
      {
        fillColor: {
          __MAPBOX_STYLE__: true,
          styletype: 'function',
          payload: {
            fn: 'composite',
            mode: 'mode',
            attributeName: 'rating',
            stops: [
              [
                {type: 'number', value: 1},
                {
                  styletype: 'color',
                  payload: {value: BLUE_INT, propertyValue: 0},
                },
              ],
              [
                {type: 'number', value: 16},
                {
                  styletype: 'color',
                  payload: {value: GREEN_INT, propertyValue: 3},
                },
              ],
              [
                {type: 'number', value: 20},
                {
                  styletype: 'color',
                  payload: {value: BLUE_INT, propertyValue: 5},
                },
              ],
            ],
          }, // payload
        }, // fillPattern
      },
    );
  });

  it('should create source object function', () => {
    const stops = {bergan: 'blue', hudson: 'green'};
    const styleFunction = MapboxGL.StyleSheet.source(stops, 'county', 'mode');

    verifyStyleSheetsMatch(
      {fillColor: styleFunction},
      {
        fillColor: {
          __MAPBOX_STYLE__: true,
          styletype: 'function',
          payload: {
            fn: 'source',
            mode: 'mode',
            attributeName: 'county',
            stops: [
              [
                {type: 'string', value: 'bergan'},
                {styletype: 'color', payload: {value: BLUE_INT}},
              ],
              [
                {type: 'string', value: 'hudson'},
                {styletype: 'color', payload: {value: GREEN_INT}},
              ],
            ],
          }, // payload
        }, // fillColor
      },
    );
  });

  it('should create source array function', () => {
    const stops = [['bergan', 'blue'], ['hudson', 'green']];
    const styleFunction = MapboxGL.StyleSheet.source(stops, 'county', 'mode');

    verifyStyleSheetsMatch(
      {fillColor: styleFunction},
      {
        fillColor: {
          __MAPBOX_STYLE__: true,
          styletype: 'function',
          payload: {
            fn: 'source',
            mode: 'mode',
            attributeName: 'county',
            stops: [
              [
                {type: 'string', value: 'bergan'},
                {styletype: 'color', payload: {value: BLUE_INT}},
              ],
              [
                {type: 'string', value: 'hudson'},
                {styletype: 'color', payload: {value: GREEN_INT}},
              ],
            ],
          },
        },
      },
    );
  });

  it('should create stylesheet with multiple constant style fields', () => {
    const styles = {
      fillOpacity: 0.84,
      fillPattern: 'test',
    };

    verifyStyleSheetsMatch(styles, {
      fillOpacity: {
        styletype: 'constant',
        payload: {value: 0.84},
        __MAPBOX_STYLE__: true,
      },
      fillPattern: {
        styletype: 'constant',
        payload: {value: 'test', image: true, shouldAddImage: false},
        __MAPBOX_STYLE__: true,
      },
    });
  });

  it('should create stylesheet with a mix of stlye functions and constants', () => {
    const styles = {
      fillColor: MapboxGL.StyleSheet.source(
        [['bergan', 'blue']],
        'county',
        'mode',
      ),
      fillOpacity: 0.84,
    };

    verifyStyleSheetsMatch(styles, {
      fillColor: {
        __MAPBOX_STYLE__: true,
        styletype: 'function',
        payload: {
          fn: 'source',
          mode: 'mode',
          attributeName: 'county',
          stops: [
            [
              {type: 'string', value: 'bergan'},
              {styletype: 'color', payload: {value: BLUE_INT}},
            ],
          ],
        },
      },
      fillOpacity: {
        styletype: 'constant',
        payload: {value: 0.84},
        __MAPBOX_STYLE__: true,
      },
    });
  });

  it('should create config nested one level deep', () => {
    const styles = {
      water: {
        fillColor: 'green',
        fillOpacity: 0.4,
      },
      building: {
        fillColor: 'blue',
        fillOpacity: 0.84,
      },
    };

    verifyStyleSheetsMatch(styles, {
      water: {
        fillColor: {
          styletype: 'color',
          payload: {value: GREEN_INT},
          __MAPBOX_STYLE__: true,
        },
        fillOpacity: {
          styletype: 'constant',
          payload: {value: 0.4},
          __MAPBOX_STYLE__: true,
        },
      },
      building: {
        fillColor: {
          styletype: 'color',
          payload: {value: BLUE_INT},
          __MAPBOX_STYLE__: true,
        },
        fillOpacity: {
          styletype: 'constant',
          payload: {value: 0.84},
          __MAPBOX_STYLE__: true,
        },
      },
    });
  });

  it('should not recreate a stylesheet if it is already a stylesheet', () => {
    const styleSheet = MapboxGL.StyleSheet.create({fillOpacity: 0.84});
    expect(styleSheet).toEqual(MapboxGL.StyleSheet.create(styleSheet));
  });

  it('should throw error for invalid property', () => {
    expect(() => {
      MapboxGL.StyleSheet.create({fakeProperty: 0.84});
    }).toThrow();

    expect(() => {
      MapboxGL.StyleSheet.create({fakeProperty: {idk: '?'}});
    }).toThrow();

    expect(() => {
      MapboxGL.StyleSheet.create({building: {fakeProperty: 0.84}});
    }).toThrow();
  });

  it('should throw error for passing in undefined or null', () => {
    expect(() => MapboxGL.StyleSheet.create()).toThrow();
    expect(() => MapboxGL.StyleSheet.create(null)).toThrow();
  });

  it('should create an identity source function', () => {
    expect(
      MapboxGL.StyleSheet.create({
        fillExtrusionHeight: MapboxGL.StyleSheet.identity('height'),
      }),
    ).toEqual({
      fillExtrusionHeight: {
        __MAPBOX_STYLE__: true,
        styletype: 'function',
        payload: {
          fn: 'source',
          stops: [],
          attributeName: 'height',
          mode: MapboxGL.InterpolationMode.Identity,
        },
      },
    });
  });

  it('should add overrides to special case styles', () => {
    expect(MapboxGL.StyleSheet.create({textOffset: [2, 2]})).toEqual({
      textOffset: {
        __MAPBOX_STYLE__: true,
        styletype: 'constant',
        payload: {
          value: [2, 2],
          iosType: 'vector',
        },
      },
    });

    expect(MapboxGL.StyleSheet.create({iconOffset: [2, 2]})).toEqual({
      iconOffset: {
        __MAPBOX_STYLE__: true,
        styletype: 'constant',
        payload: {
          value: [2, 2],
          iosType: 'vector',
        },
      },
    });
  });

  it('should resolve style value from enum', () => {
    expect(MapboxGL.StyleSheet.create({lineCap: 'round'})).toEqual({
      lineCap: {
        __MAPBOX_STYLE__: true,
        styletype: 'constant',
        payload: {
          value: MapboxGL.LineCap.Round,
        },
      },
    });
  });

  it('should not try to resolve style value when using enum', () => {
    expect(
      MapboxGL.StyleSheet.create({lineCap: MapboxGL.LineCap.Round}),
    ).toEqual({
      lineCap: {
        __MAPBOX_STYLE__: true,
        styletype: 'constant',
        payload: {
          value: MapboxGL.LineCap.Round,
        },
      },
    });
  });
});

function verifyStyleSheetsMatch(styles, expectedStyleSheet) {
  expect(MapboxGL.StyleSheet.create(styles)).toEqual(expectedStyleSheet);
}
