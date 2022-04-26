import { getFilter } from '../../javascript/utils/filterUtils';
import BridgeValue from '../../javascript/utils/BridgeValue';

const FilterItem = BridgeValue;

describe('filterUtils', () => {
  it('should parse flat filter', () => {
    const filter = ['==', 'rating', 10];
    expect(getFilter(filter)).toEqual(['==', 'rating', 10]);
  });

  it('should parse filter with array', () => {
    const filter = [
      'all',
      ['==', 'class', 'street_limited'],
      ['>=', 'admin_level', 3],
      ['==', 'enabled', true],
    ];
    expect(getFilter(filter)).toEqual([
      'all',
      ['==', 'class', 'street_limited'],
      ['>=', 'admin_level', 3],
      ['==', 'enabled', true],
    ]);
  });

  it('should return empty array if filter type passed in is not an array', () => {
    expect(getFilter()).toEqual([]);
    expect(getFilter(null)).toEqual([]);
    expect(getFilter({})).toEqual([]);
  });

  it('should create boolean filter item', () => {
    verifyFilterItem(new FilterItem(true), 'boolean', true);
    verifyFilterItem(new FilterItem(false), 'boolean', false);
  });

  it('should create number filter item', () => {
    verifyFilterItem(new FilterItem(0), 'number', 0);
    verifyFilterItem(new FilterItem(1), 'number', 1);
    verifyFilterItem(new FilterItem(100), 'number', 100);
  });

  it('should create string filter item', () => {
    verifyFilterItem(new FilterItem('0'), 'string', '0');
    verifyFilterItem(new FilterItem('test'), 'string', 'test');
    verifyFilterItem(new FilterItem('true'), 'string', 'true');
    verifyFilterItem(new FilterItem('false'), 'string', 'false');
  });

  it('should throw error if the filter item is not a primitive', () => {
    verifyErrorFilterItem(undefined);
    verifyErrorFilterItem(null);
  });
});

function verifyFilterItem(filterItem, expectedType, expectedValue) {
  expect(filterItem.toJSON()).toEqual({
    type: expectedType,
    value: expectedValue,
  });
}

function verifyErrorFilterItem(value) {
  const filterItem = new FilterItem(value);
  expect(() => filterItem.toJSON()).toThrow();
}
