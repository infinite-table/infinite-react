/*
 * Made-up market data for the homepage demos. Seeded, so every visit (and
 * the server render) sees the same rows.
 */

export type Instrument = {
  id: number;
  symbol: string;
  sector: string;
  region: string;
  price: number;
  changePct: number;
  volume: number;
};

export type Trade = {
  id: number;
  sector: string;
  region: string;
  pnl: number;
  notional: number;
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SECTORS = [
  'Technology',
  'Financials',
  'Health Care',
  'Energy',
  'Industrials',
  'Consumer Disc.',
  'Staples',
  'Materials',
  'Utilities',
  'Real Estate',
  'Comms',
];
const REGIONS = ['Americas', 'EMEA', 'APAC'];

const NAME_A = [
  'Apex',
  'Nova',
  'Silverline',
  'Atlas',
  'Quanta',
  'Beacon',
  'Falcon',
  'Orion',
  'Meridian',
  'Evergreen',
  'Sterling',
  'Keystone',
  'Cascade',
  'Summit',
  'Harbor',
  'Vertex',
];
const NAME_B = [
  'Robotics',
  'Energy',
  'Software',
  'Materials',
  'Medical',
  'Freight',
  'Networks',
  'Studios',
  'Health',
  'Foods',
  'Towers',
  'Assurance',
  'Data',
  'Rail',
  'Steel',
  'Beverages',
];
const NAME_C = ['Ltd', 'AG', 'SA', 'plc', 'Inc', 'Corp', 'Group', 'Holdings'];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function symbolFor(i: number) {
  return (
    LETTERS[(i * 7 + 3) % 26] +
    LETTERS[Math.floor(i / 26 + i * 3) % 26] +
    LETTERS[Math.floor(i / 676 + i * 11 + 5) % 26]
  );
}

export function nameFor(i: number) {
  return `${NAME_A[i % 16]} ${NAME_B[(i * 5 + (i >> 4)) % 16]} ${
    NAME_C[(i * 3 + (i >> 8)) % 8]
  }`;
}

function makeInstrument(i: number, rand: () => number): Instrument {
  return {
    id: i,
    symbol: symbolFor(i),
    sector: SECTORS[Math.floor(rand() * SECTORS.length)],
    region: REGIONS[Math.floor(rand() * REGIONS.length)],
    price: 8 + rand() * rand() * 520,
    changePct: (rand() - 0.48) * 5,
    volume: Math.round(20000 + rand() * rand() * 4_000_000),
  };
}

export function makeInstruments(count: number, seed = 7) {
  const rand = mulberry32(seed);
  const rows: Instrument[] = new Array(count);
  for (let i = 0; i < count; i++) rows[i] = makeInstrument(i, rand);
  return rows;
}

/** Builds `count` rows in slices of 100k, so the page stays responsive. */
export function makeInstrumentsChunked(
  count: number,
  onProgress: (done: number) => void,
  signal: AbortSignal,
) {
  return new Promise<Instrument[]>((resolve) => {
    const rand = mulberry32(11);
    const rows: Instrument[] = new Array(count);
    let i = 0;
    const slice = () => {
      if (signal.aborted) return;
      const end = Math.min(count, i + 100_000);
      for (; i < end; i++) rows[i] = makeInstrument(i, rand);
      onProgress(i);
      if (i < count) setTimeout(slice, 0);
      else resolve(rows);
    };
    slice();
  });
}

export function makeTrades(count: number) {
  const rand = mulberry32(23);
  const rows: Trade[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const sector = SECTORS[Math.floor(rand() * SECTORS.length)];
    const region = REGIONS[Math.floor(rand() * REGIONS.length)];
    // a drift per sector and region, so some cells end up in the red
    const drift =
      (((SECTORS.indexOf(sector) * 7 + REGIONS.indexOf(region) * 5) % 9) -
        3.4) /
      90;
    rows[i] = {
      id: i,
      sector,
      region,
      notional: Math.round(50_000 + rand() * 2_000_000),
      pnl: Math.round((rand() - 0.5 + drift) * 90_000),
    };
  }
  return rows;
}

const int = new Intl.NumberFormat('en-US');
const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatInt = (value: number) => int.format(value);
export const formatCompact = (value: number) => compact.format(value);
export const formatMoney = (value: number) =>
  `${value < 0 ? '−' : ''}$${compact.format(Math.abs(Math.round(value)))}`;
export const formatPct = (value: number) =>
  `${value < 0 ? '−' : '+'}${Math.abs(value).toFixed(2)}%`;
