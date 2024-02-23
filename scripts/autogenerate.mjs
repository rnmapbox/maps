import path from 'path';
import { execSync } from 'child_process';
import * as url from 'url';

import DocJSONBuilder from './autogenHelpers/DocJSONBuilder.mjs';
import MarkdownBuilder from './autogenHelpers/MarkdownBuilder.mjs';
import generateCodeWithEjs, {
  getLayers,
} from './autogenHelpers/generateCodeWithEjs.mjs';
import { codepartReplace } from './codepart-replace.mjs';
import {
  generateCodegenJavaOldArch,
  javaOldArchDir,
} from './codegen-old-arch.js';

// process style spec json into json

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

async function generate() {
  let layers = getLayers();
  let outputPaths = generateCodeWithEjs(layers);

  // autogenerate expo plugin
  execSync('yarn build:plugin', { stdio: 'inherit' });
  outputPaths.push('plugin/build');

  // autogenerate examples.json
  execSync('yarn build:examples.json', { stdio: 'inherit' });
  outputPaths.push('docs/examples.json');

  // codepart generation
  outputPaths.push(
    ...codepartReplace(
      path.join(__dirname, '..', 'src/components'),
      path.join(__dirname, '..', 'src/components/codeparts/'),
      ['.tsx'],
    ),
  );

  outputPaths.push(
    ...codepartReplace(
      path.join(__dirname, '..', 'src/specs'),
      path.join(__dirname, '..', 'src/specs/codeparts/'),
      ['.ts'],
    ),
  );

  outputPaths.push(
    ...codepartReplace(
      path.join(
        __dirname,
        '..',
        'android/src/main/java/com/rnmapbox/rnmbx/components/styles/layers',
      ),
      path.join(
        __dirname,
        '..',
        'android/src/main/java/com/rnmapbox/rnmbx/components/styles/layers/codeparts/',
      ),
      ['.kt'],
    ),
  );

  outputPaths.push(
    ...codepartReplace(
      path.join(
        __dirname,
        '..',
        'ios/RNMBX',
      ),
      path.join(
        __dirname,
        '..',
        'ios/RNMBX/codeparts/',
      ),
      ['.swift'],
    ),
  );

  // autogenerate docs
  const docsRoot = path.join(__dirname, '..', 'docs');
  const docsJsonPath = path.join(docsRoot, 'docs.json');

  const docBuilder = new DocJSONBuilder(layers);
  const markdownBuilder = new MarkdownBuilder();
  await docBuilder.generate(docsJsonPath);
  await markdownBuilder.generate(docsJsonPath, docsRoot);

  // rn new arch codegen
  await generateCodegenJavaOldArch();
  outputPaths.push(javaOldArchDir());

  // Check if any generated files changed
  try {
    execSync(`git diff --exit-code docs/ ${outputPaths.join(' ')}`);
  } catch (error) {
    console.error(
      '\n\nThere are unstaged changes in the generated code. ' +
        'Please add them to your commit.\n' +
        'If you would really like to exlude them, run "git commit -n" to skip.\n\n',
    );
    const showDiff = true;
    if (showDiff) {
      console.log(`=> git diff docs/ ${outputPaths.join(' ')}`);
      execSync(`git diff docs/ ${outputPaths.join(' ')} | head -n 20`, {
        stdio: 'inherit',
      });
    }
    process.exit(1);
  }
}

generate();
