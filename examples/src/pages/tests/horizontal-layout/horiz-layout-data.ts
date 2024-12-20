export type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  monthlyBonus: number;
  age: number;
};
export const dataSource: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    country: 'USA',
    city: 'New York',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'MERN',
    canDesign: 'yes',
    hobby: 'Photography',
    salary: 95000,
    monthlyBonus: 1000,
    age: 28,
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    country: 'UK',
    city: 'London',
    currency: 'GBP',
    preferredLanguage: 'Python',
    stack: 'Django',
    canDesign: 'no',
    hobby: 'Hiking',
    salary: 85000,
    monthlyBonus: 800,
    age: 32,
  },
  {
    id: 3,
    firstName: 'Alex',
    lastName: 'Johnson',
    country: 'Canada',
    city: 'Toronto',
    currency: 'CAD',
    preferredLanguage: 'Java',
    stack: 'Spring',
    canDesign: 'yes',
    hobby: 'Chess',
    salary: 90000,
    monthlyBonus: 950,
    age: 35,
  },
  {
    id: 4,
    firstName: 'Maria',
    lastName: 'Garcia',
    country: 'Spain',
    city: 'Barcelona',
    currency: 'EUR',
    preferredLanguage: 'TypeScript',
    stack: 'MEAN',
    canDesign: 'yes',
    hobby: 'Painting',
    salary: 78000,
    monthlyBonus: 700,
    age: 29,
  },
  {
    id: 5,
    firstName: 'Yuki',
    lastName: 'Tanaka',
    country: 'Japan',
    city: 'Tokyo',
    currency: 'JPY',
    preferredLanguage: 'Ruby',
    stack: 'Ruby on Rails',
    canDesign: 'no',
    hobby: 'Origami',
    salary: 88000,
    monthlyBonus: 900,
    age: 31,
  },
  {
    id: 6,
    firstName: 'Lars',
    lastName: 'Andersen',
    country: 'Denmark',
    city: 'Copenhagen',
    currency: 'DKK',
    preferredLanguage: 'C#',
    stack: '.NET',
    canDesign: 'no',
    hobby: 'Cycling',
    salary: 92000,
    monthlyBonus: 1100,
    age: 38,
  },
  {
    id: 7,
    firstName: 'Priya',
    lastName: 'Patel',
    country: 'India',
    city: 'Mumbai',
    currency: 'INR',
    preferredLanguage: 'Go',
    stack: 'Microservices',
    canDesign: 'yes',
    hobby: 'Yoga',
    salary: 75000,
    monthlyBonus: 600,
    age: 27,
  },
  {
    id: 8,
    firstName: 'Mohamed',
    lastName: 'Ali',
    country: 'Egypt',
    city: 'Cairo',
    currency: 'EGP',
    preferredLanguage: 'PHP',
    stack: 'Laravel',
    canDesign: 'no',
    hobby: 'Reading',
    salary: 70000,
    monthlyBonus: 500,
    age: 33,
  },
  {
    id: 9,
    firstName: 'Sophie',
    lastName: 'Martin',
    country: 'France',
    city: 'Paris',
    currency: 'EUR',
    preferredLanguage: 'Swift',
    stack: 'iOS',
    canDesign: 'yes',
    hobby: 'Cooking',
    salary: 86000,
    monthlyBonus: 850,
    age: 30,
  },
  {
    id: 10,
    firstName: 'Lucas',
    lastName: 'Silva',
    country: 'Brazil',
    city: 'São Paulo',
    currency: 'BRL',
    preferredLanguage: 'Kotlin',
    stack: 'Android',
    canDesign: 'no',
    hobby: 'Surfing',
    salary: 72000,
    monthlyBonus: 550,
    age: 26,
  },
  {
    id: 11,
    firstName: 'Emma',
    lastName: 'Wilson',
    country: 'Australia',
    city: 'Sydney',
    currency: 'AUD',
    preferredLanguage: 'Rust',
    stack: 'WebAssembly',
    canDesign: 'yes',
    hobby: 'Gardening',
    salary: 94000,
    monthlyBonus: 1050,
    age: 36,
  },
  {
    id: 12,
    firstName: 'Rajesh',
    lastName: 'Kumar',
    country: 'Singapore',
    city: 'Singapore',
    currency: 'SGD',
    preferredLanguage: 'Scala',
    stack: 'Akka',
    canDesign: 'no',
    hobby: 'Meditation',
    salary: 98000,
    monthlyBonus: 1200,
    age: 40,
  },
  {
    id: 13,
    firstName: 'Anna',
    lastName: 'Kowalski',
    country: 'Poland',
    city: 'Warsaw',
    currency: 'PLN',
    preferredLanguage: 'Elixir',
    stack: 'Phoenix',
    canDesign: 'yes',
    hobby: 'Dancing',
    salary: 76000,
    monthlyBonus: 650,
    age: 29,
  },
  {
    id: 14,
    firstName: 'Chen',
    lastName: 'Wei',
    country: 'China',
    city: 'Shanghai',
    currency: 'CNY',
    preferredLanguage: 'Dart',
    stack: 'Flutter',
    canDesign: 'yes',
    hobby: 'Calligraphy',
    salary: 80000,
    monthlyBonus: 750,
    age: 28,
  },
  {
    id: 15,
    firstName: 'Liam',
    lastName: "O'Connor",
    country: 'Ireland',
    city: 'Dublin',
    currency: 'EUR',
    preferredLanguage: 'Haskell',
    stack: 'Functional',
    canDesign: 'no',
    hobby: 'Music',
    salary: 88000,
    monthlyBonus: 900,
    age: 34,
  },
];
