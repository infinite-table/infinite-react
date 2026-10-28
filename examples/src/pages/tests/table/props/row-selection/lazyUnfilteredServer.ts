export type Developer = {
  id: number;
  firstName: string;
  preferredLanguage: string;
  stack: string;
};

const rows: Developer[] = [
  { id: 1, firstName: 'Nya', preferredLanguage: 'TypeScript', stack: 'frontend' },
  { id: 2, firstName: 'Axel', preferredLanguage: 'JavaScript', stack: 'frontend' },
  { id: 3, firstName: 'Gonzalo', preferredLanguage: 'TypeScript', stack: 'backend' },
  { id: 4, firstName: 'Sherwood', preferredLanguage: 'Java', stack: 'backend' },
  { id: 5, firstName: 'Mark', preferredLanguage: 'Java', stack: 'backend' },
  { id: 6, firstName: 'Alex', preferredLanguage: 'Kotlin', stack: 'mobile' },
];

/**
 * A server that applies the filter and also sends the counts without it
 */
export const lazyUnfilteredDataSource = ({
  groupBy,
  groupKeys = [],
  filterValue,
}: {
  groupBy?: { field?: unknown }[];
  groupKeys?: any[];
  filterValue?: { field?: unknown; filter: { value: any } }[];
}): Promise<any> => {
  const matches = (row: Developer) =>
    (filterValue ?? []).every(
      (item) => row[item.field as keyof Developer] === item.filter.value,
    );
  const visible = rows.filter(matches);
  const inStack = (stack: string) => (row: Developer) => row.stack === stack;

  if (!groupBy?.length || groupKeys.length) {
    const [stack] = groupKeys;
    const all = stack ? rows.filter(inStack(stack)) : rows;
    const data = stack ? visible.filter(inStack(stack)) : visible;
    return Promise.resolve({
      data,
      totalCount: data.length,
      totalCountUnfiltered: all.length,
    });
  }

  const stacks = [...new Set(visible.map((row) => row.stack))].sort();
  return Promise.resolve({
    data: stacks.map((stack) => ({
      keys: [stack],
      data: { stack },
      totalChildrenCount: visible.filter(inStack(stack)).length,
      totalChildrenCountUnfiltered: rows.filter(inStack(stack)).length,
    })),
    totalCount: stacks.length,
    totalChildrenCount: visible.length,
    totalChildrenCountUnfiltered: rows.length,
  });
};

export const lazyUnfilteredColumns = {
  checkbox: { renderSelectionCheckBox: true, defaultWidth: 80 },
  id: { field: 'id' as const },
  firstName: { field: 'firstName' as const },
  preferredLanguage: { field: 'preferredLanguage' as const },
  stack: { field: 'stack' as const },
};

export const lazyUnfilteredFilterValue = [
  {
    field: 'preferredLanguage' as const,
    filter: { type: 'string', operator: 'eq', value: 'TypeScript' },
  },
];
