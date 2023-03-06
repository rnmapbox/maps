/**
 * deprecatedClass: creates a subclass of the class, which prints deprecated warning when called
 */
export function deprecatedClass<C extends new (...args: any[]) => object>(
  origClass: C,
  deprecationMessage: string,
): C {
  const result = class extends origClass {
    constructor(...args: any[]) {
      console.log(`Deprecated: ${deprecationMessage}`);
      super(...args);
    }
  };
  return result;
}

/**
 * Copy properties from origObject to newObject, but only those which not exists in newObject.
 * Calls onDeprecatedCalled callback in case a copied property is invoked.
 */
export function copyPropertiesAsDeprecated<
  DeprecatedType extends object, // Record<string, unknown>,
  WithDeprecatedType extends Record<string, unknown>,
>(
  origObject: DeprecatedType,
  newObject: WithDeprecatedType,
  onDeprecatedCalled: (key: string) => void,
  accessors: { [key: string]: (value: unknown) => unknown } = {},
): WithDeprecatedType {
  const result = newObject;
  for (const [key, value] of Object.entries(origObject)) {
    if (!newObject[key]) {
      Object.defineProperty(result, key, {
        get() {
          onDeprecatedCalled(key);
          return accessors[key] ? accessors[key](value) : value;
        },
      });
    }
  }
  return result;
}
