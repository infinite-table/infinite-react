import { enrichSortInfoFromGroupBy } from './enrichSortInfoFromGroupBy';

type Row = { language: string; license: string; age: number };

const groupBy = [{ field: 'language' as const }, { field: 'license' as const }];

describe('enrichSortInfoFromGroupBy', () => {
  test('fills field from groupBy when id is group-by', () => {
    const result = enrichSortInfoFromGroupBy<Row>(
      [{ id: 'group-by', dir: 1 }],
      groupBy,
    );

    expect(result).toEqual([
      { id: 'group-by', dir: 1, field: ['language', 'license'] },
    ]);
  });

  test('fills field for a multi-column group-by-<field> id', () => {
    const result = enrichSortInfoFromGroupBy<Row>(
      [{ id: 'group-by-license', dir: -1 }],
      groupBy,
    );

    expect(result).toEqual([{ id: 'group-by-license', dir: -1, field: 'license' }]);
  });

  test('leaves sortInfo unchanged when field is already set', () => {
    const sortInfo = [
      { id: 'group-by', dir: 1 as const, field: 'age' as const },
    ];
    expect(enrichSortInfoFromGroupBy<Row>(sortInfo, groupBy)).toBe(sortInfo);
  });

  test('returns the same reference when there is nothing to enrich', () => {
    const sortInfo = [{ field: 'age' as const, dir: 1 as const }];
    expect(enrichSortInfoFromGroupBy<Row>(sortInfo, groupBy)).toBe(sortInfo);
  });
});
