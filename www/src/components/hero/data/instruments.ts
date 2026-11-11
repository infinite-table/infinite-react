/**
 * Deterministic instrument universe. Row `i` is always the same instrument,
 * so the Web Worker (which owns the price simulation) and the main thread
 * (which owns the grid rows) can both build it from the index alone — no row
 * data ever crosses the worker boundary, only ticks.
 */

export const SECTORS = [
  'Technology',
  'Financials',
  'Health Care',
  'Energy',
  'Industrials',
  'Consumer Disc.',
  'Staples',
  'Utilities',
  'Materials',
  'Real Estate',
  'Comms',
] as const;
export type Sector = (typeof SECTORS)[number];

export const ASSET_CLASSES = ['Equity', 'ETF', 'ADR', 'REIT'] as const;
export type AssetClass = (typeof ASSET_CLASSES)[number];

export const REGIONS = ['Americas', 'EMEA', 'APAC'] as const;
export type Region = (typeof REGIONS)[number];

const EXCHANGES: Record<Region, readonly string[]> = {
  Americas: ['NYSE', 'NASDAQ', 'TSX'],
  EMEA: ['LSE', 'XETRA', 'Euronext', 'SIX'],
  APAC: ['TSE', 'HKEX', 'ASX', 'SGX'],
};

/** Sector hue, used by avatars, the heatmap and the sector chart. */
export const SECTOR_HUES: Record<Sector, number> = {
  Technology: 212,
  Financials: 42,
  'Health Care': 340,
  Energy: 18,
  Industrials: 190,
  'Consumer Disc.': 280,
  Staples: 95,
  Utilities: 160,
  Materials: 30,
  'Real Estate': 250,
  Comms: 310,
};

/**
 * One grid row. Kept deliberately lean (most numbers are small integers,
 * names come from a shared table) so 1M rows stay affordable in memory.
 * Bid/ask, day range and avg volume are derived on render from the id.
 */
export type Instrument = {
  id: number;
  symbol: string;
  name: string;
  sector: Sector;
  assetClass: AssetClass;
  region: Region;
  exchange: string;
  /** Market cap in $ millions. */
  marketCap: number;
  /** Signed share count (negative = short). */
  position: number;
  open: number;
  price: number;
  volume: number;
  changePct: number;
  /** Unrealized P&L vs average cost. */
  pnl: number;
  /** P&L since the open. */
  dayPnl: number;
  /** Bumped on every update; lets cells cheaply tell "this row ticked". */
  tick: number;
};

export type InstrumentUpdate = Pick<
  Instrument,
  'id' | 'price' | 'volume' | 'changePct' | 'pnl' | 'dayPnl' | 'tick'
>;

// ---------------------------------------------------------------------------
// hashing: stable pseudo-random numbers from (index, salt)
// ---------------------------------------------------------------------------

