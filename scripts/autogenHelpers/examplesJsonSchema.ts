import { ExampleMetadata } from '../../example/src/examples/common/ExampleMetadata';

export type { ExampleMetadata } from '../../example/src/examples/common/ExampleMetadata';

export type ExampleGroupMetadata = {
  title: string;
};

export type Example = {
  name: string;
  metadata: ExampleMetadata;
  fullPath: string;
  relPath: string;
};

export type ExampleGroup = {
  groupName: string;
  metadata: ExampleGroupMetadata;
  examples: Example[];
};

export type Examples = ExampleGroup[];
