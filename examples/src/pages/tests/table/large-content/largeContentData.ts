/**
 * Data for the very-large-content tests: more rows than browsers can lay out
 * at once (see source/src/components/VirtualBrain/largeContent.ts).
 *
 * The rows are generated (not random), so every cell's text can be derived
 * from its row index in the specs.
 */
export type LargeContentRow = {
  id: number;
  name: string;
  value: number;
  code: string;
  group: string;
};

export function makeRows(count: number): LargeContentRow[] {
  const rows: LargeContentRow[] = new Array(count);
  for (let i = 0; i < count; i++) {
    rows[i] = {
      id: i,
      name: `row ${i}`,
      value: i * 2,
      code: `c${i % 997}`,
      group: `g${i % 13}`,
    };
  }
  return rows;
}

export const ROW_HEIGHT = 40;
export const COLUMN_WIDTH = 120;

/**
 * normal layout: 1M rows x 40px = 40M px - more than any browser supports
 * (Chrome ~16.7M, Safari ~33.5M, Firefox ~8.9M)
 */
export const VERTICAL_ROW_COUNT = 1_000_000;

/**
 * horizontal layout: the rows become width - 5 columns x 120px = 600px per
 * page, ~9 rows per page -> ~111k pages = ~66M px
 */
export const HORIZONTAL_LAYOUT_ROW_COUNT = 1_000_000;
