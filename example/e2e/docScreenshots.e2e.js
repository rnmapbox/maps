/* global element, by, waitFor, describe, it, beforeAll, afterAll, beforeEach, afterEach */

/**
 * @file process the docs/examples.json file and take screenshots of each example and outputs it to <docRoot>/example-screenshots and <docRoot>/example-screenshots/screenshots.json
 */

const { mkdir, copyFile } = require('fs/promises');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { execSync, execFileSync, execFile } = require('child_process');

const { device } = require('detox');

const shouldRestartAppBetweenTests = true;

const {
  examplesJSONPath,
  docScreenshotsPath,
  screenshotsJSONPath,
  docSiteRootPath,
} = require('../../scripts/autogenHelpers/docconfig.js');

const percyScreenshotsPath = process.env.PERCY_DOC_SCREENSHOTS_DIR;

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

async function saveImage(imagePath, basePath, suffix = null) {
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

/** @type {{ frame: { width: number }, safeAreaInsets: { top: number } } | undefined} */
let rootViewAttributes;

async function readRootViewAttributes() {
  if (!rootViewAttributes) {
    rootViewAttributes = await element(by.type('RCTSurfaceHostingView'))
      .atIndex(0)
      .getAttributes();
  }
}

// The status bar can't be fully frozen (the location arrow comes and goes), so
// the copies sent to Percy leave it out. Cropped in a separate process, as pngjs
// takes ~40 s per screenshot inside Jest's VM context on CI.
async function savePercyImage(imagePath, groupName, name) {
  const { frame, safeAreaInsets } = rootViewAttributes;
  const destDir = path.join(percyScreenshotsPath, 'doc', groupName);
  await mkdir(destDir, { recursive: true });
  execFileSync(process.execPath, [
    path.join(__dirname, 'cropTop.js'),
    imagePath,
    path.join(destDir, `${name}.png`),
    String(safeAreaInsets.top),
    String(frame.width),
  ]);
}

const STABLE_INTERVAL_MS = 500;
const STABLE_TIMEOUT_MS = 10000;
const STABLE_MAX_CHANGED_PIXELS = 10;

// Compared in a separate process for the same reason as savePercyImage.
async function changedPixels(aPath, bPath) {
  const { frame, safeAreaInsets } = rootViewAttributes;
  const { stdout } = await promisify(execFile)(process.execPath, [
    path.join(__dirname, 'changedPixels.js'),
    aPath,
    bPath,
    String(safeAreaInsets.top),
    String(frame.width),
  ]);
  return Number(stdout);
}

// Labels and tiles can still change after the maps report idle, so wait until two
// consecutive screenshots match.
async function takeStableScreenshot(name) {
  const start = Date.now();
  let previous = await device.takeScreenshot(`${name}-0`);
  for (let i = 1; ; i++) {
    await new Promise((resolve) => setTimeout(resolve, STABLE_INTERVAL_MS));
    const current = await device.takeScreenshot(`${name}-${i}`);
    if ((await changedPixels(previous, current)) <= STABLE_MAX_CHANGED_PIXELS) {
      return current;
    }
    if (Date.now() - start >= STABLE_TIMEOUT_MS) {
      console.warn(
        `${name}: screenshot still changing after ${STABLE_TIMEOUT_MS} ms, keeping the last one.`,
      );
      return current;
    }
    previous = current;
  }
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

/** @type {boolean | undefined} */
let mapsIdleTrackerEnabled;

// example/src/utils/MapsIdleTracker.tsx is only in bundles built with RNMBX_E2E_MAPS_IDLE=1
async function isMapsIdleTrackerEnabled() {
  if (mapsIdleTrackerEnabled === undefined) {
    try {
      await waitFor(element(by.id('e2e-maps-idle-tracker')))
        .toExist()
        .withTimeout(5000);
      mapsIdleTrackerEnabled = true;
    } catch {
      mapsIdleTrackerEnabled = false;
      console.warn(
        'The maps idle tracker is not in the app, build it with RNMBX_E2E_MAPS_IDLE=1 to wait for idle maps. Falling back to a fixed delay before each screenshot.',
      );
    }
  }
  return mapsIdleTrackerEnabled;
}

async function waitForMapsIdle(name, timeout) {
  try {
    await waitFor(element(by.id('e2e-maps-idle')))
      .toExist()
      .withTimeout(timeout);
  } catch {
    console.warn(
      `${name}: maps not idle after ${timeout} ms, taking the screenshot anyway. Set waitForMapIdle: false in its metadata if it never goes idle.`,
    );
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

    const imgPath = await saveImage(
      await takeStableScreenshot(basename),
      path.join(groupDir, basename),
      suffix,
    );
    screenshotsDict[basename].images.push(
      path.relative(docSiteRootPath, path.resolve(imgPath)),
    );
    return imgPath;
  }
}

describe('Example screenshots', () => {
  beforeAll(async () => {
    await device.launchApp({ permissions: { location: 'always' } });
  });
  beforeEach(async () => {
    if (shouldRestartAppBetweenTests) {
      await device.launchApp({ permissions: { location: 'always' } });
    }
    await device.setURLBlacklist([
      '.*tile.openstreetmap.org.*',
      '.*mapbox.com.*',
    ]);
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
                batteryLevel: '100',
                batteryState: 'charged',
                dataNetwork: 'wifi',
                wifiMode: 'active',
                wifiBars: '3',
                cellularMode: 'active',
                cellularBars: '4',
              });
              await setSampleLocation();
              await readRootViewAttributes();

              await waitFor(element(by.text(groupMetadata.title)))
                .toBeVisible()
                .whileElement(by.id('example-list'))
                .scroll(200, 'down');
              await element(by.text(groupMetadata.title)).tap();

              await waitFor(element(by.text(metadata.title)))
                .toBeVisible()
                .whileElement(by.id('example-list'))
                .scroll(50, 'down');
              if (metadata.disableSync) {
                await device.disableSynchronization();
              }
              await element(by.text(metadata.title)).tap();

              let shots = new ExampleScreenshots(
                { testName: name, groupName },
                screenshots,
              );

              if (
                metadata.waitForMapIdle !== false &&
                (await isMapsIdleTrackerEnabled())
              ) {
                await waitForMapsIdle(name, 20000);
              } else {
                await wait(metadata.disableSync ? 3000 : 1000);
              }
              const imagePath = await shots.screenshot();
              if (percyScreenshotsPath && !metadata.excludeFromPercy) {
                await savePercyImage(imagePath, groupName, name);
              }
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
