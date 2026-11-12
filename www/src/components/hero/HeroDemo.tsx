'use client';

import type { DataSourceGroupBy } from '@infinite-table/infinite-react';
import * as React from 'react';

import {
  AutomatedDemo,
  usePageVisible,
  usePrefersReducedMotion,
  useInView,
} from '../showcase';
import type { LazyShowcaseLoadedProps } from '../showcase';
import { Heatmap } from './charts/Heatmap';
import { PriceChart } from './charts/PriceChart';
import { SectorBars } from './charts/SectorBars';
import {
  ControlBar,
  DataControls,
  StatsStrip,
  type HeroDataMode,
  type HeroView,
} from './ControlBar';
import { HeroFeed } from './data/feed';
import type { Instrument } from './data/instruments';
import { HeroGrid, type HeroGridApis } from './HeroGrid';
import {
  resetHeroState,
  runHeroScript,
  type HeroController,
} from './heroScript';
import { formatInt } from './format';
import {
  DEFAULT_DENSITY_ID,
  DEFAULT_THEME_ID,
  getHeroDensity,
  themeClassName,
  type HeroColorMode,
} from './themes';

import './hero-frame.css';
import './hero.css';
import '../showcase/showcase.css';

export const DEFAULT_ROW_COUNT = 10_000;
export const DEFAULT_TICK_RATE = 2_500;
const REDUCED_MOTION_TICK_CAP = 40;
const BUILD_MESSAGE_THRESHOLD = 20_000;

const GROUP_BY_SECTOR: DataSourceGroupBy<Instrument>[] = [{ field: 'sector' }];
const NO_GROUPS: DataSourceGroupBy<Instrument>[] = [];

