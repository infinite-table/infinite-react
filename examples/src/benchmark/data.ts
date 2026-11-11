/**
 * Shared, deterministic dataset for the AG Grid vs Infinite Table benchmark.
 *
 * Both benchmark pages import this exact module, so both grids receive the
 * same rows (same values, same order, same object shape). `getDataChecksum`
 * lets the Playwright spec assert that.
 */

// each size has its own pair of pages: /benchmark/<grid>-<size>
export const BENCH_SIZES = {
  '300k': 300_000,
  '1m': 1_000_000,
} as const;
export type BenchSize = keyof typeof BENCH_SIZES;

// keep these identical in both grids - the spec relies on them for
// computing "which row/column should be at this pixel"
export const BENCH_ROW_HEIGHT = 40;
export const BENCH_HEADER_HEIGHT = 40;
export const BENCH_COLUMN_WIDTH = 150;
export const BENCH_GRID_WIDTH = 1200;
export const BENCH_GRID_HEIGHT = 800;

export type BenchRow = {
  id: number;
  /**
   * random lowercase a-z string - used for the string sort scenario.
   * a-z only so `<` (AG Grid default) and `localeCompare` (Infinite
   * default) produce the same order and the expected result is unambiguous
   */
  code: string;
  firstName: string;
  lastName: string;
  department: string;
  team: string;
  country: string;
  city: string;
  age: number;
  salary: number;
  bonus: number;
  rating: number;
  startYear: number;
  level: string;
  project: string;
  status: string;
  priority: string;
  score: number;
  hours: number;
  region: string;
};

export type BenchColumnType = 'number' | 'string';

export type BenchColumn = {
  field: keyof BenchRow;
  header: string;
  type: BenchColumnType;
};

export const BENCH_COLUMNS: BenchColumn[] = [
  // id, code and salary are used by the sort scenarios - keep them in the
  // visible part of the grid, the headers are clicked
  { field: 'id', header: 'Id', type: 'number' },
  { field: 'code', header: 'Code', type: 'string' },
  { field: 'salary', header: 'Salary', type: 'number' },
  { field: 'firstName', header: 'First Name', type: 'string' },
  { field: 'lastName', header: 'Last Name', type: 'string' },
  { field: 'department', header: 'Department', type: 'string' },
  { field: 'team', header: 'Team', type: 'string' },
  { field: 'country', header: 'Country', type: 'string' },
  { field: 'city', header: 'City', type: 'string' },
  { field: 'age', header: 'Age', type: 'number' },
  { field: 'bonus', header: 'Bonus', type: 'number' },
  { field: 'rating', header: 'Rating', type: 'number' },
  { field: 'startYear', header: 'Start Year', type: 'number' },
  { field: 'level', header: 'Level', type: 'string' },
  { field: 'project', header: 'Project', type: 'string' },
  { field: 'status', header: 'Status', type: 'string' },
  { field: 'priority', header: 'Priority', type: 'string' },
  { field: 'score', header: 'Score', type: 'number' },
  { field: 'hours', header: 'Hours', type: 'number' },
  { field: 'region', header: 'Region', type: 'string' },
];

