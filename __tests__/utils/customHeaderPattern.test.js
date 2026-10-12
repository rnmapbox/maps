import { NativeModules } from 'react-native';

import { isAnchoredUrlPattern } from '../../src/utils/customHeaderPattern';
import { addCustomHeader } from '../../src/RNMBXModule';

describe('isAnchoredUrlPattern', () => {
  it.each([
    '^https://tiles\\.example\\.com/',
    '^https:\\/\\/api\\.mapbox\\.com\\/(.*)$',
    '\\Ahttps://x/',
    '(?i)^https://x/',
  ])('treats %p as anchored', (pattern) => {
    expect(isAnchoredUrlPattern(pattern)).toBe(true);
  });

  it.each([
    'tiles\\.example\\.com',
    'https://tiles\\.example\\.com/.*',
    '.*example\\.com',
    '^.*example\\.com',
    '^.+',
    '^(.*)',
    '',
    ' ^https://x/',
  ])('treats %p as unanchored', (pattern) => {
    expect(isAnchoredUrlPattern(pattern)).toBe(false);
  });
});

describe('addCustomHeader', () => {
  let warn;

  beforeEach(() => {
    NativeModules.RNMBXModule.addCustomHeader = jest.fn();
    NativeModules.RNMBXModule.addCustomHeaderWithOptions = jest.fn();
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('warns once per unanchored pattern and still calls native', () => {
    const options = { urlRegexp: 'once\\.example\\.com' };
    addCustomHeader('X-Token', 'secret-value', options);
    addCustomHeader('X-Other', 'secret-value', options);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('`once\\.example\\.com`');
    expect(warn.mock.calls[0][0]).toContain('"X-Token"');
    expect(
      NativeModules.RNMBXModule.addCustomHeaderWithOptions,
    ).toHaveBeenCalledTimes(2);
    expect(
      NativeModules.RNMBXModule.addCustomHeaderWithOptions,
    ).toHaveBeenCalledWith('X-Token', 'secret-value', options);
  });

  it('warns again for a different unanchored pattern', () => {
    addCustomHeader('X-Token', 'v', { urlRegexp: 'a\\.example\\.com' });
    addCustomHeader('X-Token', 'v', { urlRegexp: 'b\\.example\\.com' });
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('never prints the header value', () => {
    addCustomHeader('Authorization', 'Bearer top-secret', {
      urlRegexp: 'leak\\.example\\.com',
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).not.toContain('top-secret');
  });

  it('does not warn for anchored patterns', () => {
    addCustomHeader('X-Token', 'v', {
      urlRegexp: '^https://tiles\\.example\\.com/',
    });
    expect(warn).not.toHaveBeenCalled();
    expect(
      NativeModules.RNMBXModule.addCustomHeaderWithOptions,
    ).toHaveBeenCalledTimes(1);
  });

  it('does not warn without urlRegexp', () => {
    addCustomHeader('X-Token', 'v');
    addCustomHeader('X-Token', 'v', {});
    expect(warn).not.toHaveBeenCalled();
    expect(NativeModules.RNMBXModule.addCustomHeader).toHaveBeenCalledWith(
      'X-Token',
      'v',
    );
  });
});
