/**
 * Copy properties from origObject to newObject, which not exists in newObject,
 * calls onDeprecatedCalled callback in case a copied property is invoked.
 */

export function copyPropertiesAsDeprecated(
  origObject,
  newObject,
  onDeprecatedCalled,
  accessors = {},
) {
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
