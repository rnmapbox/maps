/**
 * @file Generate documentation for the map components. Reads docs/docs.json and generates <docRepo>/docs/components
 */
import path from 'path';

import docconfig from './autogenHelpers/docconfig.js';
const { docSiteRootPath, docsJSONPath } = docconfig;
// import { docSiteRootPath, docsJSONPath } from './autogenHelpers/docconfig.js';
import MarkdownBuilder from './autogenHelpers/MarkdownBuilder.mjs';

const markdownBuilder = new MarkdownBuilder();
await markdownBuilder.generate(
  docsJSONPath,
  path.join(docSiteRootPath, 'docs', 'components'),
  {
    docosaurus: true,
  },
);
