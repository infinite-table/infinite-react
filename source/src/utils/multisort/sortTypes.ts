const sortTypes: {
  [key: string]: (first: any, second: any) => number;
} = {
  number: function (first: number, second: number): number {
    return first - second;
  },
  string: function (first: string, second: string): number {
    first = `${first}`;
    second = `${second}`;

    return first.localeCompare(second);
  },
};

export default sortTypes;
