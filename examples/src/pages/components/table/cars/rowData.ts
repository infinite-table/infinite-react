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
    model: 'Celica Officia esse sit pariatur nulla.',
    price: 350,
    year: 2010,
    id: 1,
  },
  { make: 'Toyota', model: 'Yaris', price: 10, id: 2, year: 2011, rating: 1 },
  {
    make: 'Toyota',
    model: 'Corolla',
    price: 20,
    id: 3,
    year: 2010,
    rating: 2,
  },
  { make: 'Ford', model: 'Mondeo', price: 30, id: 4, year: 2010, rating: 3 },
  { make: 'Ford', model: 'Mondeo', price: 40, id: 5, year: 2017, rating: 4 },
  { make: 'Ford', model: 'Focus', price: 50, id: 6, year: 2016, rating: 5 },
  { make: 'Ford', model: 'Galaxy', price: 60, id: 7, year: 2017, rating: 6 },
  {
    make: 'Porsche',
    model: 'Boxter',
    price: 70,
    id: 8,
    year: 2011,
    rating: 7,
  },
  {
    make: 'Porsche',
    model: 'Mission',
    price: 80,
    id: 9,
    year: 2010,
    rating: 8,
  },
  {
    make: 'Mitsubbishi',
    model: 'Outlander',
    price: 90,
    id: 10,
    year: 2011,
    rating: 9,
  },

  {
    make: 'Mitsubbishi',
    model: 'Outlander',
    price: 100,
    id: 11,
    year: 2012,
    rating: 9,
  },
  { make: 'Ford', model: 'Puma', price: 50, id: 12, year: 2020, rating: 10 },
  { make: 'Ford', model: 'Puma', price: 50, id: 13, year: 2019, rating: 9 },
];
