export type Developer = {
  id: number;
  firstName: string;
  stack: string;
};

export const data: Developer[] = [
  { id: 1, firstName: 'John', stack: 'frontend' },
  { id: 2, firstName: 'Marry', stack: 'frontend' },
  { id: 3, firstName: 'Bill', stack: 'frontend' },
  { id: 4, firstName: 'Mark', stack: 'backend' },
  { id: 5, firstName: 'Matthew', stack: 'backend' },
];

type FilterFnParam = { currentValue: unknown; filterValue: unknown };

export const textOperators = [
  {
    name: 'startsWith',
    fn: ({ currentValue, filterValue }: FilterFnParam) =>
      String(currentValue).startsWith(String(filterValue)),
  },
  {
    name: 'endsWith',
    fn: ({ currentValue, filterValue }: FilterFnParam) =>
      String(currentValue).endsWith(String(filterValue)),
  },
];

export const stackOperatorFns = {
  is: ({ currentValue, filterValue }: FilterFnParam) =>
    currentValue === filterValue,
  isNot: ({ currentValue, filterValue }: FilterFnParam) =>
    currentValue !== filterValue,
};
