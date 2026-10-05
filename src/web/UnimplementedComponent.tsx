const warned = new Set<string>();

export function warnUnimplemented(name: string) {
  if (!warned.has(name)) {
    warned.add(name);
    console.warn(`@rnmapbox/maps: ${name} is not supported on web yet`);
  }
}

/**
 * Placeholder for components that have no web implementation yet. Renders
 * nothing and warns once, so a screen using it still shows the map instead
 * of crashing.
 */
const UnimplementedComponent = (name: string) => {
  const Unimplemented = (_props: object) => {
    warnUnimplemented(name);
    return null;
  };
  Unimplemented.displayName = `Unimplemented(${name})`;
  return Unimplemented;
};

export default UnimplementedComponent;
