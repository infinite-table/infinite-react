export type Person = {
  firstName: string;
  country: string;
  city: string;
  region: string;
  streetName: string;
  streetNo: number;
  phone: string;
  email: string;
  id: number;
};

export const rowData: Person[] = [
  {
    id: 0,
    firstName: 'Bob',
    country: 'USA',
    city: 'NY',
    region: 'NY',
    email: 'bob@usa.com',
    phone: '03(55)435 555',
    streetName: 'Robinsons',
    streetNo: 5,
  },
  {
    id: 1,
    firstName: 'Emily',
    country: 'France',
    city: 'Lyon',
    region: 'Lyon region',
    email: 'emily@fr.com',
    phone: '03(25)438 123',
    streetName: 'Blanche',
    streetNo: 509,
  },
  {
    id: 2,
    firstName: 'Roberto',
    country: 'Italy',
    city: 'Rome',
    region: 'Rome region',
    email: 'roby@verita.com',
    phone: '03(5)128 999',
    streetName: 'Viva',
    streetNo: 9,
  },
  {
    id: 3,
    firstName: 'Mario',
    country: 'Italy',
    city: 'Milano',
    region: 'North of Italy',
    email: 'mario@verita.com',
    phone: '03(5)777 456',
    streetName: 'Vila Milanese',
    streetNo: 99,
  },
  {
    id: 4,
    firstName: 'Marina',
    country: 'Italy',
    region: 'North of Italy',
    city: 'Venice',
    email: 'marina@venice.com',
    phone: '03(5)765 123',
    streetName: 'Aqua Alta',
    streetNo: 19,
  },
];
