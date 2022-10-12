export type Employee = {
  id: number;
  firstName: string;
  country: string;
};

export const dataSource = () => {
  return Promise.resolve([
    {
      firstName: 'John',
      country: 'usa',
      id: 1,
    },
    {
      firstName: 'Ioannes',
      country: 'it',
      id: 2,
    },

    {
      firstName: 'Bob',
      country: 'usa',
      id: 2,
    },
  ] as Employee[]);
};
