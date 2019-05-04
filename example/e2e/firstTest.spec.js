describe('Example', () => {
  beforeEach(async () => {
    await device.launchApp({
      permissions: {location: 'always'},
      newInstance: true,
    });
    await device.reloadReactNative();
  });

  it('should have welcome screen', async () => {
    await expect(element(by.id('example-menu'))).toBeVisible();
    await device.takeScreenshot('example-menu');
    await element(by.id('example-Show Map')).tap();
    await device.setLocation(32.0853, 34.7818);
    await expect(element(by.id('map-loaded'))).toBeVisible();
    await device.takeScreenshot('show-map');
  });
});
