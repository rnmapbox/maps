import path from 'path';
import * as url from 'url';

import DocJSONBuilder from './autogenHelpers/DocJSONBuilder.mjs';
import { getLayers } from './autogenHelpers/generateCodeWithEjs.mjs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

async function generate() {
  const docsRoot = path.join(__dirname, '..', 'docs');
  const docsJsonPath = path.join(docsRoot, 'docs.json');

  let layers = getLayers();
  const docBuilder = new DocJSONBuilder(layers);
  await docBuilder.generate(docsJsonPath);
}

generate();
