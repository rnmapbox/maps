export function getFilter(filter: string[] | unknown) {
  if (!Array.isArray(filter) || filter.length === 0) {
    return [];
  }

  return filter;
}
