// Hand-written for now; should be generated from style-spec/v8.json like the
// native style setters.
const layoutProps = new Set([
  'visibility',
  'circleSortKey',
  'lineCap',
  'lineJoin',
  'lineMiterLimit',
  'lineRoundLimit',
  'lineSortKey',
]);

function kebabCase(name: string) {
  return name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

export type GLStyle = {
  paint: { [key: string]: unknown };
  layout: { [key: string]: unknown };
};

/**
 * Splits rnmapbox camelCase layer style props into mapbox-gl paint and layout
 * properties. Values (constants, expressions, colors, transitions) are
 * passed through unchanged.
 */
export function toGLStyle(style: { [key: string]: unknown } = {}): GLStyle {
  const result: GLStyle = { paint: {}, layout: {} };
  for (const [name, value] of Object.entries(style)) {
    if (value === undefined) {
      continue;
    }
    if (name.endsWith('Transition')) {
      const base = name.slice(0, -'Transition'.length);
      result.paint[`${kebabCase(base)}-transition`] = value;
    } else if (layoutProps.has(name)) {
      result.layout[kebabCase(name)] = value;
    } else {
      result.paint[kebabCase(name)] = value;
    }
  }
  return result;
}

/** mapbox-gl's style validation rejects keys that are present but undefined. */
export function omitUndefined<T extends object>(object: T): T {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined),
  ) as T;
}
