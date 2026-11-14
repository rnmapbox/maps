/* global device, element, by, waitFor, describe, it, expect, beforeAll, afterEach */

const MAP_LOAD_TIMEOUT = 60000;
const TAP_ATTEMPTS = 3;
const MAX_HIDDEN_PUCK_FRAMES = 10;
const { expect: expectValue } = require('@jest/globals');

async function openExample(groupTitle, exampleTitle, disableSync = false) {
  await waitFor(element(by.text(groupTitle)))
    .toBeVisible()
    .whileElement(by.id('example-list'))
    .scroll(200, 'down');
  await element(by.text(groupTitle)).tap();
  await waitFor(element(by.text(exampleTitle)))
    .toBeVisible()
    .whileElement(by.id('example-list'))
    .scroll(50, 'down');
  if (disableSync) await device.disableSynchronization();
  await element(by.text(exampleTitle)).tap();
}

async function puckStateWhen(predicate) {
  const deadline = Date.now() + 15000;
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

// A main thread stall between Detox's touch down and up turns a tap into a
// long press, which the map doesn't report as a press, so tap again.
async function tapUntilVisible(target, expected) {
  for (let attempt = 1; ; attempt++) {
    await element(target).tap();
    try {
      await waitFor(element(expected)).toBeVisible().withTimeout(10000);
      return;
    } catch (e) {
      if (attempt === TAP_ATTEMPTS) {
        throw e;
      }
    }
  }
}

describe('Maps Example App', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: { location: 'always' },
      launchArgs: { e2eIgnoreAllLogs: true },
    });
    // Don't wait for slow or stuck Mapbox requests: the map tests wait for
    // what they need, and the others don't need the network
    await device.setURLBlacklist(['.*\\.mapbox\\.com/.*']);
  });

  afterEach(async () => {
    await device.reloadReactNative();
    await device.enableSynchronization();
  });

  it('should show initial screen', async () => {
    await expect(element(by.text('Map'))).toBeVisible();
    await expect(element(by.text('Camera'))).toBeVisible();
    await expect(element(by.text('User Location'))).toBeVisible();
  });

  it('should finish loading a map', async () => {
    await openExample('E2E', 'Map Loaded');
    await expect(element(by.id('e2e-map'))).toBeVisible();
    await waitFor(element(by.id('e2e-map-loaded')))
      .toExist()
      .withTimeout(MAP_LOAD_TIMEOUT);
  });

  it('should render MapView', async () => {
    await openExample('Map', 'Show Map');
    await expect(element(by.id('show-map'))).toBeVisible();
  });

  it('should show click location', async () => {
    await openExample('Map', 'Show Click');
    await expect(element(by.id('show-click-map-view'))).toBeVisible();
    await tapUntilVisible(
      by.id('show-click-map-view'),
      by.id('location-bubble-latitude'),
    );
  });

  it('should stop hidden puck rendering while preserving camera following', async () => {
    await openExample('E2E', 'Location Puck Lifecycle', true);
    await waitFor(element(by.id('puck-state')))
      .toExist()
      .withTimeout(15000);
    const initial = await puckStateWhen((state) => state.ready);
    // Settle initial rendering, then observe three more location/heading updates.
    const before = await puckStateWhen(
      (state) => state.locations >= initial.locations + 3,
    );
    const hidden = await puckStateWhen(
      (state) => state.locations >= before.locations + 3,
    );
    // Allow incidental CI repaints while still rejecting continuous puck rendering.
    expectValue(hidden.frames - before.frames).toBeLessThanOrEqual(
      MAX_HIDDEN_PUCK_FRAMES,
    );

    await element(by.id('puck-follow')).tap();
    const start = await puckStateWhen((state) => state.follow);
    // The follow camera animates toward a moving puck, so wait for it to catch up.
    await puckStateWhen(
      (state) =>
        state.locations >= start.locations + 2 &&
        state.center[0] > hidden.center[0] &&
        Math.abs(state.center[0] - state.coordinate[0]) < 0.0002 &&
        Math.abs(state.center[1] - state.coordinate[1]) < 0.0002 &&
        Math.abs(((state.heading - state.targetHeading + 540) % 360) - 180) <
          20,
    );
  });
});
