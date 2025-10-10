/* global element, by, waitFor, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach */

/**
 * @file process the docs/examples.json file and take screenshots of each example and outputs it to <docRoot>/example-screenshots and <docRoot>/example-screenshots/screenshots.json
 */

const { mkdir, copyFile } = require('fs/promises');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { device } = require('detox');

const shouldRestartAppBetweenTests = true;

const {
  examplesJSONPath,
  docScreenshotsPath,
  screenshotsJSONPath,
  docSiteRootPath,
} = require('../../scripts/autogenHelpers/docconfig.js');

/**
 * @type {import('../../scripts/autogenHelpers/examplesJsonSchema.ts').Examples}
 */
let examples = JSON.parse(fs.readFileSync(examplesJSONPath, 'utf8'));

if (false) {
  examples = [
    {
      groupName: 'Map',
      metadata: {
        title: 'Map',
      },
      examples: [
        {
          metadata: {
            title: 'Source Layer Visibility',
            tags: ['MapView#setSoruceVisibility'],
            docs: '\nChanges visibility of layers using a source in the map\n',
          },
          fullPath: 'example/src/examples/Map/SourceLayerVisibility.js',
          relPath: 'Map/SourceLayerVisibility.js',
          name: 'SourceLayerVisibility',
        },
      ],
    },
    {
      groupName: 'CacheOffline',
      metadata: {
        title: 'Cache / Offline',
      },
      examples: [
        {
          metadata: {
            title: 'CacheManagement',
            tags: [
              'Cache',
              'Cache Management',
              'Offline Manager',
              'Offline Packs',
              'Validate Cache',
              'Invalidate Cache',
              'Get Cache Size',
              'Set Max Cache Size',
            ],
            docs: '\nManages map cache.\n\nUses the offline manager to manage the cache and the local storage in general. Shows how to invalidate cache to remove outdated tiles, how to clear the entire local storage from tiles and offline packs and to visualize the local storage usage amount.\n',
          },
          fullPath: 'example/src/examples/CacheOffline/CacheManagement.tsx',
          relPath: 'CacheOffline/CacheManagement.tsx',
          name: 'CacheManagement',
        },
      ],
    },
  ];
}

async function setSampleLocation() {
  const latitude = 40.723279;
  const longitude = -73.971895;
  execSync(`xcrun simctl location ${device.id} set ${latitude},${longitude}`);
}

async function saveImage(basePath, suffix = null) {
  const imagePath = await device.takeScreenshot(`example-${suffix || ''}`);
  const destDir = path.dirname(basePath);
  await mkdir(destDir, { recursive: true });
  var fullDestPath = basePath;
  if (suffix != null) {
    fullDestPath = `${basePath}-${suffix}.png`;
  } else {
    fullDestPath = `${basePath}.png`;
  }
  await copyFile(imagePath, fullDestPath);
  return fullDestPath;
}

async function wait(ms) {
  try {
    await waitFor(element(by.id('no-such-view')))
      .toBeVisible()
      .withTimeout(ms);
  } catch (_e) {
    console.log('e', _e);
  }
}

/**
  @typedef {import('../../scripts/autogenHelpers/screenshotsJsonSchema.ts').Screenshots} Screenshots
  @typedef {import('../../scripts/autogenHelpers/screenshotsJsonSchema.ts').ExampleGroupScreenshots} ExampleGroupScreenshots
  @typedef {import('../../scripts/autogenHelpers/examplesJsonSchema.ts').Example} Example
 */

class ExampleScreenshots {
  /**
   * @param {{testName: string; groupName: string}} example
   * @param {Screenshots} screenshots
   */
  constructor(example, screenshots) {
    /** @type {{testName: string, groupName: string}} */
    this.example = example;

    /** @type {Screenshots} */
    this.screenshots = screenshots;

    /** @type string[] */
    this.dirs = [example.groupName];

    /** @type string */
    this.basename = example.testName;

    var screenshotsDict = screenshots;
    screenshotsDict[example.groupName] =
      screenshotsDict[example.groupName] || {};
    /** @type ExampleGroupScreenshots */
    this.screenshotsDict = screenshotsDict[example.groupName];
  }
  async screenshot(suffix = null) {
    const { dirs, basename, screenshotsDict } = this;

    const groupDir = path.join(docScreenshotsPath, ...dirs);
    fs.mkdirSync(groupDir, { recursive: true });

    if (!screenshotsDict[basename]) {
      screenshotsDict[basename] = { images: [] };
    }

    const imgPath = await saveImage(path.join(groupDir, basename), suffix);
    screenshotsDict[basename].images.push(
      path.relative(docSiteRootPath, path.resolve(imgPath)),
    );
  }
}

if (['true', 1, '1'].includes(process.env.SKIP_TESTS_NO_METAL)) {
  console.debug(
    '### Skipping tests as Metal is not available in this environment',
  );
  describe('dump-example-screenshots', () => {
    it('disabled on CI (no metal support)', () => {
      expect(true).toBe(true);
    });
  });
} else {
  describe('Example screenshots', () => {
    beforeAll(async () => {
      await device.launchApp({ permissions: { location: 'always' } });
    });
    beforeEach(async () => {
      if (shouldRestartAppBetweenTests) {
        await device.launchApp({ permissions: { location: 'always' } });
      }
      await device.reloadReactNative();
    });
    afterEach(async () => {
      if (shouldRestartAppBetweenTests) {
        await device.terminateApp();
      }
    });

    /** @type Screenshots */
    const screenshots = {};

    examples.forEach(
      ({ groupName, metadata: groupMetadata, examples: examplesInGroup }) => {
        describe(`${groupName}`, () => {
          examplesInGroup.forEach(({ metadata, fullPath: _fullPath, name }) => {
            if (metadata) {
              it(`${name}`, async () => {
                await device.setStatusBar({
                  time: '11:34',
                  batteryLevel: 1,
                  batteryState: 'charged',
                  dataNetwork: 'wifi',
                  wifiMode: 'active',
                  wifiBars: '3',
                  cellularMode: 'searching',
                });
                await setSampleLocation();

                await expect(
                  element(by.text(groupMetadata.title)),
                ).toBeVisible();
                await element(by.text(groupMetadata.title)).tap();

                await waitFor(element(by.text(metadata.title)))
                  .toBeVisible()
                  .whileElement(by.id('example-list'))
                  .scroll(50, 'down');
                await element(by.text(metadata.title)).tap();

                let shots = new ExampleScreenshots(
                  { testName: name, groupName },
                  screenshots,
                );

                await wait(1000);

                await shots.screenshot();
              });
            }
          });
        });
      },
    );

    afterAll(async () => {
      console.log('Writing screenshots.json', screenshotsJSONPath);
      fs.writeFileSync(screenshotsJSONPath, JSON.stringify(screenshots));
    });
  });
}
