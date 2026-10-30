export type Developer = {
  id: number;
  name: string;
  country: string;
  age: number;
};

export const developers: Developer[] = [
  { id: 1, name: 'Bob', country: 'USA', age: 30 },
  { id: 2, name: 'Alice', country: 'France', age: 25 },
  { id: 3, name: 'Carl', country: 'USA', age: 40 },
  { id: 4, name: 'Dana', country: 'France', age: 35 },
  { id: 5, name: 'Eve', country: 'Germany', age: 28 },
];
