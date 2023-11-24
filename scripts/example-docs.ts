/**
 * @file Generates markdown for each example. Reads docs/examples.json, <docRepo>/examples-screenshots/screenshots.json and generates <docRepo>/docs/examples/
 */

import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import Os from 'os';

// eslint-disable-next-line import/order
import {
  docSiteRootPath,
  screenshotsJSONPath,
  examplesJSONPath,
  mapsRootPath,
} from './autogenHelpers/docconfig.js';

const endOfExampleMarker = '/* end-example-doc */';

import type { Examples, Example } from './autogenHelpers/examplesJsonSchema';
import type { Screenshots } from './autogenHelpers/screenshotsJsonSchema';

const examples: Examples = JSON.parse(
  fs.readFileSync(examplesJSONPath, 'utf8'),
);
const screenshots: Screenshots = JSON.parse(
  fs.readFileSync(screenshotsJSONPath, 'utf8'),
);

const destdir = path.join(docSiteRootPath, 'docs/examples');

examples.forEach(({ groupName, examples, metadata }) => {
  const destGroupDir = path.join(destdir, groupName);
  examples.forEach(({ metadata, fullPath, relPath, name }) => {
    if (!metadata) {
      return;
    }

    const { title, tags, docs } = metadata;

    let jscode: string = fs.readFileSync(
      path.join(mapsRootPath, fullPath),
      'utf8',
    );

    const endOfMarkerIndex = jscode.indexOf(endOfExampleMarker);
    if (endOfMarkerIndex > 0) {
      jscode = jscode.slice(0, endOfMarkerIndex);
    }

    const mdPath = path.join(destGroupDir, `${name}.md`);

    const basename = path.basename(name);

    if (screenshots[groupName] == null) {
      console.log(` => error: "${groupName}" is not in screenshots.json`);
    }
    const exampleScreenshots = (screenshots[groupName] || {})[name];

    const screenshotImages = (exampleScreenshots || {}).images || [];
    fs.mkdirSync(destGroupDir, { recursive: true });
    const images: { title: string; filename: string }[] = screenshotImages.map(
      (imagePath) => {
        const imageName = path.basename(imagePath);
        const imageDestPath = path.join(destGroupDir, imageName);
        fs.copyFileSync(path.join(docSiteRootPath, imagePath), imageDestPath);
        if (Os.platform() === 'darwin') {
          execSync(`sips -Z 640 ${imageDestPath}`);
        } else {
          execSync(
            `convert -resize x640 -define png:exclude-chunks=date,time ${imageDestPath} ${imageDestPath}`,
          );
        }

        return { title: imageName, filename: imageName };
      },
    );

    const md = `---
title: ${title}
tags: [${tags.join(', ')}]
custom_props:
  example_rel_path: ${relPath}
custom_edit_url: https://github.com/rnmapbox/maps/tree/master/example/src/examples/${relPath}
---
${docs}

\`\`\`jsx
${jscode}
\`\`\`

${images.map((image) => `![${image.title}](./${image.filename})`).join('\n')}}

`;
    fs.writeFileSync(mdPath, md);
  });
});
