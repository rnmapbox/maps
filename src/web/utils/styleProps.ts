import { layerStyleProps, styleObjectProps } from './webStyleMap';

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

export type StyleObject = 'light' | 'atmosphere' | 'terrain' | 'rain' | 'snow';

export function toGLStyleObject(
  object: StyleObject,
  style: { [key: string]: unknown } = {},
): { [key: string]: unknown } {
  const props = styleObjectProps[object] ?? {};
  const result: { [key: string]: unknown } = {};
  for (const [name, value] of Object.entries(style)) {
    if (value === undefined) {
      continue;
    }
    const isTransition = name.endsWith(transitionSuffix);
    const glName =
      props[isTransition ? name.slice(0, -transitionSuffix.length) : name];
    if (!glName) {
      console.warn(`@rnmapbox/maps: unknown ${object} style property ${name}`);
      continue;
    }
    result[isTransition ? `${glName}-transition` : glName] = value;
  }
  return result;
}
