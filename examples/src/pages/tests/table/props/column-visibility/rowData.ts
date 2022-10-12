export type Car = {
  make: string;
  model: string;
  price: number;
  year: number;
  rating?: number;
  id: number | 'string';
};

export const rowData: Car[] = [
  {
    make: 'Toyota',
    model: 'Celica',
    price: 350,
    year: 2010,
    id: 11,
  },
  { make: 'Toyota', model: 'Yaris', price: 10, id: 12, year: 2011, rating: 1 },
  {
    make: 'Toyota',
    model: 'Corolla',
    price: 20,
    id: 13,
    year: 2010,
    rating: 2,
  },
  { make: 'Ford', model: 'Mondeo', price: 30, id: 14, year: 2010, rating: 3 },
  { make: 'Ford', model: 'Mondeo', price: 40, id: 15, year: 2017, rating: 4 },
  { make: 'Ford', model: 'Focus', price: 50, id: 16, year: 2016, rating: 5 },
  { make: 'Ford', model: 'Galaxy', price: 60, id: 17, year: 2017, rating: 6 },
  {
    make: 'Porsche',
    model: 'Boxter',
    price: 70,
    id: 18,
    year: 2011,
    rating: 7,
  },
  {
    make: 'Porsche',
    model: 'Mission',
    price: 80,
    id: 19,
    year: 2010,
    rating: 8,
  },
  {
    make: 'Mitsubbishi',
    model: 'Outlander',
    price: 90,
    id: 110,
    year: 2011,
    rating: 9,
  },
];
