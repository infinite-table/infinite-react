import faker from 'faker';

const fs = require('fs');
const path = require('path');

import lstOfCountries from 'all-countries-and-cities-json/countries.json';
import countriesWithCodes from './countries.json';

const allowedCountries = new Set<string>([
  'Argentina',
  'Australia',
  'Brazil',
  'Canada',
  'China',
  'France',
  'Germany',
  'India',
  'Indonesia',
  'Italy',
  'Japan',
  'Republic of Korea',
  'Mexico',
  'Russia',
  'Saudi Arabia',
  'South Africa',
  'Turkey',
  'Sweden',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Spain',
]);
const listOfCountries = Object.keys(lstOfCountries).reduce(
  (acc, country: string) => {
    if (allowedCountries.has(country)) {
      //@ts-ignore
      acc[country] = lstOfCountries[country];
    }
    return acc;
  },
  {} as Record<string, any>,
);

const languages = [
  'JavaScript',
  'TypeScript',
  'Python',
  'C#',
  'Java',
  'Ruby',
  'PHP',
  'Rust',
  'Go',
];

const reposCount = [1, 5, 7, 10, 12, 24, 35];
const followersCount = ['0-1k', '1k-10k', '10k-50k', '50k-100k', '100k +'];
const hobbies = ['photography', 'cooking', 'dancing', 'reading', 'sports'];
const stacks = ['frontend', 'backend', 'full-stack'];
const designerSkills = ['yes', 'no'];

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
  return Math.floor(Math.random() * (max - min + 1) + min);
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

const salaries = [
  100_000, 200_000, 120_000, 300_000, 400_000, 500_000, 100_000, 90_000, 50_000,
  60_000,
];

const salaryOffsets = [1000, 2000, 3000, 0];

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
      streetPrefix: faker.address.streetSuffix(),
      streetNo: faker.datatype.number(1000),
      age: getRandomFrom(ages),
      currency: getRandomFrom(currencies),
      preferredLanguage: getRandomFrom(languages),
      reposCount: getRandomFrom(reposCount),
      stack: getRandomFrom(stacks),
      canDesign: getRandomFrom(designerSkills),
      salary: getRandomFrom(salaries) - getRandomFrom(salaryOffsets),
      hobby: getRandomFrom(hobbies),
    };

    result.email = faker.internet.email(result.firstName, result.lastName);

    return result;
  });
};

export function write<T>(obj: any, file: string) {
  fs.writeFileSync(
    path.resolve(process.cwd(), file),
    JSON.stringify(obj, null, 2),
  );
}
