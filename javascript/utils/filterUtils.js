import BridgeValue from './BridgeValue';

export function getFilter(filter) {
  if (!Array.isArray(filter) || filter.length === 0) {
    return [];
  }

  return filter;

/*
  const filterItems = [];
  for (const item of filter) {
    const filterItem = new BridgeValue(item);
    filterItems.push(filterItem.toJSON());
  }
  return filterItems;
*/
}
