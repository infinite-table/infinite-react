'use client';

import * as React from 'react';

import {
  SPARK_HEIGHT,
  SPARK_WIDTH,
  dayRangeGeometry,
  sparkGeometry,
  volumeRatio,
} from './cellGeometry';
import type { HeroFeed } from './data/feed';
import { SECTOR_HUES, type Sector } from './data/instruments';
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
  const { line, area, up, lastY } = sparkGeometry(feed, id);
  const W = SPARK_WIDTH;
  const H = SPARK_HEIGHT;
  return (
    <svg
      className={`hero-spark hero-spark--${up ? 'up' : 'down'}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path className="hero-spark__area" d={area} />
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
  const ratio = volumeRatio(id, volume);
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
  const { low, high, at, openAt, up } = dayRangeGeometry(feed, id, price);
  return (
    <span
      className="hero-range"
      title={`${low.toFixed(2)} – ${high.toFixed(2)}`}
    >
      <span className="hero-range__track" />
      <span className="hero-range__open" style={{ left: `${openAt}%` }} />
      <span
        className={`hero-range__marker hero-range__marker--${
          up ? 'up' : 'down'
        }`}
        style={{ left: `${at}%` }}
      />
    </span>
  );
}
