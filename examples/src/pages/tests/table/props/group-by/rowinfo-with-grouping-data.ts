export type Person = {
  id: number;
  country: string;
  city: string;
  firstName: string;
};

export const data = [
  {
    id: 1,
    country: 'Italy',
    city: 'Rome',
    firstName: 'Giuseppe',
  },
  {
    id: 2,
    country: 'Italy',
    city: 'Rome',
    firstName: 'Marco',
  },
  {
    id: 3,
    country: 'Italy',
    city: 'Napoli',
    firstName: 'Luca',
  },
  {
    id: 4,
    country: 'USA',
    city: 'LA',
    firstName: 'Bob',
  },
] as Person[];
