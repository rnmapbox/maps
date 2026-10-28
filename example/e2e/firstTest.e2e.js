/* global device, element, by, waitFor, describe, it, expect, beforeAll, afterEach */

const MAP_LOAD_TIMEOUT = 60000;
const TAP_ATTEMPTS = 3;

async function openExample(groupTitle, exampleTitle) {
  await waitFor(element(by.text(groupTitle)))
    .toBeVisible()
    .whileElement(by.id('example-list'))
    .scroll(200, 'down');
  await element(by.text(groupTitle)).tap();
  await waitFor(element(by.text(exampleTitle)))
    .toBeVisible()
    .whileElement(by.id('example-list'))
    .scroll(50, 'down');
  await element(by.text(exampleTitle)).tap();
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
});
