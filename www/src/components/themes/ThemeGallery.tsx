'use client';

import {
  DataSource,
  InfiniteTable,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import Link from 'next/link';
import * as React from 'react';

import {
  type Instrument,
  formatCompact,
  formatPct,
  makeInstruments,
  nameFor,
} from '@www/components/home/demos/data';
import {
  type ColorMode,
  LICENSE_KEY,
  Segmented,
  gridDomProps,
  themeClassName,
  useSiteMode,
} from '@www/components/home/demos/shared';

import { SITE_THEMES, type SiteTheme, themeCssImports } from './registry';

import '@www/components/home/demos/demo-themes.css';

type Density = 'compact' | 'comfortable' | 'spacious';

const MODES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
] as const;

const DENSITIES = [
  { id: 'compact', label: 'Compact' },
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'spacious', label: 'Spacious' },
] as const;

const columns: InfiniteTablePropColumns<Instrument> = {
  symbol: { field: 'symbol', header: 'Symbol', defaultWidth: 90 },
  name: {
    header: 'Name',
    valueGetter: ({ data }) => nameFor(data.id),
    defaultFlex: 1,
    minWidth: 170,
  },
  price: {
    field: 'price',
    header: 'Price',
    type: 'number',
    align: 'end',
    defaultWidth: 90,
    renderValue: ({ value }) => (value == null ? null : value.toFixed(2)),
  },
  changePct: {
    field: 'changePct',
    header: 'Chg %',
    type: 'number',
    align: 'end',
    defaultWidth: 90,
    renderValue: ({ value }) =>
      value == null ? null : (
        <span className={value < 0 ? 'home-down' : 'home-up'}>
          {formatPct(value)}
        </span>
      ),
  },
  volume: {
    field: 'volume',
    header: 'Volume',
    type: 'number',
    align: 'end',
    defaultWidth: 90,
    renderValue: ({ value }) => (value == null ? null : formatCompact(value)),
  },
};

/** A small live grid that mounts when it nears the viewport. */
function ThemePreview(props: {
  theme: string;
  mode: ColorMode;
  density: Density;
  data: Instrument[];
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`themes-card__grid ${themeClassName(
        props.theme,
        props.mode,
        props.density,
      )}`}
    >
      {visible ? (
        <DataSource<Instrument>
          data={props.data}
          primaryKey="id"
          selectionMode="single-row"
          defaultRowSelection={2}
        >
          <InfiniteTable<Instrument>
            columns={columns}
            domProps={gridDomProps}
            licenseKey={LICENSE_KEY}
          />
        </DataSource>
      ) : null}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      className="site-key site-key--sm"
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => {});
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function ThemeCard(props: {
  theme: SiteTheme;
  mode: ColorMode;
  density: Density;
  data: Instrument[];
}) {
  const { theme, mode, density } = props;
  const className = themeClassName(theme.id, mode, density);
  const snippet = `${themeCssImports(
    theme.id,
  )}\n\n<div className="${className}">\n  <InfiniteTable />\n</div>`;

  return (
    <article className="themes-card" id={theme.id}>
      <div className="themes-card__head">
        <h2>{theme.label}</h2>
        {theme.docsHash ? (
          <Link href={`/docs/learn/theming#${theme.docsHash}`}>Docs →</Link>
        ) : null}
      </div>
      <p className="themes-card__text">{theme.description}</p>
      <ThemePreview
        theme={theme.id}
        mode={mode}
        density={density}
        data={props.data}
      />
      <div className="themes-card__code">
        <pre>
          <code>{snippet}</code>
        </pre>
        <CopyButton text={snippet} />
      </div>
    </article>
  );
}

export function ThemeGallery() {
  const siteMode = useSiteMode();
  const [mode, setMode] = React.useState<ColorMode>(siteMode);
  const [density, setDensity] = React.useState<Density>('comfortable');

  // follow the site toggle; the Mode control can still flip it here
  React.useEffect(() => setMode(siteMode), [siteMode]);

  const data = React.useMemo(() => makeInstruments(40, 31), []);

  return (
    <>
      <div className="themes-controls">
        <Segmented
          label="Mode"
          options={MODES}
          value={mode}
          onChange={setMode}
        />
        <Segmented
          label="Density"
          options={DENSITIES}
          value={density}
          onChange={setDensity}
        />
      </div>
      <div className="themes-grid">
        {SITE_THEMES.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            mode={mode}
            density={density}
            data={data}
          />
        ))}
        <article className="themes-card themes-card--more">
          <div className="themes-card__head">
            <h2>And two more ways</h2>
          </div>
          <div className="themes-more">
            <Link href="/blog/2024/10/16/shadcn-ui-theme-available">
              <b>shadcn/ui</b>
              <span>
                The <code>shadcn</code> theme takes its colors from the
                shadcn/ui CSS variables of your app, and its mode from the{' '}
                <code>dark</code> className, so it isn't shown here.
              </span>
            </Link>
            <Link href="/docs/learn/theming/css-variables">
              <b>Your own</b>
              <span>
                Start from any theme and override its CSS variables: colors, row
                height, paddings, fonts, borders, icons.
              </span>
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
