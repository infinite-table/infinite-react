import { multisort } from './index';
import { sortByNumber, SORT_BY_NUMBER_MIN_LENGTH } from './sortByNumber';
import { numberComparator } from './sortTypes';

type Item = { id: number; value: any };

// mulberry32 - small seedable PRNG, so failures are reproducible
function createRandom(seed: number) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toItems(values: any[]): Item[] {
  return values.map((value, id) => ({ id, value }));
}

function withComparator(items: Item[], dir: 1 | -1) {
  // this is the comparator multisort builds for a number column
  return [...items].sort((a, b) => {
    const result = numberComparator(a.value, b.value);
    return result === 0 ? result : dir * result;
  });
}

const ids = (items: Item[]) => items.map((item) => item.id);

const SPECIAL_VALUES = [
  0,
  -0,
  1,
  -1,
  0.1,
  -0.1,
  1e-320, // subnormal
  -1e-320,
  Number.MIN_VALUE,
  -Number.MIN_VALUE,
  Number.MAX_VALUE,
  -Number.MAX_VALUE,
  Number.MAX_SAFE_INTEGER,
  Number.MIN_SAFE_INTEGER,
  2 ** 32,
  2 ** 32 + 1,
  -(2 ** 32),
  65535,
  65536,
  65537,
  1.5,
  1.5000000000000002,
  Infinity,
  -Infinity,
];

describe('sortByNumber', () => {
  const dirs: (1 | -1)[] = [1, -1];

  dirs.forEach((dir) => {
    const name = dir === 1 ? 'ascending' : 'descending';

    it(`gives the order of the comparator sort for special values, ${name}`, () => {
      // each value a few times, so there are ties, in a shuffled order
      const random = createRandom(1);
      const values = [...SPECIAL_VALUES, ...SPECIAL_VALUES, ...SPECIAL_VALUES]
        .map((value) => ({ value, order: random() }))
        .sort((a, b) => a.order - b.order)
        .map(({ value }) => value);

      const items = toItems(values);
      const expected = withComparator(items, dir);

      expect(sortByNumber(items, (item) => item.value, dir)).toBe(true);
      expect(ids(items)).toEqual(ids(expected));
    });

    it(`gives the order of the comparator sort for integers with many ties, ${name}`, () => {
      const random = createRandom(2);
      const items = toItems(
        Array.from({ length: 20_000 }, () => Math.floor(random() * 500) - 250),
      );
      const expected = withComparator(items, dir);

      expect(sortByNumber(items, (item) => item.value, dir)).toBe(true);
      expect(ids(items)).toEqual(ids(expected));
    });

    it(`gives the order of the comparator sort for floats of any magnitude, ${name}`, () => {
      const random = createRandom(3);
      const items = toItems(
        Array.from({ length: 20_000 }, () => {
          const magnitude = 10 ** Math.floor(random() * 40 - 20);
          return (random() - 0.5) * magnitude;
        }),
      );
      const expected = withComparator(items, dir);

      expect(sortByNumber(items, (item) => item.value, dir)).toBe(true);
      expect(ids(items)).toEqual(ids(expected));
    });
  });

  [null, undefined, NaN, '5', new Date(5), {}].forEach((value) => {
    it(`does not sort when a value is ${
      typeof value === 'object' && value ? value.constructor.name : `${value}`
    } (${typeof value})`, () => {
      const items = toItems([3, 1, value, 2]);
      const before = ids(items);

      expect(sortByNumber(items, (item) => item.value, 1)).toBe(false);
      expect(ids(items)).toEqual(before);
    });
  });

  it('handles arrays with no items, one item and two items', () => {
    const none: Item[] = [];
    expect(sortByNumber(none, (item) => item.value, 1)).toBe(true);
    expect(none).toEqual([]);

    const one = toItems([5]);
    expect(sortByNumber(one, (item) => item.value, -1)).toBe(true);
    expect(ids(one)).toEqual([0]);

    const two = toItems([5, -5]);
    expect(sortByNumber(two, (item) => item.value, 1)).toBe(true);
    expect(ids(two)).toEqual([1, 0]);
  });
});

describe('multisort with one number column', () => {
  const length = SORT_BY_NUMBER_MIN_LENGTH + 500;

  function createItems(seed: number) {
    const random = createRandom(seed);
    return toItems(
      Array.from({ length }, () => Math.floor(random() * 1000) / 10),
    );
  }

  it('gives the order of the comparator sort, for field and valueGetter', () => {
    const items = createItems(4);

    expect(
      ids(multisort([{ field: 'value', type: 'number', dir: 1 }], [...items])),
    ).toEqual(ids(withComparator(items, 1)));

    expect(
      ids(multisort([{ field: 'value', type: 'number', dir: -1 }], [...items])),
    ).toEqual(ids(withComparator(items, -1)));

    expect(
      ids(
        multisort(
          [{ valueGetter: (item) => -item.value, type: 'number', dir: 1 }],
          [...items],
        ),
      ),
    ).toEqual(ids(withComparator(items, -1)));
  });

  it('uses the item returned by the get option', () => {
    const items = createItems(5);
    const wrapped = items.map((data) => ({ data }));

    const result = multisort(
      [{ field: 'value', type: 'number', dir: -1 }],
      wrapped as any[],
      { get: (item: any) => item.data },
    );

    expect(result.map((item: any) => item.data.id)).toEqual(
      ids(withComparator(items, -1)),
    );
  });

  it('keeps the comparator order when some values are not numbers', () => {
    const items = createItems(6);
    items[10].value = null;
    items[20].value = '7';

    expect(
      ids(multisort([{ field: 'value', type: 'number', dir: 1 }], [...items])),
    ).toEqual(ids(withComparator(items, 1)));
  });

  it('still calls a custom comparator set for the number type', () => {
    const items = createItems(7);
    const knownTypes = multisort.knownTypes;
    const reversed = jest.fn((a: number, b: number) => b - a);

    multisort.knownTypes = { ...knownTypes, number: reversed as any };
    try {
      const result = multisort(
        [{ field: 'value', type: 'number', dir: 1 }],
        [...items],
      );

      expect(reversed).toHaveBeenCalled();
      expect(ids(result)).toEqual(ids(withComparator(items, -1)));
    } finally {
      multisort.knownTypes = knownTypes;
    }
  });
});
