export type ExampleScreenshots = {
  images: string[];
};

export type ExampleGroupScreenshots = {
  [exampleName: string]: ExampleScreenshots;
};

export type Screenshots = {
  [groupName: string]: ExampleGroupScreenshots;
};
