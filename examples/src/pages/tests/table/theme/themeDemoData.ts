// deterministic data for the theme demo pages (React and Vue)
export type Instrument = {
  id: number;
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  bid: number;
  ask: number;
  volume: number;
  position: number;
  pnl: number;
};

const SECTORS = ['Technology', 'Energy', 'Financials', 'Healthcare', 'Industrials'];
const NAMES = [
  'Aurora', 'Basalt', 'Cobalt', 'Delta', 'Ember', 'Fjord', 'Granite', 'Harbor',
  'Iris', 'Juniper', 'Kestrel', 'Lumen', 'Meridian', 'Nimbus', 'Onyx', 'Pioneer',
  'Quarry', 'Ridge', 'Summit', 'Tundra', 'Umbra', 'Vertex', 'Willow', 'Zephyr',
];

let seed = 42;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

export const instruments: Instrument[] = Array.from({ length: 60 }, (_, i) => {
  const name = NAMES[i % NAMES.length];
  const price = Math.round((20 + random() * 480) * 100) / 100;
  const spread = Math.round(price * 0.0008 * 100) / 100 || 0.01;
  const position = Math.round((random() - 0.3) * 5000);
  return {
    id: i,
    symbol: `${name.slice(0, 3).toUpperCase()}${i}`,
    name: `${name} ${['Corp', 'Holdings', 'Group', 'Inc'][i % 4]}`,
    sector: SECTORS[i % SECTORS.length],
    price,
    change: Math.round((random() - 0.5) * 800) / 100,
    bid: Math.round((price - spread) * 100) / 100,
    ask: Math.round((price + spread) * 100) / 100,
    volume: Math.round(random() * 5_000_000),
    position,
    pnl: Math.round((random() - 0.45) * position * 4),
  };
});

export const formatNumber = (value: number, decimals = 2) =>
  typeof value === 'number'
    ? value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : value;

export function tickInstrument(instrument: Instrument): Partial<Instrument> {
  const delta = Math.round((random() - 0.5) * instrument.price * 0.004 * 100) / 100;
  const price = Math.max(1, Math.round((instrument.price + delta) * 100) / 100);
  const spread = Math.round(price * 0.0008 * 100) / 100 || 0.01;
  return {
    id: instrument.id,
    price,
    change: Math.round((instrument.change + delta) * 100) / 100,
    bid: Math.round((price - spread) * 100) / 100,
    ask: Math.round((price + spread) * 100) / 100,
  };
}
