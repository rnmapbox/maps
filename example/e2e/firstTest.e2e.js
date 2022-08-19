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

  it('should render MapView', async () => {
    await device.takeScreenshot('t2.0');
    await expect(element(by.text('Map'))).toBeVisible();
    await device.takeScreenshot('t2.1');
    await element(by.text('Map')).tap();
    await device.takeScreenshot('t2.2');
    await expect(element(by.text('Show Map'))).toBeVisible();
    await device.takeScreenshot('t2.3');
    await element(by.text('Show Map')).tap();
    await device.takeScreenshot('t2.4');
    await expect(element(by.id('show-map'))).toBeVisible();
    await device.takeScreenshot('t2.5');
  });

  it('should show click location', async () => {
    await expect(element(by.text('Map'))).toBeVisible();
    await element(by.text('Map')).tap();
    await expect(element(by.text('Show Click'))).toBeVisible();
    await element(by.text('Show Click')).tap();
    await expect(element(by.id('show-click-map-view'))).toBeVisible();
    await element(by.id('show-click-map-view')).tap();
    await waitFor(element(by.id('location-bubble-latitude')))
      .toBeVisible()
      .withTimeout(1000);
  });
});
