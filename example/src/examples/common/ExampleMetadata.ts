export type ExampleMetadata = {
  title: string;
  tags: string[];
  docs: string;
  disableSync?: boolean;
  waitForMapIdle?: boolean;
  excludeFromPercy?: boolean;
  webSupported?: boolean;
};

export type ExampleWithMetadata = React.ComponentType & {
  metadata: ExampleMetadata;
};
