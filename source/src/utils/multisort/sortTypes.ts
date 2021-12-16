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

const sortTypes: {
  [key: string]: (first: any, second: any) => number;
} = {
  number: numberComparator,
  string: stringComparator,
};

export default sortTypes;
