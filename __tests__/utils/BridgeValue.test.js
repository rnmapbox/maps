import BridgeValue from '../../javascript/utils/BridgeValue';

describe('BridgeValue', () => {
  it('should convert to array of numbers', () => {
    const bridgeValue = new BridgeValue([1, 2]);
    expect(bridgeValue.toJSON()).toEqual({
      type: 'array',
      value: [
        { type: 'number', value: 1 },
        { type: 'number', value: 2 },
      ],
    });
  });

  it('should convert to array of string', () => {
    const bridgeValue = new BridgeValue(['hello', 'world']);
    expect(bridgeValue.toJSON()).toEqual({
      type: 'array',
      value: [
        { type: 'string', value: 'hello' },
        { type: 'string', value: 'world' },
      ],
    });
  });

  it('should convert to array of booleans', () => {
    const bridgeValue = new BridgeValue([true, false]);
    expect(bridgeValue.toJSON()).toEqual({
      type: 'array',
      value: [
        { type: 'boolean', value: true },
        { type: 'boolean', value: false },
      ],
    });
  });

  it('should convert to array of hashmaps', () => {
    const bridgeValue = new BridgeValue([
      { prop1: 1 },
      { prop2: 'value' },
      { prop3: false },
    ]);
    expect(bridgeValue.toJSON()).toEqual({
      type: 'array',
      value: [
        {
          type: 'hashmap',
          value: [
            [
              { type: 'string', value: 'prop1' },
              { type: 'number', value: 1 },
            ],
          ],
        },
        {
          type: 'hashmap',
          value: [
            [
              { type: 'string', value: 'prop2' },
              { type: 'string', value: 'value' },
            ],
          ],
        },
        {
          type: 'hashmap',
          value: [
            [
              { type: 'string', value: 'prop3' },
              { type: 'boolean', value: false },
            ],
          ],
        },
      ],
    });
  });

  it('should convert complex expression', () => {
    const bridgeValue = new BridgeValue([
      'all',
      ['foo', 'bar'],
      ['baz', 'bao'],
    ]);
    expect(bridgeValue.toJSON()).toEqual({
      type: 'array',
      value: [
        {
          type: 'string',
          value: 'all',
        },
        {
          type: 'array',
          value: [
            { type: 'string', value: 'foo' },
            { type: 'string', value: 'bar' },
          ],
        },
        {
          type: 'array',
          value: [
            { type: 'string', value: 'baz' },
            { type: 'string', value: 'bao' },
          ],
        },
      ],
    });
  });

  it('should convert to array of arrays', () => {
    const bridgeValue = new BridgeValue([
      [1],
      ['value'],
      [true],
      [{ prop: 'value' }],
    ]);
    expect(bridgeValue.toJSON()).toEqual({
      type: 'array',
      value: [
        { type: 'array', value: [{ type: 'number', value: 1 }] },
        { type: 'array', value: [{ type: 'string', value: 'value' }] },
        { type: 'array', value: [{ type: 'boolean', value: true }] },
        {
          type: 'array',
          value: [
            {
              type: 'hashmap',
              value: [
                [
                  { type: 'string', value: 'prop' },
                  { type: 'string', value: 'value' },
                ],
              ],
            },
          ],
        },
      ],
    });
  });

  it('should convert to number', () => {
    const bridgeValue = new BridgeValue(1);
    expect(bridgeValue.toJSON()).toEqual({ type: 'number', value: 1 });
  });

  it('should convert to string', () => {
    const bridgeValue = new BridgeValue('value');
    expect(bridgeValue.toJSON()).toEqual({ type: 'string', value: 'value' });
  });

  it('should convert to boolean', () => {
    const bridgeValue = new BridgeValue(true);
    expect(bridgeValue.toJSON()).toEqual({ type: 'boolean', value: true });
  });

  it('should convert to hashmap', () => {
    const bridgeValue = new BridgeValue({ prop1: 'value1', prop2: 2 });
    expect(bridgeValue.toJSON()).toEqual({
      type: 'hashmap',
      value: [
        [
          { type: 'string', value: 'prop1' },
          { type: 'string', value: 'value1' },
        ],
        [
          { type: 'string', value: 'prop2' },
          { type: 'number', value: 2 },
        ],
      ],
    });
  });

  it('should throw error', () => {});
});
