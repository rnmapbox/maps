const { mkdir, copyFile } = require('fs/promises');
const fs = require('fs');
const { execSync } = require('child_process');

const { device } = require('detox');

const rootDir = '..';

const examples = JSON.parse(
  fs.readFileSync(`${rootDir}/docs/examples.json`, 'utf8'),
);
console.log('Examples::', examples);

async function setSampleLocation() {
  const latitude = 40.723279;
  const longitude = -73.971895;
  execSync(`xcrun simctl location ${device.id} set ${latitude},${longitude}`);
}

async function saveImage(imageName) {
  const imagePath = await device.takeScreenshot(imageName);
  const destDir = `${rootDir}/docs/screenshots`;
  const destPath = `${destDir}/${imageName}.png`;
  await mkdir(destDir, { recursive: true });
  await copyFile(imagePath, destPath);
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
          await saveImage(example.title);
        });
      });
    });
  });
});
