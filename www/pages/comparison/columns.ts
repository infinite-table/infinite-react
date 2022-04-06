/**
 * Devexpress row hight cannot be changed only with css.
 */
export const ROW_HEIGHT = 34;
export const COLUMN_WIDTH = 150;
export const COLUMN_GROUP_WIDTH = 150;

const getRandomColumns = (numberOfCOlumns: number) => {
  return Array(numberOfCOlumns)
    .fill(0)
    .map((_, index) => {
      return {
        field: `Gen Col. ${index}`,
        getValue: () => index,
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
