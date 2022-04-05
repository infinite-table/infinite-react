function getRandomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max + 1));
}

const getRandomColumns = (numberOfCOlumns: number) => {
  return Array(numberOfCOlumns)
    .fill(0)
    .map((_, index) => {
      return {
        field: `Gen Col. ${index}`,
        getValue: () => getRandomInt(0, 100),
      };
    });
};

export const columns: {
  field?: string;
  getValue?: (data: any) => any;
  header?: string;
  group?: boolean;
}[] = [
  { field: 'firstName' },
  { field: 'lastName' },
  { field: 'country' },
  { field: 'city', group: true },
  { field: 'currency' },
  { field: 'preferredLanguage' },
  { field: 'stack' },
  { field: 'canDesign' },
  { field: 'hobby' },
  { field: 'salary' },
  { field: 'age' },
  { field: 'streetName' },
  { field: 'streetNo' },
  { field: 'streetPrefix' },
  {
    header: 'Full Name',
    getValue: (data: any) =>
      `${data.firstName} ${data.lastName}`,
  },
  {
    header: 'Full Address',
    getValue: (data: any) =>
      `${data.streetName} ${data.streetNo} ${data.streetPrefix}`,
  },
  ...getRandomColumns(100),
];