export function hash01(i: number, salt: number): number {
  let h =
    Math.imul(i ^ 0x9e3779b9, 0x85ebca6b) ^
    Math.imul(salt + 0x632be5ab, 0xc2b2ae35);
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Stable standard-normal sample from (index, salt). */
export function hashGauss(i: number, salt: number): number {
  const u = Math.max(1e-9, hash01(i, salt));
  const v = hash01(i, salt + 7919);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------------------------------------------------------------------------
// numeric statics (shared by the worker simulation and the main thread)
// ---------------------------------------------------------------------------

export function sectorIndexOf(i: number) {
  // a few sectors are bigger than others, like a real index
  const u = hash01(i, 1);
  const weights = [
    0.2, 0.14, 0.12, 0.06, 0.1, 0.1, 0.07, 0.04, 0.05, 0.04, 0.08,
  ];
  let acc = 0;
  for (let k = 0; k < weights.length; k++) {
    acc += weights[k];
    if (u < acc) return k;
  }
  return weights.length - 1;
}

/** Market cap in $ millions — heavy tailed: a few megacaps, many small caps. */
export function marketCapOf(i: number) {
  const u = hash01(i, 2);
  return Math.round(Math.exp(lerp(5.3, 14.8, Math.pow(u, 2.4))));
}

export function openPriceOf(i: number) {
  return Math.round(Math.exp(lerp(2.2, 6.3, hash01(i, 3))) * 100) / 100;
}

/** Per-tick volatility (fraction of price). */
export function sigmaOf(i: number) {
  return lerp(0.0007, 0.0032, hash01(i, 4));
}

export function betaOf(i: number) {
  return Math.round(lerp(0.4, 1.9, hash01(i, 5)) * 100) / 100;
}

/** Bid/ask spread in basis points: big caps are tighter. */
export function spreadBpsOf(i: number) {
  const cap = marketCapOf(i);
  return Math.max(1, Math.round(60 / Math.log10(cap + 10) + hash01(i, 6) * 4));
}

export function avgVolumeOf(i: number) {
  return Math.round(
    (40_000 + Math.sqrt(marketCapOf(i)) * 9_000) * lerp(0.5, 1.5, hash01(i, 7)),
  );
}

export function positionOf(i: number) {
  // long-biased book, round lots
  const notional = lerp(-180_000, 520_000, hash01(i, 8));
  return Math.round(notional / openPriceOf(i) / 10) * 10;
}

export function avgCostOf(i: number) {
  return openPriceOf(i) * (1 + (hash01(i, 9) - 0.55) * 0.18);
}

/** Price at "now" when the demo starts: a little away from the open. */
export function initialPriceOf(i: number) {
  return openPriceOf(i) * Math.exp(hashGauss(i, 10) * sigmaOf(i) * 9);
}

export function initialVolumeOf(i: number) {
  return (
    Math.round((avgVolumeOf(i) * lerp(0.15, 0.7, hash01(i, 11))) / 100) * 100
  );
}

// ---------------------------------------------------------------------------
// string statics (main thread only)
// ---------------------------------------------------------------------------

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const P3 = 26 ** 3;
const P4 = 26 ** 4;

function lettersOf(n: number, length: number) {
  let out = '';
  for (let k = 0; k < length; k++) {
    out = LETTERS[n % 26] + out;
    n = Math.floor(n / 26);
  }
  return out;
}

/**
 * Unique ticker per index. A multiplicative permutation (7919 is coprime with
 * 26^k) scatters consecutive indexes so tickers look random, not sequential.
 */
export function symbolOf(i: number) {
  if (i < P3) return lettersOf((i * 7919 + 1237) % P3, 3);
  if (i < P3 + P4) return lettersOf(((i - P3) * 7919 + 4243) % P4, 4);
  return lettersOf(((i - P3 - P4) * 7919 + 337) % 26 ** 5, 5);
}

const NAME_HEADS = [
  'Apex',
  'Nimbus',
  'Vertex',
  'Cobalt',
  'Helix',
  'Orion',
  'Lumen',
  'Quanta',
  'Silverline',
  'Northwind',
  'Bluefin',
  'Redwood',
  'Summit',
  'Atlas',
  'Nova',
  'Pioneer',
  'Harbor',
  'Granite',
  'Crescent',
  'Evergreen',
  'Meridian',
  'Polaris',
  'Ironclad',
  'Zephyr',
  'Beacon',
  'Keystone',
  'Aurora',
  'Cascade',
  'Falcon',
  'Sterling',
];
const NAME_BODIES: Record<Sector, readonly string[]> = {
  Technology: [
    'Systems',
    'Micro',
    'Data',
    'Cloud',
    'Semi',
    'Software',
    'Networks',
    'Robotics',
  ],
  Financials: [
    'Capital',
    'Bancorp',
    'Financial',
    'Trust',
    'Partners',
    'Assurance',
    'Credit',
  ],
  'Health Care': [
    'Bio',
    'Therapeutics',
    'Health',
    'Genomics',
    'Medical',
    'Pharma',
  ],
  Energy: ['Energy', 'Petroleum', 'Resources', 'Power', 'Drilling', 'Gas'],
  Industrials: [
    'Industries',
    'Aerospace',
    'Logistics',
    'Machinery',
    'Rail',
    'Freight',
  ],
  'Consumer Disc.': [
    'Brands',
    'Motors',
    'Retail',
    'Apparel',
    'Leisure',
    'Home',
  ],
  Staples: ['Foods', 'Beverages', 'Household', 'Grocers', 'Farms'],
  Utilities: ['Utilities', 'Electric', 'Water', 'Grid', 'Renewables'],
  Materials: ['Materials', 'Chemicals', 'Metals', 'Mining', 'Steel', 'Paper'],
  'Real Estate': ['Realty', 'Properties', 'REIT', 'Land', 'Towers'],
  Comms: ['Media', 'Telecom', 'Wireless', 'Studios', 'Broadcast'],
};
const NAME_TAILS = [
  'Inc',
  'Corp',
  'Group',
  'Holdings',
  'plc',
  'Ltd',
  'SA',
  'AG',
];

// a shared table of names per sector: rows reference these strings instead
// of each owning a freshly concatenated one (matters at 1M rows)
const NAME_TABLE: Record<string, string[]> = {};
for (const sector of SECTORS) {
  const names: string[] = [];
  for (const head of NAME_HEADS) {
    for (const body of NAME_BODIES[sector]) {
      names.push(
        `${head} ${body} ${
          NAME_TAILS[(head.length + body.length) % NAME_TAILS.length]
        }`,
      );
    }
  }
  NAME_TABLE[sector] = names;
}

function assetClassOf(i: number, sector: Sector): AssetClass {
  if (sector === 'Real Estate' && hash01(i, 12) < 0.7) return 'REIT';
  const u = hash01(i, 13);
  return u < 0.7 ? 'Equity' : u < 0.86 ? 'ETF' : 'ADR';
}

function regionOf(i: number): Region {
  const u = hash01(i, 14);
  return u < 0.55 ? 'Americas' : u < 0.8 ? 'EMEA' : 'APAC';
}

export type LiveValues = {
  price: number;
  volume: number;
};

/** Build row `i` with the given live values. */
export function makeInstrument(
  i: number,
  live: LiveValues,
  tick = 0,
): Instrument {
  const sector = SECTORS[sectorIndexOf(i)];
  const region = regionOf(i);
  const exchanges = EXCHANGES[region];
  const names = NAME_TABLE[sector];
  const open = openPriceOf(i);
  const position = positionOf(i);
  const price = live.price;
  return {
    id: i,
    symbol: symbolOf(i),
    name: names[Math.floor(hash01(i, 15) * names.length)],
    sector,
    assetClass: assetClassOf(i, sector),
    region,
    exchange: exchanges[Math.floor(hash01(i, 16) * exchanges.length)],
    marketCap: marketCapOf(i),
    position,
    open,
    price,
    volume: live.volume,
    changePct: ((price - open) / open) * 100,
    pnl: position * (price - avgCostOf(i)),
    dayPnl: position * (price - open),
    tick,
  };
}

const CURRENCY_BY_EXCHANGE: Record<string, string> = {
  NYSE: 'USD',
  NASDAQ: 'USD',
  TSX: 'CAD',
  LSE: 'GBP',
  XETRA: 'EUR',
  Euronext: 'EUR',
  SIX: 'CHF',
  TSE: 'JPY',
  HKEX: 'HKD',
  ASX: 'AUD',
  SGX: 'SGD',
};
export const currencyOf = (exchange: string) =>
  CURRENCY_BY_EXCHANGE[exchange] ?? 'USD';
