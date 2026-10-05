import { layerStyleProps } from './webStyleMap';

export type GLStyle = {
  paint: { [key: string]: unknown };
  layout: { [key: string]: unknown };
};

const transitionSuffix = 'Transition';

export function toGLStyle(style: { [key: string]: unknown } = {}): GLStyle {
  const result: GLStyle = { paint: {}, layout: {} };
  for (const [name, value] of Object.entries(style)) {
    if (value === undefined) {
      continue;
    }
    const isTransition = name.endsWith(transitionSuffix);
    const prop =
      layerStyleProps[
        isTransition ? name.slice(0, -transitionSuffix.length) : name
      ];
    if (!prop) {
      console.warn(`@rnmapbox/maps: unknown layer style property ${name}`);
      continue;
    }
    if (isTransition) {
      result.paint[`${prop.name}-transition`] = value;
    } else {
      result[prop.kind][prop.name] = value;
    }
  }
  return result;
}

export function omitUndefined<T extends object>(object: T): T {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined),
  ) as T;
}
