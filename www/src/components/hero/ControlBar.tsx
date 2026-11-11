'use client';

import * as React from 'react';

import type { FeedStats, HeroFeed } from './data/feed';
import { formatCompact, formatInt } from './format';
import { HERO_DENSITIES, HERO_THEMES, type HeroDensity } from './themes';

export type HeroView = 'flat' | 'grouped' | 'pivot';
export type HeroDataMode = 'client' | 'server';

export const ROW_COUNTS = [1_000, 10_000, 100_000, 1_000_000] as const;
export const TICK_RATES = [
  10, 50, 100, 250, 500, 1_000, 2_500, 5_000, 10_000, 25_000,
] as const;

type SegmentOption<V extends string | number> = {
  value: V;
  label: React.ReactNode;
  title?: string;
  disabled?: boolean;
  /** data-attribute value the scripted show targets. */
  hook?: string;
};

function Segmented<V extends string | number>({
  label,
  value,
  options,
  onChange,
  hookName,
}: {
  label: string;
  value: V;
  options: SegmentOption<V>[];
  onChange: (value: V) => void;
  hookName: string;
}) {
  return (
    <div className="hero-control" role="group" aria-label={label}>
      <span className="hero-control__label">{label}</span>
      <div className="hero-segmented">
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            className="hero-segmented__item"
            aria-pressed={option.value === value}
            disabled={option.disabled}
            title={option.title}
            {...{
              [`data-hero-${hookName}`]: option.hook ?? String(option.value),
            }}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export type ControlBarProps = {
  themeId: string;
  onThemeChange: (id: string) => void;
  density: HeroDensity;
  onDensityChange: (id: HeroDensity['id']) => void;
  ticksPerSecond: number;
  onTicksPerSecondChange: (rate: number) => void;
  rowCount: number;
  onRowCountChange: (count: number) => void;
  allowMillion: boolean;
  dataMode: HeroDataMode;
  onDataModeChange: (mode: HeroDataMode) => void;
  reducedMotion: boolean;
};

/** The top bar: how the grid looks and how fast the feed ticks. */
export function ControlBar(
  props: Omit<
    ControlBarProps,
    | 'rowCount'
    | 'onRowCountChange'
    | 'allowMillion'
    | 'dataMode'
    | 'onDataModeChange'
  >,
) {
  const rateIndex = Math.max(
    0,
    TICK_RATES.findIndex((rate) => rate >= props.ticksPerSecond),
  );
  return (
    <div className="hero-controls">
      <Segmented
        label="Theme"
        hookName="theme"
        value={props.themeId}
        onChange={props.onThemeChange}
        options={HERO_THEMES.map((theme) => ({
          value: theme.id,
          label: (
            <>
              <span
                className="hero-swatch"
                style={{ background: theme.swatch }}
                aria-hidden
              />
              {theme.label}
            </>
          ),
        }))}
      />
      <Segmented
        label="Density"
        hookName="density"
        value={props.density.id}
        onChange={props.onDensityChange}
        options={HERO_DENSITIES.map((density) => ({
          value: density.id,
          label: density.label,
        }))}
      />
      <div className="hero-control">
        <label className="hero-control__label" htmlFor="hero-tick-rate">
          Tick rate
        </label>
        <div className="hero-rate">
          <input
            id="hero-tick-rate"
            type="range"
            min={0}
            max={TICK_RATES.length - 1}
            step={1}
            value={rateIndex}
            data-hero-rate
            aria-valuetext={`${formatInt(
              TICK_RATES[rateIndex],
            )} ticks per second`}
            onChange={(event) =>
              props.onTicksPerSecondChange(
                TICK_RATES[Number(event.target.value)],
              )
            }
          />
          <span className="hero-rate__value hero-num">
            {formatCompact(TICK_RATES[rateIndex])}/s
            {props.reducedMotion ? (
              <span className="hero-dim"> (reduced motion)</span>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
}

export type DataControlsProps = Pick<
  ControlBarProps,
  | 'rowCount'
  | 'onRowCountChange'
  | 'allowMillion'
  | 'dataMode'
  | 'onDataModeChange'
> & { view: HeroView; onViewChange: (view: HeroView) => void };

/** The toolbar above the grid: what the grid shows and where data comes from. */
export function DataControls(props: DataControlsProps) {
  return (
    <div className="hero-toolbar">
      <Segmented
        label="View"
        hookName="view"
        value={props.view}
        onChange={props.onViewChange}
        options={[
          { value: 'flat', label: 'Flat' },
          { value: 'grouped', label: 'By sector' },
          { value: 'pivot', label: 'Pivot' },
        ]}
      />
      <Segmented
        label="Rows"
        hookName="rows"
        value={props.rowCount}
        onChange={props.onRowCountChange}
        options={ROW_COUNTS.filter(
          (count) => props.allowMillion || count < 1_000_000,
        ).map((count) => ({
          value: count,
          label: formatCompact(count),
        }))}
      />
      <Segmented
        label="Data"
        hookName="data"
        value={props.dataMode}
        onChange={props.onDataModeChange}
        options={[
          {
            value: 'client',
            label: 'Client · worker',
            title: 'Ticks simulated in a Web Worker, all rows in the browser',
          },
          {
            value: 'server',
            label: 'Server',
            title: 'Server-side data — coming soon',
            disabled: true,
          },
        ]}
      />
    </div>
  );
}

/** Live counters, re-rendered twice a second. */
export function StatsStrip({
  feed,
  building,
}: {
  feed: HeroFeed;
  building: string | null;
}) {
  const [stats, setStats] = React.useState<FeedStats>(feed.stats);
  React.useEffect(() => {
    setStats(feed.stats);
    return feed.onStats(setStats);
  }, [feed]);

  if (building) {
    return (
      <div className="hero-stats" role="status">
        <span className="hero-stats__dot hero-stats__dot--busy" aria-hidden />
        {building}
      </div>
    );
  }

  const throttled = stats.flushIntervalMs > 0;
  return (
    <div className="hero-stats" aria-live="off">
      <span
        className={`hero-stats__dot ${
          stats.running ? 'hero-stats__dot--live' : ''
        }`}
        aria-hidden
      />
      <span className="hero-stats__label">
        {stats.running ? 'LIVE' : 'PAUSED'}
      </span>
      <Stat
        value={formatInt(stats.ticksPerSecond)}
        unit="ticks/s"
        title="Price ticks generated by the worker"
      />
      <Stat
        value={formatInt(stats.updatesPerSecond)}
        unit="row updates/s"
        title="Rows updated in the grid per second, after coalescing ticks per frame"
      />
      <Stat
        value={String(stats.fps)}
        unit="fps"
        title="Frames per second on this page"
      />
      <Stat
        value={
          stats.commitMs < 1
            ? '<1'
            : stats.commitMs < 10
            ? stats.commitMs.toFixed(1)
            : formatInt(stats.commitMs)
        }
        unit={
          stats.gridPaused
            ? 'ms/commit · grid updates paused at this size, ticks continue in the charts'
            : stats.scrollHeld
            ? 'ms/commit · held while scrolling'
            : throttled
            ? `ms/commit · every ${formatInt(stats.flushIntervalMs)}ms`
            : 'ms/commit'
        }
        title="Main-thread time for one DataSource commit (re-index, re-sort, regroup, render). Above ~5ms, commits are spaced out automatically to keep the frame rate; with 100k+ rows they also wait while you scroll."
      />
    </div>
  );
}

function Stat({
  value,
  unit,
  title,
}: {
  value: string;
  unit: string;
  title: string;
}) {
  return (
    <span className="hero-stat" title={title}>
      <span className="hero-stat__value hero-num">{value}</span>
      <span className="hero-stat__unit">{unit}</span>
    </span>
  );
}
