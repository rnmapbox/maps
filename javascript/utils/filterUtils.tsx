export function getFilter(filter: string[] | unknown): string[] {
  if (!Array.isArray(filter) || filter.length === 0) {
    return [];
  }

  return filter;
}
