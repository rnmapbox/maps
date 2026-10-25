/* global device, element, by, waitFor, describe, it, expect, beforeAll, afterEach */

const MAP_LOAD_TIMEOUT = 60000;

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

describe('Maps Example App', () => {
  beforeAll(async () => {
    await device.launchApp({ permissions: { location: 'always' } });
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
    await element(by.id('show-click-map-view')).tap();
    await waitFor(element(by.id('location-bubble-latitude')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
