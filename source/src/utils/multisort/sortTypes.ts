export const numberComparator = function (
  first: number,
  second: number,
): number {
  return first - second;
};

/**
 * Locales in which `a.localeCompare(b)` is the faster way to compare strings.
 *
 * `a.localeCompare(b)` and `new Intl.Collator().compare(a, b)` always give
 * the same result - they only differ in speed. V8 (Chrome, Edge, Node.js) has
 * a fast path for `localeCompare`, which applies when the default locale is
 * exactly one of the tags below (so "en-US" and "de", but not "en-AU" or
 * "de-DE"): there, `localeCompare` is 2-3x faster than a collator on ASCII
 * strings. In every other locale it is the other way around: a collator that
 * is created once is almost 2x faster than `localeCompare`.
 *
 * The list was measured in Chromium 136. If it gets out of date, or in other
 * browsers, the only consequence is using the slower of two correct options.
 */
const LOCALES_WITH_FAST_LOCALE_COMPARE = new Set([
  'ca',
  'de',
  'de-AT',
  'en',
  'en-DE',
  'en-GB',
  'en-US',
  'fi',
  'fr',
  'id',
  'id-ID',
  'it',
  'ms',
  'nl',
  'pl',
  'pt',
  'ro',
  'sl',
  'sv',
  'sw',
  'vi',
]);

// undefined: not decided yet. null: use localeCompare
let collator: Intl.Collator | null | undefined;

function getCollator(): Intl.Collator | null {
  try {
    const defaultCollator = new Intl.Collator();
    return LOCALES_WITH_FAST_LOCALE_COMPARE.has(
      defaultCollator.resolvedOptions().locale,
    )
      ? null
      : defaultCollator;
  } catch (ex) {
    return null;
  }
}

/**
 * Compares strings in the order of the default locale, like
 * `first.localeCompare(second)` does - see LOCALES_WITH_FAST_LOCALE_COMPARE.
 */
export const stringComparator = function (
  first: string,
  second: string,
): number {
  first = `${first}`;
  second = `${second}`;

  if (collator === undefined) {
    collator = getCollator();
  }

  return collator
    ? collator.compare(first, second)
    : first.localeCompare(second);
};

export const dateComparator = function (first: Date, second: Date): number {
  return (first as any as number) - (second as any as number);
};

export const defaultSortTypes: {
  [key: string]: (first: any, second: any) => number;
} = {
  number: numberComparator,
  string: stringComparator,
  date: dateComparator,
};

export default defaultSortTypes;
