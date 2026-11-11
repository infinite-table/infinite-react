'use client';

import * as React from 'react';

import type { HeroFeed } from './data/feed';
import { SPARK_LENGTH } from './data/feed';
import { SECTOR_HUES, avgVolumeOf, type Sector } from './data/instruments';
import { formatCompact, formatMoney, formatPct, tone } from './format';

/** Initials avatar tinted by sector + ticker. */
export function SymbolCell({
  symbol,
  sector,
}: {
  symbol: string;
  sector: Sector;
}) {
  const hue = SECTOR_HUES[sector] ?? 210;
  return (
    <span className="hero-symbol">
      <span
        className="hero-symbol__avatar"
        style={{ '--hero-avatar-hue': hue } as React.CSSProperties}
        aria-hidden
      >
        {symbol.slice(0, 2)}
      </span>
      <span className="hero-symbol__ticker">{symbol}</span>
    </span>
  );
}

export function ChangePill({ value }: { value: number }) {
  const t = tone(value);
  return (
    <span className={`hero-pill hero-pill--${t}`}>
      <span className="hero-pill__arrow" aria-hidden>
        {t === 'up' ? '▲' : t === 'down' ? '▼' : '•'}
      </span>
      {formatPct(value)}
    </span>
  );
}

export function MoneyCell({ value }: { value: number }) {
  return (
    <span className={`hero-money hero-money--${tone(value)}`}>
      {formatMoney(value)}
    </span>
  );
}

// one scratch buffer: sparklines render synchronously, one at a time
const sparkScratch = new Float32Array(SPARK_LENGTH);

/**
 * Inline SVG sparkline of the row's last ticks. Memoized on `tick`, so it
 * only re-renders when its own row updates.
 */
export const Sparkline = React.memo(function Sparkline({
  feed,
  id,
}: {
  feed: HeroFeed;
  id: number;
  /** Only used to invalidate the memo when the row ticks. */
  tick: number;
}) {
  const values = feed.sparkline(id, sparkScratch);
  let min = Infinity;
  let max = -Infinity;
  for (let k = 0; k < SPARK_LENGTH; k++) {
    if (values[k] < min) min = values[k];
    if (values[k] > max) max = values[k];
  }
  const range = max - min || 1;
  const W = 100;
  const H = 24;
  const pad = 2;
  let line = '';
  for (let k = 0; k < SPARK_LENGTH; k++) {
    const x = (k / (SPARK_LENGTH - 1)) * W;
    const y = pad + (1 - (values[k] - min) / range) * (H - pad * 2);
    line += `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  const up = values[SPARK_LENGTH - 1] >= values[0];
  const lastY =
    pad + (1 - (values[SPARK_LENGTH - 1] - min) / range) * (H - pad * 2);
  return (
    <svg
      className={`hero-spark hero-spark--${up ? 'up' : 'down'}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path className="hero-spark__area" d={`${line}L${W} ${H}L0 ${H}Z`} />
      <path
        className="hero-spark__line"
        d={line}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        className="hero-spark__dot"
        cx={W}
        cy={lastY}
        r={1.6}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
});

/** Traded volume vs a typical day. */
export function VolumeBar({ id, volume }: { id: number; volume: number }) {
  const ratio = Math.min(1, volume / (avgVolumeOf(id) * 1.1));
  return (
    <span className="hero-vol">
      <span className="hero-vol__track">
        <span
          className="hero-vol__bar"
          style={{ transform: `scaleX(${ratio.toFixed(3)})` }}
        />
      </span>
      <span className="hero-vol__text">{formatCompact(volume)}</span>
    </span>
  );
}

/** Day low → high with a marker at the current price. */
export function DayRange({
  feed,
  id,
  price,
}: {
  feed: HeroFeed;
  id: number;
  price: number;
}) {
  const low = feed.low[id] ?? price;
  const high = feed.high[id] ?? price;
  const open = feed.open[id] ?? price;
  const span = high - low || 1;
  const at = ((price - low) / span) * 100;
  const openAt = ((open - low) / span) * 100;
  return (
    <span
      className="hero-range"
      title={`${low.toFixed(2)} – ${high.toFixed(2)}`}
    >
      <span className="hero-range__track" />
      <span className="hero-range__open" style={{ left: `${openAt}%` }} />
      <span
        className={`hero-range__marker hero-range__marker--${
          price >= open ? 'up' : 'down'
        }`}
        style={{ left: `${at}%` }}
      />
    </span>
  );
}
