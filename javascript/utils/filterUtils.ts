export function getFilter(filter: any) {
  console.log('>>>>>> ');
  if (!Array.isArray(filter) || filter.length === 0) {
    return [];
  }

  return filter;
}
