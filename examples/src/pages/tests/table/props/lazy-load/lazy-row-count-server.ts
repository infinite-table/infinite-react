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

export const lazyRowCount = {
  rows: rows.length,
  groups: new Set(rows.map((row) => row.stack)).size,
};

/**
 * A server that counts the rows of each group, and - with `withRootCount` - of the whole top level
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
      return Promise.resolve({ data, totalCount: data.length });
    }

    const stacks = [...new Set(rows.map((row) => row.stack))].sort();
    return Promise.resolve({
      data: stacks.map((stack) => ({
        keys: [stack],
        data: { stack },
        totalChildrenCount: rows.filter((row) => row.stack === stack).length,
      })),
      totalCount: stacks.length,
      ...(withRootCount ? { totalChildrenCount: rows.length } : {}),
    });
  };

export const lazyRowCountColumns = {
  id: { field: 'id' as const },
  firstName: { field: 'firstName' as const },
  stack: { field: 'stack' as const },
};
