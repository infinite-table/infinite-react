export interface Person {
  name: string;
  age: number;
  id: string | number;
}

export const persons: Person[] = [
  { name: 'first', age: 10, id: 1 },
  { name: 'second', age: 20, id: 2 },
];
