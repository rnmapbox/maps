export type ExampleMetadata = {
  title: string;
  tags: string[];
  docs: string;
};

export type ExampleWithMetadata = React.ComponentType & {
  metadata: ExampleMetadata;
};
