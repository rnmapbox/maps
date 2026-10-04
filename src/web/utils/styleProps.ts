const handWrittenLayoutProps = new Set([
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

export function toGLStyle(style: { [key: string]: unknown } = {}): GLStyle {
  const result: GLStyle = { paint: {}, layout: {} };
  for (const [name, value] of Object.entries(style)) {
    if (value === undefined) {
      continue;
    }
    if (name.endsWith('Transition')) {
      const base = name.slice(0, -'Transition'.length);
      result.paint[`${kebabCase(base)}-transition`] = value;
    } else if (handWrittenLayoutProps.has(name)) {
      result.layout[kebabCase(name)] = value;
    } else {
      result.paint[kebabCase(name)] = value;
    }
  }
  return result;
}

export function omitUndefined<T extends object>(object: T): T {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined),
  ) as T;
}
