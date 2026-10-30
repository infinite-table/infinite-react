export type Developer = {
  id: number;
  firstName: string;
  stack: string;
};

// 6 rows in 3 groups, so the row count and the group count are different
const rows: Developer[] = [
  { id: 1, firstName: 'Nya', stack: 'frontend' },
  { id: 2, firstName: 'Axel', stack: 'frontend' },
  { id: 3, firstName: 'Gonzalo', stack: 'backend' },
  { id: 4, firstName: 'Sherwood', stack: 'backend' },
  { id: 5, firstName: 'Mark', stack: 'backend' },
  { id: 6, firstName: 'Alex', stack: 'mobile' },
];

const stacks = [...new Set(rows.map((row) => row.stack))].sort();

// the server filters out one more row in each group
const hiddenRowsPerGroup = 1;

export const lazyRowCount = {
  rows: rows.length,
  groups: stacks.length,
  unfilteredRows: rows.length + stacks.length * hiddenRowsPerGroup,
};

/**
 * A server that counts the rows of each group, and - with `withRootCount` - of the whole top level.
 * With `withRootCount`, it also sends the counts without its filter.
 */
export const getLazyRowCountDataSource =
  (withRootCount: boolean) =>
  ({
    groupBy,
    groupKeys = [],
  }: {
    groupBy?: { field?: unknown }[];
    groupKeys?: any[];
  }): Promise<any> => {
    if (!groupBy?.length || groupKeys.length) {
      const [stack] = groupKeys;
      const data = stack ? rows.filter((row) => row.stack === stack) : rows;
      const totalCountUnfiltered = stack
        ? data.length + hiddenRowsPerGroup
        : lazyRowCount.unfilteredRows;
      return Promise.resolve({
        data,
        totalCount: data.length,
        ...(withRootCount ? { totalCountUnfiltered } : {}),
      });
    }

    return Promise.resolve({
      data: stacks.map((stack) => {
        const totalChildrenCount = rows.filter((row) => row.stack === stack).length;
        return {
          keys: [stack],
          data: { stack },
          totalChildrenCount,
          ...(withRootCount
            ? { totalChildrenCountUnfiltered: totalChildrenCount + hiddenRowsPerGroup }
            : {}),
        };
      }),
      totalCount: stacks.length,
      ...(withRootCount
        ? {
            totalChildrenCount: rows.length,
            totalChildrenCountUnfiltered: lazyRowCount.unfilteredRows,
          }
        : {}),
    });
  };

export const lazyRowCountColumns = {
  id: { field: 'id' as const },
  firstName: { field: 'firstName' as const },
  stack: { field: 'stack' as const },
};
