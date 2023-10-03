const { mkdir, copyFile } = require('fs/promises');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { device } = require('detox');

const rootDir = '..';

const docsRoot = '/Users/boga/Work/OSS/RNMBGL/map-docs/';
const exampleDocsRoot = path.join(docsRoot, 'docs/examples');

const examples = JSON.parse(
  fs.readFileSync(`${rootDir}/docs/examples.json`, 'utf8'),
);
console.log('Examples::', examples);

async function setSampleLocation() {
  const latitude = 40.723279;
  const longitude = -73.971895;
  execSync(`xcrun simctl location ${device.id} set ${latitude},${longitude}`);
}

async function saveImage(basePath, suffix = null) {
  const imagePath = await device.takeScreenshot(`example-${suffix || ''}`);
  // const destDir = `${rootDir}/docs/screenshots`;
  // const destPath = `${destDir}/${imageName}.png`;
  const destDir = path.dirname(basePath);
  await mkdir(destDir, { recursive: true });
  var fullDestPath = basePath;
  if (suffix != null) {
    fullDestPath = `${basePath}-${suffix}.png`;
  } else {
    fullDestPath = `${basePath}.png`;
  }
  await copyFile(imagePath, fullDestPath);
  await execSync(`sips -Z 640 ${fullDestPath}`);
}

async function wait(ms) {
  try {
    await waitFor(element(by.id('no-such-view')))
      .toBeVisible()
      .withTimeout(ms);
  } catch (e) {}
}

describe('Example screenshots', () => {
  beforeAll(async () => {
    await device.launchApp({ permissions: { location: 'always' } });
  });
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  Object.keys(examples).forEach((examplegroup) => {
    const group = examplegroup.replaceAll('_', ' ');
    describe(group, () => {
      examples[examplegroup].forEach((example) => {
        it(example.name, async () => {
          await setSampleLocation();

          await expect(element(by.text(group))).toBeVisible();
          await element(by.text(group)).tap();

          await expect(element(by.text(example.title))).toBeVisible();
          await element(by.text(example.title)).tap();
          console.log(' => before wait');
          await wait(1000);
          console.log('=> after wait');
          console.log('[***] x', example, JSON.stringify(example));
          const dirs = example.fullPath.split('/').slice(4);
          const nameWithExt = dirs.pop();

          const groupDir = path.join(exampleDocsRoot, ...dirs);
          fs.mkdirSync(groupDir, { recursive: true });
          const basename = nameWithExt.split('.').slice(0, -1).join('.');

          const destPath = path.join(groupDir, `${basename}.md`);

          const destImgPath = path.join(groupDir, `${basename}.png`);

          fs.writeFileSync(
            destPath,
            `
${example.docs}

![${example.title}](./${basename}.png)

          `,
          );

          await saveImage(path.join(groupDir, basename));
        });
      });
    });
  });
});
