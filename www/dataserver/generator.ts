import faker from 'faker';

const fs = require('fs');
const path = require('path');

import listOfCountries from 'all-countries-and-cities-json/countries.json';
import countriesWithCodes from './countries.json';
import { getRandomDate } from './developers-generator';

const countriesWithCodesMap = countriesWithCodes.reduce((acc, c) => {
  acc.set(c.name, c.code);
  return acc;
}, new Map<string, string>());

type Country = {
  name: string;
  cities: { city: string; streetNames: string[] }[];
  code: string;
};

const countriesMapByName = new Map<string, Country>();

const countries: Country[] = Object.keys(listOfCountries)
  .map((k) => {
    let cities = (listOfCountries as any)[k] as string[];

    // make the cities list shorter, so they repeat
    const citiesSize: number = getRandomFrom([4, 8, 10, 6]);

    const citiesWithAddress = [...Array(citiesSize)].map(() => {
      const streetNameSize = getRandomFrom([2, 8, 4, 6]);
      const streetNames = [...Array(streetNameSize)].map(() =>
        faker.address.streetName(),
      );

      return {
        city: getRandomFrom(cities),
        streetNames,
      };
    });
    return {
      name: k,
      cities: citiesWithAddress,
      code: countriesWithCodesMap.get(k)!,
    };
  })
  .filter((c) => {
    if (c.code) {
      countriesMapByName.set(c.name, c);
    }
    return !!c.code;
  });

export type Employee = {
  company: string;
  country: string;
  countryCode: string;
};

function getRandomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max + 1));
}

function getRandomFrom<T>(array: T[]) {
  return array[getRandomInt(0, array.length - 1)];
}

const companySizes = [10, 100, 1000, 10_000];
const ages = [18, 18, 24, 20, 26, 29, 35, 38, 40, 46, 50, 52, 58];
const currencies = ['USD', 'GBP', 'EUR', 'JPY', 'AUD', 'CHF'];

const availableCompanies = [...Array(20)].map(() => {
  const companySize = getRandomFrom(companySizes);
  const prevSize = companySizes[companySizes.indexOf(companySize) - 1] || 0;

  return {
    companyName: faker.company.companyName(),
    companySize: `${prevSize} - ${companySize}`,
  };
});

const availableCountries = countries.map((c) => {
  return {
    country: c.name,
    countryCode: c.code,
  };
});

const departments = [
  {
    name: 'IT',
    teams: [
      { name: 'backend', maxSalary: 100_000 },
      { name: 'frontend', maxSalary: 120_000 },
      { name: 'devops', maxSalary: 130_000 },
      { name: 'tooling', maxSalary: 200_000 },
      { name: 'deployments', maxSalary: 90_000 },
      { name: 'infrastructure', maxSalary: 120_000 },
      { name: 'database', maxSalary: 120_000 },
      { name: 'recovery', maxSalary: 100_000 },
    ],
  },
  {
    name: 'Sales',
    teams: [
      { name: 'b2b', maxSalary: 90_000 },
      { name: 'b2c', maxSalary: 50_000 },
      { name: 'telesales', maxSalary: 50_000 },
      { name: 'phonesales', maxSalary: 50_000 },
    ],
  },
  {
    name: 'Marketing',
    teams: [
      { name: 'online-marketing', maxSalary: 90_000 },
      { name: 'print-marketing', maxSalary: 60_000 },
      { name: 'telemarketing', maxSalary: 60_000 },
    ],
  },
  {
    name: 'Executive',
    teams: [
      { name: 'ExecutiveOperations', maxSalary: 200_000 },
      { name: 'ExecutivePlanning', maxSalary: 220_000 },
    ],
  },
  {
    name: 'Management',
    teams: [
      {
        name: 'TopLevel',
        maxSalary: 200_000,
      },
      { name: 'MidLevel', maxSalary: 150_000 },
      { name: 'TeamManagement', maxSalary: 120_000 },
      { name: 'MicroManagement', maxSalary: 100_000 },
    ],
  },
  {
    name: 'Support',
    teams: [
      { name: 'on-call-support', maxSalary: 80_000 },
      { name: 'day-support', maxSalary: 50_000 },
      { name: 'live-support', maxSalary: 90_000 },
      { name: 'chat-support', maxSalary: 50_000 },
    ],
  },
];

const salaryOffsets = [1000, 2000, 3000, 0];
function getDepartmentAndTeam() {
  const department = getRandomFrom(departments);

  const team = getRandomFrom(department.teams);
  return {
    department: department.name,
    team: team.name,
    salary: team.maxSalary - getRandomFrom(salaryOffsets),
  };
}

export const generate = (size: number) => {
  const lastNames = [...Array(Math.floor(size / 5))].map(() =>
    faker.name.lastName(),
  );

  return [...Array(size)].map((_, _index) => {
    const country = getRandomFrom(availableCountries);

    const city = countriesMapByName.get(country.country)
      ? getRandomFrom(countriesMapByName.get(country.country)?.cities || [])
      : null;
    const streetName =
      getRandomFrom(city?.streetNames || []) ?? faker.address.streetName;
    const result: any = {
      id: _index,
      ...getRandomFrom(availableCompanies),
      firstName: faker.name.firstName(),
      lastName: getRandomFrom(lastNames),
      ...country,
      city: city?.city,
      streetName,
      birthDate: getRandomDate(-50, -20),
      hireDate: getRandomDate(-5, -1, true),
      streetPrefix: faker.address.streetSuffix(),
      streetNo: faker.datatype.number(1000),
      age: getRandomFrom(ages),
      currency: getRandomFrom(currencies),

      ...getDepartmentAndTeam(),
    };

    result.email = faker.internet.email(result.firstName, result.lastName);

    return result;
  });
};

export function write(obj: any, file: string) {
  const filePath = path.resolve(process.cwd(), file);

  const current = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (current.developers) {
    current.developers.map;
  }
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}
