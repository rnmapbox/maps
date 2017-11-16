import { isBoolean, isNumber, isString } from './index';

export function getFilter (filter) {
  if (!Array.isArray(filter) || filter.length == 0) {
    return [];
  }

  let flattenedFilter = [];
  for (let i = 0; i < filter.length; i++) {
    const item = filter[i];

    if (Array.isArray(item)) {
      flattenedFilter = flattenedFilter.concat(item);
    } else {
      flattenedFilter.push(item);
    }
  }

  let filterItems = [];
  for (let item of flattenedFilter) {
    const filterItem = new FilterItem(item);
    filterItems.push(filterItem.toJSON());
  }

  return filterItems;
}

export class FilterItem {
  constructor (value) {
    this.value = value;
  }

  getType () {
    if (isBoolean(this.value)) {
      return 'boolean';
    } else if (isNumber(this.value)) {
      return 'number';
    } else if (isString(this.value)) {
      return 'string';
    } else {
      throw new Error('FilterItem must be a primitive');
    }
  }

  toJSON () {
    return {
      type: this.getType(),
      value: this.value,
    };
  }
}
