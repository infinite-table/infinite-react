'use client';

import * as React from 'react';

import type { HeroFeed } from '../data/feed';
import { SECTORS } from '../data/instruments';
import { formatMoney } from '../format';

const ROW = 19;

/**
 * Day P&L per sector, as diverging bars around a zero baseline. Bars re-rank
 * live; rows glide to their new position (CSS transforms), so a reorder reads
 * as movement rather than a jump.
 */
export function SectorBars({
  feed,
  active,
}: {
  feed: HeroFeed;
  active: boolean;
}) {
  const [values, setValues] = React.useState<number[]>(() =>
    Array.from(feed.sectorDayPnl),
  );
  const [hover, setHover] = React.useState<number | null>(null);

  React.useEffect(() => {
    const read = () => setValues(Array.from(feed.sectorDayPnl));
    read();
    if (!active) return;
    const id = window.setInterval(read, 350);
    return () => window.clearInterval(id);
  }, [feed, active]);

  // bars update ~3×/s, but the ranking only every few seconds: constant
  // reshuffling would read as noise, an occasional glide reads as news
  const valuesRef = React.useRef(values);
  valuesRef.current = values;
  const rankOf = () => {
    const current = valuesRef.current;
    return current.map((_, k) => k).sort((a, b) => current[b] - current[a]);
  };
  const [order, setOrder] = React.useState<number[]>(rankOf);
  React.useEffect(() => {
    setOrder(rankOf());
    if (!active) return;
    const id = window.setInterval(() => setOrder(rankOf()), 2600);
    return () => window.clearInterval(id);
  }, [active]);
  const rank = new Array<number>(values.length);
  order.forEach((k, index) => (rank[k] = index));
  const maxAbs = Math.max(1, ...values.map(Math.abs));
  const total = values.reduce((acc, v) => acc + v, 0);

  return (
    <section className="hero-card hero-sectors" aria-label="Day P&L by sector">
      <header className="hero-card__header">
        <span className="hero-card__title">Day P&amp;L by sector</span>
        <span
          className={`hero-card__value hero-money hero-money--${
            total >= 0 ? 'up' : 'down'
          }`}
        >
          {formatMoney(total)}
        </span>
      </header>
      <div
        className="hero-sectors__rows"
        style={{ height: values.length * ROW }}
      >
        <span className="hero-sectors__zero" aria-hidden />
        {SECTORS.map((sector, k) => {
          const value = values[k];
          const width = (Math.abs(value) / maxAbs) * 50;
          const up = value >= 0;
          return (
            <div
              key={sector}
              className="hero-sectors__row"
              data-hover={hover === k ? 'true' : undefined}
              style={{ transform: `translateY(${rank[k] * ROW}px)` }}
              onPointerEnter={() => setHover(k)}
              onPointerLeave={() => setHover(null)}
              title={`${sector}: ${formatMoney(value)}`}
            >
              <span className="hero-sectors__label">{sector}</span>
              <span className="hero-sectors__track">
                <span
                  className={`hero-sectors__bar hero-sectors__bar--${
                    up ? 'up' : 'down'
                  }`}
                  style={{
                    left: up ? '50%' : `${50 - width}%`,
                    width: `${Math.max(0.6, width)}%`,
                  }}
                />
              </span>
              <span className="hero-sectors__value hero-num">
                {formatMoney(value)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