// mulberry32 - tiny, fast, seedable PRNG
function createRandom(seed: number) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'Liam',
  'Olivia',
  'Noah',
  'Emma',
  'Oliver',
  'Ava',
  'Elijah',
  'Sophia',
  'James',
  'Isabella',
  'William',
  'Mia',
  'Benjamin',
  'Charlotte',
  'Lucas',
  'Amelia',
  'Henry',
  'Harper',
  'Theodore',
  'Evelyn',
  'Jack',
  'Abigail',
  'Levi',
  'Emily',
  'Alexander',
  'Ella',
  'Mateo',
  'Elizabeth',
  'Daniel',
  'Camila',
  'Michael',
  'Luna',
  'Mason',
  'Sofia',
  'Sebastian',
  'Avery',
  'Ethan',
  'Mila',
  'Logan',
  'Aria',
  'Owen',
  'Scarlett',
  'Samuel',
  'Penelope',
];
const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
  'Walker',
  'Young',
  'Allen',
  'King',
];
const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'Finance',
  'Support',
  'Legal',
  'Operations',
  'Product',
  'Design',
  'HR',
];
const TEAMS = [
  'Alpha',
  'Bravo',
  'Charlie',
  'Delta',
  'Echo',
  'Foxtrot',
  'Golf',
  'Hotel',
  'India',
  'Juliet',
  'Kilo',
  'Lima',
];
const COUNTRIES_AND_CITIES: [string, string[]][] = [
  ['USA', ['New York', 'Chicago', 'Austin', 'Seattle', 'Boston']],
  ['Germany', ['Berlin', 'Munich', 'Hamburg', 'Cologne']],
  ['France', ['Paris', 'Lyon', 'Marseille', 'Nice']],
  ['Romania', ['Cluj-Napoca', 'Bucharest', 'Iasi', 'Timisoara']],
  ['UK', ['London', 'Manchester', 'Leeds', 'Bristol']],
  ['Spain', ['Madrid', 'Barcelona', 'Valencia', 'Seville']],
  ['Japan', ['Tokyo', 'Osaka', 'Kyoto', 'Nagoya']],
  ['Brazil', ['Sao Paulo', 'Rio', 'Brasilia', 'Recife']],
  ['India', ['Mumbai', 'Delhi', 'Bangalore', 'Pune']],
  ['Canada', ['Toronto', 'Vancouver', 'Montreal', 'Ottawa']],
];
const LEVELS = ['Junior', 'Mid', 'Senior', 'Staff', 'Principal', 'Lead'];
const PROJECTS = [
  'Apollo',
  'Gemini',
  'Mercury',
  'Voyager',
  'Pioneer',
  'Artemis',
  'Orion',
  'Atlas',
  'Titan',
  'Juno',
];
const STATUSES = ['Active', 'On Leave', 'Remote', 'Onsite', 'Contractor'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const REGIONS = ['EMEA', 'APAC', 'NA', 'LATAM'];

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function generateBenchData(
  count: number,
  seed: number = 42,
): BenchRow[] {
  const random = createRandom(seed);
  const pick = <T>(arr: T[]): T => arr[Math.floor(random() * arr.length)];
  const int = (min: number, max: number) =>
    min + Math.floor(random() * (max - min + 1));

  const data: BenchRow[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const codeLength = int(6, 10);
    let code = '';
    for (let c = 0; c < codeLength; c++) {
      code += LETTERS[Math.floor(random() * 26)];
    }
    const [country, cities] = pick(COUNTRIES_AND_CITIES);

    data[i] = {
      id: i + 1,
      code,
      firstName: pick(FIRST_NAMES),
      lastName: pick(LAST_NAMES),
      department: pick(DEPARTMENTS),
      team: pick(TEAMS),
      country,
      city: pick(cities),
      age: int(20, 65),
      salary: round2(30_000 + random() * 170_000),
      bonus: round2(random() * 25_000),
      rating: round2(1 + random() * 4),
      startYear: int(1995, 2026),
      level: pick(LEVELS),
      project: pick(PROJECTS),
      status: pick(STATUSES),
      priority: pick(PRIORITIES),
      score: int(0, 1000),
      hours: round2(random() * 60),
      region: pick(REGIONS),
    };
  }

  return data;
}

/**
 * FNV-1a over every value of every row, in column order - used to prove both
 * pages render the exact same dataset
 */
export function getDataChecksum(data: BenchRow[]): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    for (let c = 0; c < BENCH_COLUMNS.length; c++) {
      const str = String(row[BENCH_COLUMNS[c].field]);
      for (let k = 0; k < str.length; k++) {
        hash ^= str.charCodeAt(k);
        hash = Math.imul(hash, 0x01000193);
      }
    }
  }
  return `${data.length}:${(hash >>> 0).toString(16)}`;
}
