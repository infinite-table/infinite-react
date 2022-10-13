export const employees = [
  {
    id: 0,
    companyName: 'Dibbert - Mitchell',
    companySize: '0 - 10',
    firstName: 'Jonathon',
    lastName: 'Roberts',
    country: 'Austria',
    countryCode: 'AT',
    city: 'Enzersdorf an der Fischa',
    streetName: 'Streich Branch',
    streetNo: 640,
    age: 20,
    department: 'Management',
    team: 'TeamManagement',
    salary: 118000,
    email: 'Jonathon_Roberts94@hotmail.com',
  },
  {
    id: 1,
    companyName: 'Schuster, Towne and Schmidt',
    companySize: '100 - 1000',
    firstName: 'Trevor',
    lastName: 'Hansen',
    country: 'Martinique',
    countryCode: 'MQ',
    city: 'Case-Pilote',
    streetName: 'Konopelski Mountain',
    streetPrefix: 'Path',
    streetNo: 648,
    age: 52,
    department: 'Marketing',
    team: 'telemarketing',
    salary: 59000,
    email: 'Trevor_Hansen54@hotmail.com',
  },
  {
    id: 2,
    companyName: 'Ankunding and Sons',
    companySize: '100 - 1000',
    firstName: 'Margret',
    lastName: 'Douglas',
    country: 'Hungary',
    countryCode: 'HU',
    city: 'Nagymagocs',
    streetName: 'Ellen Passage',
    streetPrefix: 'Springs',
    streetNo: 835,
    age: 46,
    department: 'Executive',
    team: 'ExecutivePlanning',
    salary: 217000,
    email: 'Margret35@yahoo.com',
  },
  {
    id: 3,
    companyName: 'Volkman LLC',
    companySize: '10 - 100',
    firstName: 'Deon',
    lastName: 'MacGyver',
    country: 'Cuba',
    countryCode: 'CU',
    city: 'La Habana',
    streetName: 'Antonina Courts',
    streetPrefix: 'Inlet',
    streetNo: 249,
    age: 18,
    department: 'IT',
    team: 'infrastructure',
    salary: 117000,
    email: 'Deon_MacGyver21@yahoo.com',
  },
  {
    id: 4,
    companyName: 'McCullough, Hane and Koelpin',
    companySize: '0 - 10',
    firstName: 'Flossie',
    lastName: 'DuBuque',
    country: 'New Caledonia',
    countryCode: 'NC',
    city: 'Paita',
    streetName: 'Aimee Pine',
    streetPrefix: 'Ways',
    streetNo: 176,
    age: 40,
    department: 'Management',
    team: 'TeamManagement',
    salary: 120000,
    email: 'Flossie.DuBuque@hotmail.com',
  },
  {
    id: 5,
    companyName: 'Lesch, Jaskolski and Aufderhar',
    companySize: '1000 - 10000',
    firstName: 'Sammy',
    lastName: 'Sporer',
    country: 'Sri Lanka',
    countryCode: 'LK',
    city: 'Talapathpitiya',
    streetName: 'Cartwright Keys',
    streetPrefix: 'Plains',
    streetNo: 620,
    age: 24,
    department: 'Support',
    team: 'chat-support',
    salary: 49000,
    email: 'Sammy85@hotmail.com',
  },
  {
    id: 6,
    companyName: 'Purdy - Hansen',
    companySize: '10 - 100',
    firstName: 'Norris',
    lastName: 'Rath',
    country: 'El Salvador',
    countryCode: 'SV',
    city: 'La Libertad',
    streetName: 'Kemmer Cliff',
    streetPrefix: 'Via',
    streetNo: 760,
    age: 35,
    department: 'Sales',
    team: 'telesales',
    salary: 48000,
    email: 'Norris88@gmail.com',
  },
  {
    id: 7,
    companyName: 'Reichert Inc',
    companySize: '10 - 100',
    firstName: 'Jonathon',
    lastName: 'Tillman',
    country: 'Armenia',
    countryCode: 'AM',
    city: 'Yerevan',
    streetName: 'Schmidt Mountain',
    streetPrefix: 'Crescent',
    streetNo: 546,
    age: 58,
    department: 'Management',
    team: 'MidLevel',
    salary: 148000,
    email: 'Jonathon_Tillman79@gmail.com',
  },
  {
    id: 8,
    companyName: 'Block Inc',
    companySize: '1000 - 10000',
    firstName: 'Cleo',
    lastName: 'Ebert',
    country: 'Cuba',
    countryCode: 'CU',
    city: 'Havana',
    streetName: 'Scotty Stravenue',
    streetPrefix: 'Causeway',
    streetNo: 147,
    age: 38,
    department: 'Management',
    team: 'MicroManagement',
    salary: 98000,
    email: 'Cleo.Ebert55@yahoo.com',
  },
  {
    id: 9,
    companyName: 'Volkman LLC',
    companySize: '10 - 100',
    firstName: 'Julianne',
    lastName: 'Pollich',
    country: 'Swaziland',
    countryCode: 'SZ',
    city: 'Lobamba',
    streetName: 'Harmony Locks',
    streetPrefix: 'Flats',
    streetNo: 44,
    age: 52,
    department: 'Support',
    team: 'live-support',
    salary: 88000,
    email: 'Julianne15@gmail.com',
  },
] as Employee[];

export type Employee = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
  streetName: string;
  streetNo: number;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};