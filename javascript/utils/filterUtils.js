export function getFilter(filter) {
  if (!Array.isArray(filter) || filter.length === 0) {
    return [];
  }

  return filter;
}
