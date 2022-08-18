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
    await expect(element(by.text('Map'))).toBeVisible();
    await element(by.text('Map')).tap();
    await expect(element(by.text('Show Map'))).toBeVisible();
    await element(by.text('Show Map')).tap();
    await expect(element(by.text('Light'))).toBeVisible();
    await element(by.text('Light')).tap();
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
