export type ExampleMetadata = {
  title: string;
  tags: string[];
  docs: string;
  disableSync?: boolean;
  waitForMapIdle?: boolean;
  excludeFromPercy?: boolean;
  webSupported?: boolean;
  /** Whether the docs show an "Edit in Snack" link; defaults to `webSupported`. */
  snackSupported?: boolean;
};

export type ExampleWithMetadata = React.ComponentType & {
  metadata: ExampleMetadata;
};
