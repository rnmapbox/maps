import BridgeValue from './BridgeValue';
import { Platform } from 'react-native';

export function getFilter(filter) {
  if (!Array.isArray(filter) || filter.length === 0) {
    return [];
  }

  const filterItems = [];

  if (Platform.OS === 'ios') {
    let flattenedFilter = [];
    for (let i = 0; i < filter.length; i++) {
      const item = filter[i];

      if (Array.isArray(item)) {
        flattenedFilter = flattenedFilter.concat(item);
      } else {
        flattenedFilter.push(item);
      }
    }

    for (const item of flattenedFilter) {
      const filterItem = new BridgeValue(item);
      filterItems.push(filterItem.toJSON());
    }
  } else {
    for (const item of filter) {
      const filterItem = new BridgeValue(item);
      filterItems.push(filterItem.toJSON());
    }
  }

  return filterItems;
}
