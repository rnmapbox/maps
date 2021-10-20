/* eslint-disable */

describe('Maps Example App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  afterEach(async () => {
    await device.reloadReactNative();
  });

  it('should show initial screen', async () => {
    await expect(element(by.text('Map'))).toBeVisible();
    await expect(element(by.text('Camera'))).toBeVisible();
    await expect(element(by.text('User Location'))).toBeVisible();
  });
});
