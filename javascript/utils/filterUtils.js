import BridgeValue from './BridgeValue';

export function getFilter(filter) {
  if (!Array.isArray(filter) || filter.length === 0) {
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

  const filterItems = [];
  for (const item of flattenedFilter) {
    const filterItem = new BridgeValue(item);
    filterItems.push(filterItem.toJSON());
  }

  return filterItems;
}
