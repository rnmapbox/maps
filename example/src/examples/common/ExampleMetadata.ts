export type ExampleMetadata = {
  title: string;
  tags: string[];
  docs: string;
  disableSync?: boolean;
};

export type ExampleWithMetadata = React.ComponentType & {
  metadata: ExampleMetadata;
};
