/* global device, element, by, waitFor, describe, it, beforeAll, beforeEach, afterEach */

const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { expect } = require('@jest/globals');

async function stateWhen(predicate, timeout = 15000) {
  const deadline = Date.now() + timeout;
  let state;
  do {
    const attributes = await element(by.id('puck-state')).getAttributes();
    state = JSON.parse(attributes.label);
    if (predicate(state)) return state;
    await new Promise((resolve) => setTimeout(resolve, 250));
  } while (Date.now() < deadline);
  throw new Error(
    `Puck state did not satisfy assertion: ${JSON.stringify(state)}`,
  );
}

async function expectHiddenToSettle() {
  // Let map setup / visibility transitions finish before observing three more locations.
  const initial = await stateWhen((state) => state.ready);
  const before = await stateWhen(
    (state) => state.locations >= initial.locations + 3,
  );
  const after = await stateWhen(
    (state) => state.locations >= before.locations + 3,
  );
  expect(after.frames).toBe(before.frames);
}

async function expectCustomImage() {
  const { frame } = await element(by.id('puck-map')).getAttributes();
  // Like docScreenshots.e2e.js, keep PNG processing outside Jest's slower VM.
  const { stdout } = await promisify(execFile)(process.execPath, [
    path.join(__dirname, 'puckImagePixels.js'),
    await device.takeScreenshot('custom-puck'),
    JSON.stringify(frame),
  ]);
  expect(Number(stdout)).toBeGreaterThan(10);
}

describe('iOS location puck lifecycle', () => {
  beforeAll(async () => {
    await device.launchApp({ permissions: { location: 'never' } });
    await device.setURLBlacklist(['.*\\.mapbox\\.com/.*']);
  });

  beforeEach(async () => {
    await waitFor(element(by.text('E2E')))
      .toBeVisible()
      .whileElement(by.id('example-list'))
      .scroll(200, 'down');
    await element(by.text('E2E')).tap();
    await waitFor(element(by.text('Location Puck Lifecycle')))
      .toBeVisible()
      .whileElement(by.id('example-list'))
      .scroll(100, 'down');
    await device.disableSynchronization();
    await element(by.text('Location Puck Lifecycle')).tap();
    await waitFor(element(by.id('puck-state')))
      .toExist()
      .withTimeout(15000);
    await stateWhen((state) => state.ready);
  });

  afterEach(async () => {
    await device.reloadReactNative();
    await device.enableSynchronization();
  });

  it('stops rendering a hidden puck while locations continue arriving', async () => {
    await expectHiddenToSettle();
  });

  it('follows position and compass heading with the puck hidden', async () => {
    await element(by.id('puck-follow')).tap();
    const before = await stateWhen((state) => state.mode === 'follow');
    const after = await stateWhen(
      (state) => state.locations >= before.locations + 4,
    );
    expect(after.center[0]).toBeGreaterThan(before.center[0]);
    expect(Math.abs(after.center[0] - after.coordinate[0])).toBeLessThan(
      0.0002,
    );
    expect(Math.abs(after.center[1] - after.coordinate[1])).toBeLessThan(
      0.0002,
    );

    await element(by.id('puck-compass')).tap();
    const start = await stateWhen((state) => state.mode === 'compass');
    const compass = await stateWhen(
      (state) => state.locations >= start.locations + 4,
    );
    const error = Math.abs(
      ((compass.heading - compass.targetHeading + 540) % 360) - 180,
    );
    expect(error).toBeLessThan(30);
    expect(compass.frames).toBeGreaterThan(start.frames);
  });

  it('restores a custom image and pulse across repeated hide/show transitions', async () => {
    for (let cycle = 0; cycle < 2; cycle++) {
      await element(by.id('puck-visible')).tap();
      const shown = await stateWhen((state) => state.mode === 'visible');
      const before = await stateWhen(
        (state) => state.locations >= shown.locations + 3,
      );
      // Coordinates and heading are fixed in visible mode: ongoing frames exercise the pulse.
      const after = await stateWhen(
        (state) => state.locations >= before.locations + 2,
      );
      expect(after.frames).toBeGreaterThan(before.frames);
      await expectCustomImage();
      await element(by.id('puck-hidden')).tap();
      await stateWhen((state) => state.mode === 'hidden');
      await expectHiddenToSettle();
    }
  });
});
