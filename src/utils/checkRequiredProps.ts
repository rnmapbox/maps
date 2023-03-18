type RequiredKeys<T> = {
  [k in keyof T]-?: undefined extends T[k] ? never : k;
}[keyof T];

export default function checkRequiredProps<
  Props extends { [key: string]: unknown },
>(tag: string, props: Props, required: RequiredKeys<Props>[]) {
  for (const key of required) {
    if (props[key] === undefined) {
      console.error(
        `Error: ${tag} property: ${
          key as string
        } is required but it was missing.`,
      );
    }
  }
}
