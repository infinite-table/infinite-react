export const numberComparator = function (
  first: number,
  second: number,
): number {
  return first - second;
};

export const stringComparator = function (
  first: string,
  second: string,
): number {
  first = `${first}`;
  second = `${second}`;

  return first.localeCompare(second);
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
