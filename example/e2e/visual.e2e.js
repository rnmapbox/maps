/* global device, element, by, waitFor, describe, it, beforeAll, afterEach */

/**
 * @file Captures the deterministic map scenes in example/src/examples/E2E/Screenshot*
 * into e2e/artifacts/visual/<scene>.png, which CI uploads to the visual testing service.
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const SCENES = {
  'fill-line': 'Screenshot Fill Line',
  'circle-symbol': 'Screenshot Circle Symbol',
  'basemap-streets': 'Screenshot Basemap Streets',
};

const MAP_IDLE_TIMEOUT = 30000;
const STABLE_TIMEOUT = 20000;

const outDir = path.join(__dirname, 'artifacts', 'visual');

async function openScene(title) {
  await waitFor(element(by.text('E2E')))
    .toBeVisible()
    .whileElement(by.id('example-list'))
    .scroll(200, 'down');
  await element(by.text('E2E')).tap();
  await waitFor(element(by.text(title)))
    .toBeVisible()
    .whileElement(by.id('example-list'))
    .scroll(50, 'down');
  await element(by.text(title)).tap();
}

async function captureMap(name) {
  const { frame } = await element(by.id('screenshot-map')).getAttributes();
  const screen = PNG.sync.read(
    fs.readFileSync(await device.takeScreenshot(name)),
  );
  const scale = screen.width / frame.width;
  const width = Math.round(frame.width * scale);
  const height = Math.round(frame.height * scale);
  const crop = new PNG({ width, height });
  PNG.bitblt(
    screen,
    crop,
    Math.round(frame.x * scale),
    Math.round(frame.y * scale),
    width,
    height,
    0,
    0,
  );
  return crop;
}

// The map can still draw after onMapIdle (e.g. layers added after the first
// idle), so wait until two consecutive captures are identical.
async function captureStableMap(name) {
  const deadline = Date.now() + STABLE_TIMEOUT;
  let previous = await captureMap(name);
  for (;;) {
    const current = await captureMap(name);
    if (current.data.equals(previous.data)) {
      return current;
    }
    if (Date.now() > deadline) {
      throw new Error(`${name}: map did not settle in ${STABLE_TIMEOUT} ms`);
    }
    previous = current;
  }
}

describe('Visual snapshots', () => {
  beforeAll(async () => {
    await device.launchApp({ permissions: { location: 'never' } });
    fs.mkdirSync(outDir, { recursive: true });
  });

  afterEach(async () => {
    await device.reloadReactNative();
  });

  Object.entries(SCENES).forEach(([name, title]) => {
    it(name, async () => {
      await openScene(title);
      await waitFor(element(by.id('screenshot-map-idle')))
        .toExist()
        .withTimeout(MAP_IDLE_TIMEOUT);
      const shot = await captureStableMap(name);
      fs.writeFileSync(path.join(outDir, `${name}.png`), PNG.sync.write(shot));
    });
  });
});
