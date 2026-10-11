import { normalizeLanguageTag } from '../../src/utils/normalizeLanguageTag';

describe('normalizeLanguageTag', () => {
  it.each([
    ['EN', 'en'],
    ['  nl \n', 'nl'],
    ['en_us', 'en-US'],
    ['en--us', 'en-US'],
    ['es-419', 'es-419'],
    ['sr-latn-rs', 'sr-Latn-RS'],
    ['yue-hant-hk', 'yue-Hant-HK'],
    ['hu', 'hu'],
    ['tlh', 'tlh'],
  ])('applies canonical casing to %j', (input, expected) => {
    expect(normalizeLanguageTag(input)).toBe(expected);
  });

  it.each([
    ['en-US-u-mu-celsius', 'en-US-u-mu-celsius'],
    ['DE-de-U-FW-MON', 'de-DE-u-fw-mon'],
    ['en-x-PRIV', 'en-x-priv'],
  ])(
    'lowercases everything after an extension singleton in %j',
    (input, expected) => {
      expect(normalizeLanguageTag(input)).toBe(expected);
    },
  );

  it.each([
    ['zh-hant-tw', 'zh-Hant'],
    ['zh_Hant_TW', 'zh-Hant'],
    ['zh-Hans-HK', 'zh-Hans'],
    ['ZH-HANS-cn', 'zh-Hans'],
    ['zh-TW', 'zh-Hant'],
    ['zh-hk', 'zh-Hant'],
    ['zh_MO', 'zh-Hant'],
    ['zh-CN', 'zh-Hans'],
    ['zh', 'zh-Hans'],
  ])(
    'maps Chinese %j to a script the tile API localizes',
    (input, expected) => {
      expect(normalizeLanguageTag(input)).toBe(expected);
    },
  );

  it.each([
    ['english', 'english'],
    ['Dutch', 'dutch'],
    ['xx', 'xx'],
  ])('leaves invalid tag %j invalid instead of guessing', (input, expected) => {
    expect(normalizeLanguageTag(input)).toBe(expected);
  });

  it('returns an empty string for a blank tag', () => {
    expect(normalizeLanguageTag('   ')).toBe('');
  });
});