/** Light/dark follows `<html data-theme>` (the site toggle), unless overridden. */
function useSiteColorMode(override?: HeroColorMode): HeroColorMode {
  const [mode, setMode] = React.useState<HeroColorMode>('dark');
  React.useEffect(() => {
    if (override) {
      setMode(override);
      return;
    }
    const html = document.documentElement;
    const read = () =>
      setMode(html.dataset.theme === 'light' ? 'light' : 'dark');
    read();
    const observer = new MutationObserver(read);
    observer.observe(html, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, [override]);
  return mode;
}

function canHandleMillionRows() {
  if (typeof window === 'undefined') return false;
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  return (
    !window.matchMedia('(pointer: coarse)').matches &&
    (memory === undefined || memory >= 4)
  );
}

export type HeroDemoProps = LazyShowcaseLoadedProps & {
  /** Force light or dark (review routes); defaults to following the site. */
  mode?: HeroColorMode;
  /** Run the scripted show while in view (desktop only). Default true. */
  autoplay?: boolean;
};

/**
 * The homepage hero: a ticking trading blotter (Infinite Table fed by a Web
 * Worker simulation), charts fed by the same stream, a control bar, and a
 * scripted "live control" show that hands over on the first interaction.
 */
export default function HeroDemo({
  onReady,
  mode: modeOverride,
  autoplay = true,
}: HeroDemoProps) {
  const [feed] = React.useState(() => new HeroFeed());
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const reducedMotion = usePrefersReducedMotion();
  const pageVisible = usePageVisible();
  const inView = useInView(rootRef);
  const mode = useSiteColorMode(modeOverride);

  const [themeId, setThemeId] = React.useState(DEFAULT_THEME_ID);
  const [densityId, setDensityId] = React.useState<string>(DEFAULT_DENSITY_ID);
  const [ticksPerSecond, setTicksPerSecond] = React.useState(DEFAULT_TICK_RATE);
  const [rowCount, setRowCount] = React.useState(DEFAULT_ROW_COUNT);
  const [dataMode, setDataMode] = React.useState<HeroDataMode>('client');
  const [groupBy, setGroupBy] =
    React.useState<DataSourceGroupBy<Instrument>[]>(NO_GROUPS);
  const [pivot, setPivot] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState(-1);
  const [rows, setRows] = React.useState<Instrument[] | null>(null);
  const [building, setBuilding] = React.useState<string | null>(null);
  const [apis, setApis] = React.useState<HeroGridApis | null>(null);
  const [allowMillion, setAllowMillion] = React.useState(false);

  const density = getHeroDensity(densityId);
  const view: HeroView = pivot ? 'pivot' : groupBy.length ? 'grouped' : 'flat';
  const running = pageVisible && inView;
  const themeKey = `${themeId}-${mode}`;

  React.useEffect(() => setAllowMillion(canHandleMillionRows()), []);

  // worker lifecycle (restartable: StrictMode mounts effects twice in dev)
  React.useEffect(() => {
    feed.start();
    return () => feed.dispose();
  }, [feed]);

  React.useEffect(() => {
    feed.setTicksPerSecond(
      reducedMotion
        ? Math.min(ticksPerSecond, REDUCED_MOTION_TICK_CAP)
        : ticksPerSecond,
    );
  }, [feed, ticksPerSecond, reducedMotion]);

  // pause when the tab is hidden or the hero is scrolled away
  React.useEffect(() => {
    feed.setRunning(running && !!rows);
  }, [feed, running, rows]);

  React.useEffect(() => {
    feed.attach(apis?.dataSourceApi ?? null);
  }, [feed, apis]);

  // (re)build rows when the row count changes; ticks are held meanwhile
  React.useEffect(() => {
    const controller = new AbortController();
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      feed.hold(false);
    };
    feed.hold(true);
    const label = `building ${formatInt(rowCount)} rows…`;
    if (rowCount > BUILD_MESSAGE_THRESHOLD) setBuilding(label);
    void feed
      .buildRows(rowCount, {
        signal: controller.signal,
        onProgress: (p) => {
          if (rowCount > BUILD_MESSAGE_THRESHOLD && p < 1)
            setBuilding(`${label} ${Math.round(p * 100)}%`);
        },
      })
      .then((built) => {
        if (!built || controller.signal.aborted) return;
        feed.setRowCount(rowCount);
        setRows(built);
        setBuilding(null);
        setSelectedId((current) =>
          current >= 0 && current < rowCount
            ? current
            : feed.topInstruments(1)[0]?.id ?? 0,
        );
        // let the DataSource load the new array before ticks are committed again
        requestAnimationFrame(() => requestAnimationFrame(release));
      });
    return () => {
      controller.abort();
      release();
    };
  }, [feed, rowCount]);

  React.useEffect(() => {
    if (selectedId >= 0) feed.select(selectedId);
  }, [feed, selectedId]);

  // tell the lazy wrapper we're live once the first rows have painted
  const announcedRef = React.useRef(false);
  React.useEffect(() => {
    if (!rows || !apis || announcedRef.current) return;
    announcedRef.current = true;
    requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
  }, [rows, apis, onReady]);

  const setView = React.useCallback((next: HeroView) => {
    setPivot(next === 'pivot');
    setGroupBy(next === 'flat' ? NO_GROUPS : GROUP_BY_SECTOR);
  }, []);

  const onGroupByChange = React.useCallback(
    (next: DataSourceGroupBy<Instrument>[]) => {
      setGroupBy(next);
      if (!next.length) setPivot(false);
    },
    [],
  );

  // ---- controller for the scripted show (always reads the latest state) ----
  const stateRef = React.useRef({
    rowCount,
    themeId,
    view,
    building,
    rows,
    densityId,
  });
  stateRef.current = { rowCount, themeId, view, building, rows, densityId };
  const controller = React.useMemo<HeroController>(
    () => ({
      feed,
      getApis: () => apisRef.current,
      getState: () => stateRef.current,
      setView,
      setRowCount,
      setThemeId,
      setDensityId,
      setTicksPerSecond,
      select: setSelectedId,
    }),
    [feed, setView],
  );
  const apisRef = React.useRef<HeroGridApis | null>(null);
  apisRef.current = apis;

  return (
    <AutomatedDemo
      ready={autoplay && !!rows && !!apis}
      waitForSelector=".InfiniteColumnCell"
      run={(context) => runHeroScript({ ...context, hero: controller })}
      reset={(context) => resetHeroState({ ...context, hero: controller })}
      className="hero-auto"
      runningLabel="live demo — click anywhere to take over"
    >
      <div
        ref={rootRef}
        className={`hero ${themeClassName(themeId, mode)} ${density.className}`}
        data-hero-mode={mode}
      >
        <ControlBar
          themeId={themeId}
          onThemeChange={setThemeId}
          density={density}
          onDensityChange={setDensityId}
          ticksPerSecond={ticksPerSecond}
          onTicksPerSecondChange={setTicksPerSecond}
          reducedMotion={reducedMotion}
        />
        <div className="hero-body">
          <div className="hero-main">
            <DataControls
              view={view}
              onViewChange={setView}
              rowCount={rowCount}
              onRowCountChange={setRowCount}
              allowMillion={allowMillion}
              dataMode={dataMode}
              onDataModeChange={setDataMode}
            />
            <div className="hero-grid">
              {rows ? (
                <HeroGrid
                  feed={feed}
                  rows={rows}
                  groupBy={groupBy}
                  onGroupByChange={onGroupByChange}
                  pivot={pivot}
                  flashDuration={reducedMotion ? 1600 : 700}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onReady={setApis}
                />
              ) : null}
              {building ? (
                <div className="hero-grid__busy">{building}</div>
              ) : null}
            </div>
            <StatsStrip feed={feed} building={building} />
          </div>
          <aside
            className="hero-side"
            aria-label="Charts fed by the same live stream"
          >
            {selectedId >= 0 ? (
              <PriceChart
                feed={feed}
                selectedId={selectedId}
                active={running}
                themeKey={themeKey}
              />
            ) : null}
            <SectorBars feed={feed} active={running && !!rows} />
            <Heatmap
              feed={feed}
              rowCount={rows?.length ?? 0}
              active={running && !!rows}
              themeKey={themeKey}
              onSelect={setSelectedId}
            />
          </aside>
        </div>
      </div>
    </AutomatedDemo>
  );
}
