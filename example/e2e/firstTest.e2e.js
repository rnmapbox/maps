const { mkdir, copyFile } = require('fs/promises');

async function saveImage(imageName) {
  const imagePath = await device.takeScreenshot('Show Click');
  console.log('[x] imagePath =>', imagePath);
  const destDir = '/tmp/screenshots';
  const destPath = `${destDir}/Show Click.png`;
  await mkdir(destDir, { recursive: true });
  await copyFile(imagePath, destPath);
  console.log('[x] destPath =>', destPath);
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

  it('should render MapView', async () => {
    if (['true', 1, '1'].includes(process.env.SKIP_TESTS_NO_METAL)) {
      console.debug(
        '### Skipping tests as Metal is not available in this environment',
      );
      return;
    }

    await expect(element(by.text('Map'))).toBeVisible();
    await element(by.text('Map')).tap();
    await expect(element(by.text('Show Map'))).toBeVisible();
    await element(by.text('Show Map')).tap();
    await expect(element(by.id('show-map'))).toBeVisible();
    await saveImage('Show Map');
  });

  it('should show click location', async () => {
    if (['true', 1, '1'].includes(process.env.SKIP_TESTS_NO_METAL)) {
      console.debug(
        '### Skipping tests as Metal is not available in this environment',
      );
      return;
    }

    await expect(element(by.text('Map'))).toBeVisible();
    await element(by.text('Map')).tap();
    await expect(element(by.text('Show Click'))).toBeVisible();
    await element(by.text('Show Click')).tap();
    await expect(element(by.id('show-click-map-view'))).toBeVisible();
    await element(by.id('show-click-map-view')).tap();
    await waitFor(element(by.id('location-bubble-latitude')))
      .toBeVisible()
      .withTimeout(1000);
    await saveImage('Show Click');
  });
});
