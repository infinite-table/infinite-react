// Shared by the pinned-start-end* test pages (React and Vue) and their specs:
// columns pinned at the start AND at the end, some of them from the middle of
// the column order, with different widths, and cells whose text says which
// row and column they belong to - so a spec can check, at any scroll
// position, that the right cell is in the right place and on top.

export const ROW_HEIGHT = 30;
export const ROW_COUNT = 2000;
export const COLUMN_COUNT = 20;

export const GRID_WIDTH = 900;
export const GRID_HEIGHT = 420;

export type PinnedRow = { id: number } & Record<string, string | number>;

export const columnIds = Array.from(
  { length: COLUMN_COUNT },
  (_, index) => `c${index}`,
);

export const columnWidth = (columnId: string) =>
  80 + (Number(columnId.slice(1)) % 4) * 30;

export const cellText = (rowIndex: number, columnId: string) =>
  `r${rowIndex}·${columnId}`;

export const rows: PinnedRow[] = Array.from({ length: ROW_COUNT }, (_, id) => {
  const row: PinnedRow = { id };
  columnIds.forEach((columnId) => {
    row[columnId] = cellText(id, columnId);
  });
  return row;
});

// c7 and c3 are pinned from the middle of the column order
export const columnPinning: Record<string, 'start' | 'end'> = {
  c0: 'start',
  c7: 'start',
  c3: 'end',
  c19: 'end',
};

/** the visible order: pinned start, unpinned, pinned end */
export const layout = {
  start: columnIds.filter((id) => columnPinning[id] === 'start'),
  unpinned: columnIds.filter((id) => !columnPinning[id]),
  end: columnIds.filter((id) => columnPinning[id] === 'end'),
};

/** column groups for the pinned-start-end-column-groups page */
export const columnGroups = {
  pinnedStartGroup: { header: 'Pinned start group' },
  outer: { header: 'Outer' },
  inner: { header: 'Inner', columnGroup: 'outer' },
  pinnedEndGroup: { header: 'Pinned end group' },
};

export const columnGroupOf: Record<string, string> = {
  c0: 'pinnedStartGroup',
  c7: 'pinnedStartGroup',
  c1: 'inner',
  c2: 'inner',
  c4: 'outer',
  c5: 'outer',
  c3: 'pinnedEndGroup',
  c19: 'pinnedEndGroup',
};

export function getColumns(options?: { withGroups?: boolean }) {
  return Object.fromEntries(
    columnIds.map((id) => [
      id,
      {
        field: id,
        header: id.toUpperCase(),
        defaultWidth: columnWidth(id),
        ...(options?.withGroups && columnGroupOf[id]
          ? { columnGroup: columnGroupOf[id] }
          : {}),
      },
    ]),
  );
}
