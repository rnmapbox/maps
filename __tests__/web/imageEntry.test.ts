// @ts-expect-error untyped module
import { registerAsset } from '@react-native/assets-registry/registry';

import { resolveImageEntry } from '../../src/web/utils/imageEntry';

const pinAsset: number = registerAsset({
  httpServerLocation: '/assets/images',
  name: 'pin',
  type: 'png',
  scales: [2],
});

describe('resolveImageEntry', () => {
  it('resolves a url', () => {
    expect(resolveImageEntry('https://example.com/pin.png')).toEqual({
      url: 'https://example.com/pin.png',
      options: { pixelRatio: 1 },
    });
  });

  it('resolves a required asset with its scale as pixel ratio', () => {
    expect(resolveImageEntry(pinAsset)).toEqual({
      url: '/assets/images/pin@2x.png',
      options: { pixelRatio: 2 },
    });
  });

  it('resolves a uri source', () => {
    expect(resolveImageEntry({ uri: 'data:image/png;base64,AA' })).toEqual({
      url: 'data:image/png;base64,AA',
      options: { pixelRatio: 1 },
    });
  });

  it('passes sdf and stretch options, scaled like native', () => {
    expect(
      resolveImageEntry({
        url: 'https://example.com/popup.png',
        sdf: true,
        stretchX: [[25, 55]],
        stretchY: [[10, 20]],
        content: [25, 25, 115, 100],
        scale: 2,
      }),
    ).toEqual({
      url: 'https://example.com/popup.png',
      options: {
        pixelRatio: 2,
        sdf: true,
        stretchX: [[50, 110]],
        stretchY: [[20, 40]],
        content: [50, 50, 230, 200],
      },
    });
  });

  it('combines entry scale with the asset scale', () => {
    expect(resolveImageEntry({ image: pinAsset, scale: 1.5 })?.options).toEqual(
      expect.objectContaining({ pixelRatio: 3 }),
    );
  });
});
