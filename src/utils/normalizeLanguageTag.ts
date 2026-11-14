const ASCII_LETTERS = /^[A-Za-z]+$/;

/**
 * Optional helper for `Mapbox.setLanguage`: rewrites a language tag into the form the Mapbox tile API understands.
 * `setLanguage` itself passes tags through unchanged, so use this only when you want the rewrite.
 *
 * - Applies RFC 5646 canonical casing (`EN` -> `en`, `sr-latn-rs` -> `sr-Latn-RS`), trims whitespace and turns `_` into `-`.
 *   The tile API rejects or ignores other casing, e.g. `EN` fails and `zh-hant` is treated as plain `zh`.
 * - Chinese gets the script the tile API localizes into: an explicit `Hans`/`Hant` script is kept, otherwise `TW`, `HK`
 *   and `MO` map to `zh-Hant` and everything else to `zh-Hans` (https://github.com/mapbox/mapbox-gl-js/issues/13510).
 *
 * @param tag - BCP-47 language tag, e.g. from the device locale
 * @returns the normalized tag, or an empty string for a blank tag
 */
export function normalizeLanguageTag(tag: string): string {
  let inExtension = false;
  const parts = tag
    .trim()
    .replace(/_/g, '-')
    .split('-')
    .filter((part) => part.length > 0)
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index === 0 || inExtension) {
        return lower;
      }
      if (part.length === 1) {
        inExtension = true;
        return lower;
      }
      const letters = ASCII_LETTERS.test(part);
      if (letters && part.length === 4) {
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }
      if (letters && part.length === 2) {
        return part.toUpperCase();
      }
      return lower;
    });

  if (parts[0] !== 'zh') {
    return parts.join('-');
  }
  const script = parts
    .slice(1)
    .find((part) => part === 'Hans' || part === 'Hant');
  if (script) {
    return `zh-${script}`;
  }
  return parts.some((part) => ['TW', 'HK', 'MO'].includes(part))
    ? 'zh-Hant'
    : 'zh-Hans';
}
