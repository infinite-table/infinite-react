import { DeepMap } from '../../../utils/DeepMap';
import type { InfiniteTableRowInfo } from '../../../utils/groupAndPivot';
import type { InfiniteTablePivotColumn } from '../../InfiniteTable/types/InfiniteTableColumn';
import { sortGroupedRowInfosByPivotColumns } from './sortGroupedRowInfosByPivotColumns';

type Row = {
  id: number;
  language: string;
  license: string;
  stargazers_count: number;
};

function groupRow(opts: {
  keys: string[];
  trueStars: number;
  falseStars?: number;
}): InfiniteTableRowInfo<Row> {
  const pivotValuesMap = new DeepMap<any, any>();
  pivotValuesMap.set([true], {
    items: [],
    reducerResults: { stargazers_count: opts.trueStars },
  });
  if (opts.falseStars != null) {
    pivotValuesMap.set([false], {
      items: [],
      reducerResults: { stargazers_count: opts.falseStars },
    });
  }

  return {
    id: opts.keys.join('/'),
    isGroupRow: true,
    isTreeNode: false,
    dataSourceHasGrouping: true,
    groupKeys: opts.keys,
    groupNesting: opts.keys.length,
    value: opts.keys[opts.keys.length - 1],
    pivotValuesMap,
    indexInAll: 0,
    indexInGroup: 0,
    indexInParentGroups: [],
  } as any;
}

const pivotColumns = {
  'stargazers_count:true': {
    pivotColumn: true,
    pivotTotalColumn: false,
    pivotGroupKeys: [true],
    pivotAggregator: { id: 'stargazers_count' },
  },
} as unknown as Record<string, InfiniteTablePivotColumn<Row>>;

describe('sortGroupedRowInfosByPivotColumns', () => {
  const rows = [
    groupRow({ keys: ['JavaScript'], trueStars: 110, falseStars: 1050 }),
    groupRow({ keys: ['JavaScript', 'MIT'], trueStars: 100, falseStars: 50 }),
    groupRow({ keys: ['JavaScript', 'BSD'], trueStars: 10, falseStars: 1000 }),
    groupRow({ keys: ['TypeScript'], trueStars: 200, falseStars: 1 }),
    groupRow({ keys: ['TypeScript', 'MIT'], trueStars: 200, falseStars: 1 }),
  ];

  test('sorts sibling groups by the pivot cell value, both directions', () => {
    const asc = sortGroupedRowInfosByPivotColumns(
      rows,
      [{ id: 'stargazers_count:true', dir: 1, type: 'number' }],
      pivotColumns,
    ).map((r: any) => r.groupKeys.join('/'));

    expect(asc).toEqual([
      'JavaScript',
      'JavaScript/BSD',
      'JavaScript/MIT',
      'TypeScript',
      'TypeScript/MIT',
    ]);

    const desc = sortGroupedRowInfosByPivotColumns(
      rows,
      [{ id: 'stargazers_count:true', dir: -1, type: 'number' }],
      pivotColumns,
    ).map((r: any) => r.groupKeys.join('/'));

    expect(desc).toEqual([
      'TypeScript',
      'TypeScript/MIT',
      'JavaScript',
      'JavaScript/MIT',
      'JavaScript/BSD',
    ]);
  });

  test('uses a custom sortTypes comparator when provided', () => {
    const descByCustomType = sortGroupedRowInfosByPivotColumns(
      rows,
      [{ id: 'stargazers_count:true', dir: 1, type: 'stars' }],
      pivotColumns,
      {
        stars: (a: number, b: number) => b - a,
      },
    ).map((r: any) => r.groupKeys.join('/'));

    expect(descByCustomType).toEqual([
      'TypeScript',
      'TypeScript/MIT',
      'JavaScript',
      'JavaScript/MIT',
      'JavaScript/BSD',
    ]);
  });

  test('leaves the array unchanged when sortInfo is not a pivot column', () => {
    expect(
      sortGroupedRowInfosByPivotColumns(
        rows,
        [{ id: 'group-by-language', dir: 1, field: 'language' }],
        pivotColumns,
      ),
    ).toBe(rows);
  });
});
