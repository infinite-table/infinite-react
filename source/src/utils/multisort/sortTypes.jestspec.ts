/**
 * The string comparator has two implementations that must give the same
 * order: `localeCompare`, and a collator created once (see sortTypes.ts for
 * when each one is used).
 */
const VALUES = [
  '',
  ' ',
  'a',
  'A',
  'b',
  'B',
  'apple',
  'Apple',
  'apples',
  'Zebra',
  'zebra',
  'résumé',
  'resume',
  'Résumé',
  'ä',
  'z',
  'ö',
  'ș',
  's',
  'ß',
  'ss',
  '10',
  '9',
  'a b',
  'a-b',
  'ab',
  'a_b',
  'İstanbul',
  'istanbul',
  '日本',
  '中文',
];

function loadWithDefaultLocale(locale: string) {
  jest.resetModules();
  const resolvedOptions = Intl.Collator.prototype.resolvedOptions;
  jest
    .spyOn(Intl.Collator.prototype, 'resolvedOptions')
    .mockImplementation(function (this: Intl.Collator) {
      return { ...resolvedOptions.call(this), locale };
    });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('./sortTypes') as typeof import('./sortTypes');
}

describe('stringComparator', () => {
  const expected: number[][] = VALUES.map((a) =>
    VALUES.map((b) => Math.sign(a.localeCompare(b))),
  );

  afterEach(() => {
    jest.restoreAllMocks();
  });

  for (const [locale, usesLocaleCompare] of [
    ['en-US', true],
    ['de', true],
    ['de-DE', false],
    ['en-AU', false],
    ['ja-JP', false],
  ] as const) {
    it(`sorts like localeCompare when the default locale is ${locale}`, () => {
      const { stringComparator } = loadWithDefaultLocale(locale);
      const localeCompare = jest.spyOn(String.prototype, 'localeCompare');

      const actual = VALUES.map((a) =>
        VALUES.map((b) => Math.sign(stringComparator(a, b))),
      );

      expect(localeCompare.mock.calls.length > 0).toBe(usesLocaleCompare);
      localeCompare.mockRestore();
      expect(actual).toEqual(expected);
    });
  }

  it('compares values that are not strings as strings', () => {
    const { stringComparator } = loadWithDefaultLocale('de-DE');

    expect(stringComparator(10 as any, 9 as any)).toBeLessThan(0);
    expect(stringComparator(null as any, 'null')).toBe(0);
  });

  it('sorts an array the same way with both implementations', () => {
    const viaLocaleCompare = [...VALUES].sort(
      loadWithDefaultLocale('en-US').stringComparator,
    );
    const viaCollator = [...VALUES].sort(
      loadWithDefaultLocale('de-DE').stringComparator,
    );

    expect(viaCollator).toEqual(viaLocaleCompare);
  });
});
