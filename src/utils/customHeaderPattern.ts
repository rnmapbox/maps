const LEADING_INLINE_FLAGS = /^\(\?[a-zA-Z]*(?:-[a-zA-Z]+)?\)/;
const LEADING_ANCHOR = /^(?:\^|\\A)/;
const LEADING_WILDCARD = /^(?:\((?:\?:|\?<\w+>)?)*\.[*+?{]/;

/**
 * Whether a custom header `urlRegexp` is pinned to the start of the URL, so it
 * can't also match look-alike hosts such as `tiles.example.com.evil.com`.
 */
export function isAnchoredUrlPattern(pattern: string): boolean {
  const withoutFlags = pattern.replace(LEADING_INLINE_FLAGS, '');
  const anchor = withoutFlags.match(LEADING_ANCHOR);
  if (!anchor) {
    return false;
  }
  return !LEADING_WILDCARD.test(withoutFlags.slice(anchor[0].length));
}
