/*
 * The social preview images, rendered at build time (static export) to
 * /og/<slug>.png: one per card in utils/ogCards.ts. The Terminal look in
 * the site's dark palette.
 */
import fs from 'node:fs';
import path from 'node:path';

import { ImageResponse } from 'next/og';

import { docsFrameworks } from '@www/utils/docsFrameworks';
import { getOgCards, type OgCard } from '@www/utils/ogCards';

export const dynamic = 'force-static';

const WIDTH = 1200;
const HEIGHT = 630;

const C = {
  bg: '#0b0e13',
  surface: '#10151c',
  line: '#1a212b',
  lineStrong: '#273140',
  fg: '#c9d1db',
  heading: '#e8edf3',
  muted: '#7c8796',
  accent: '#5c9dff',
  accentText: '#74abff',
  header: '#151b24',
  zebra: '#0e1319',
  selected: '#16243b',
  glow: 'rgba(92, 157, 255, 0.16)',
};

/** The bottom line of every card: `REACT / VUE / 0 DEPENDENCIES`. */
const FOOTER_ITEMS = [
  ...docsFrameworks.ids.map((framework) =>
    docsFrameworks.label(framework).toUpperCase(),
  ),
  '0 DEPENDENCIES',
];

/** `['docs', 'learn', 'sorting.png']` for `docs/learn/sorting` */
export function generateStaticParams() {
  return [...getOgCards().keys()].map((slug) => {
    const parts = slug.split('/');
    parts[parts.length - 1] += '.png';
    return { slug: parts };
  });
}

/** The logo in one color: the accent, like the site header. */
const LOGO = `data:image/svg+xml;base64,${Buffer.from(
  fs
    .readFileSync(path.join(process.cwd(), 'public/logo-infinite.svg'), 'utf8')
    .replace(/#3BFF7F|#497AFF/gi, C.accent),
).toString('base64')}`;

type Font = {
  name: string;
  data: ArrayBuffer;
  weight: 500 | 600;
  style: 'normal';
};

/**
 * The site's fonts, as TTF from Google Fonts (the renderer can't read woff2).
 * Without the network, the renderer's own sans font is used.
 */
let fontsPromise: Promise<Font[]> | null = null;
function loadFonts(): Promise<Font[]> {
  fontsPromise ??= (async () => {
    try {
      const css = await fetch(
        'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@600&family=JetBrains+Mono:wght@500',
      ).then((r) => r.text());
      const urls = [...css.matchAll(/url\((https:[^)]+\.ttf)\)/g)].map(
        (m) => m[1],
      );
      const [plex, mono] = await Promise.all(
        urls.slice(0, 2).map((url) => fetch(url).then((r) => r.arrayBuffer())),
      );
      if (!plex || !mono) return [];
      return [
        { name: 'IBM Plex Sans', data: plex, weight: 600, style: 'normal' },
        { name: 'JetBrains Mono', data: mono, weight: 500, style: 'normal' },
      ];
    } catch {
      return [];
    }
  })();
  return fontsPromise;
}

const MONO = 'JetBrains Mono, monospace';

/** the text column is narrow: long titles step down */
function titleSize(title: string) {
  if (title.length > 80) return 40;
  if (title.length > 56) return 46;
  if (title.length > 34) return 50;
  if (title.length > 20) return 64;
  return 76;
}

function clip(text: string, max: number) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean
    .slice(0, clean.lastIndexOf(' ', max - 1))
    .replace(/[,;:.]$/, '')}…`;
}

const GRID_COLUMNS = [
  { name: 'Name', width: 132 },
  { name: 'Country', width: 124 },
  { name: 'Stack', width: 124 },
  { name: 'Salary', width: 124, number: true },
  { name: 'City', width: 160 },
];
const GRID_ROWS = [
  ['Nya', 'India', 'frontend', '60,000', 'Unnao'],
  ['Axel', 'Mexico', 'backend', '100,000', 'Cuitlahuac'],
  ['Gonzalo', 'UAE', 'full-stack', '120,000', 'Fujairah'],
  ['Sherwood', 'Mexico', 'frontend', '99,000', 'Tlacolula'],
  ['Alexandre', 'France', 'backend', '97,000', 'Persan'],
  ['Mariane', 'USA', 'frontend', '58,000', 'Hays'],
  ['Rosalind', 'Mexico', 'full-stack', '198,000', 'Nuevo Casas'],
  ['Lolita', 'Sweden', 'backend', '200,000', 'Delsbo'],
];

/** The product, drawn: a data grid that runs off the right edge of the card. */
function GridVisual() {
  const rowHeight = 46;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 668,
        border: `2px solid ${C.lineStrong}`,
        borderRadius: 6,
        background: C.surface,
        overflow: 'hidden',
        boxShadow: `0 0 80px ${C.glow}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          height: rowHeight,
          background: C.header,
          borderBottom: `2px solid ${C.lineStrong}`,
        }}
      >
        {GRID_COLUMNS.map((column, index) => (
          <div
            key={column.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: column.width,
              padding: '0 14px',
              borderRight: `1px solid ${C.line}`,
              fontFamily: MONO,
              fontSize: 17,
              letterSpacing: 1,
              color: index === 3 ? C.accentText : C.heading,
            }}
          >
            <span>{column.name}</span>
            {index === 3 ? <span style={{ fontSize: 15 }}>▼</span> : null}
          </div>
        ))}
      </div>
      {GRID_ROWS.map((row, rowIndex) => (
        <div
          key={row[0]}
          style={{
            display: 'flex',
            height: rowHeight,
            background:
              rowIndex === 2
                ? C.selected
                : rowIndex % 2
                ? C.zebra
                : 'transparent',
            borderBottom: `1px solid ${C.line}`,
          }}
        >
          {row.map((value, colIndex) => (
            <div
              key={colIndex}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: GRID_COLUMNS[colIndex].number
                  ? 'flex-end'
                  : 'flex-start',
                width: GRID_COLUMNS[colIndex].width,
                padding: '0 14px',
                borderRight: `1px solid ${C.line}`,
                // the active cell
                ...(rowIndex === 2 && colIndex === 1
                  ? { border: `2px solid ${C.accent}`, color: C.heading }
                  : null),
                fontSize: 19,
                color: rowIndex === 2 ? C.heading : C.fg,
              }}
            >
              {value}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ProductTile({ name, own }: { name: string; own?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 10,
        width: 400,
        height: 124,
        padding: '0 26px',
        border: `2px solid ${own ? C.accent : C.lineStrong}`,
        borderRadius: 6,
        background: own ? C.selected : C.surface,
        ...(own ? { boxShadow: `0 0 80px ${C.glow}` } : null),
      }}
    >
      <div
        style={{
          display: 'flex',
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: 3,
          color: own ? C.accentText : C.muted,
        }}
      >
        {own ? 'THIS GRID' : 'COMPARED WITH'}
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: name.length > 20 ? 30 : 38,
          letterSpacing: -1,
          color: C.heading,
        }}
      >
        {name}
      </div>
    </div>
  );
}

/** a comparison page: the two products, one above the other */
function VersusVisual({
  other,
  features,
}: {
  other: string;
  features: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        width: 400,
      }}
    >
      <ProductTile name="Infinite Table" own />
      <div
        style={{
          display: 'flex',
          fontFamily: MONO,
          fontSize: 22,
          letterSpacing: 6,
          color: C.muted,
        }}
      >
        VS
      </div>
      <ProductTile name={other} />
      <div
        style={{
          display: 'flex',
          marginTop: 8,
          fontFamily: MONO,
          fontSize: 16,
          letterSpacing: 2,
          color: C.muted,
        }}
      >
        {`${features} FEATURES · EVERY CLAIM SOURCED`}
      </div>
    </div>
  );
}

/** the comparison index: the grids it covers */
function ListVisual({ items }: { items: string[] }) {
  const shown = items.slice(0, 7);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 400,
        border: `2px solid ${C.lineStrong}`,
        borderRadius: 6,
        background: C.surface,
        overflow: 'hidden',
        boxShadow: `0 0 80px ${C.glow}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 48,
          padding: '0 18px',
          background: C.selected,
          borderBottom: `2px solid ${C.accent}`,
          fontSize: 22,
          color: C.heading,
        }}
      >
        <span>Infinite Table</span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 14,
            letterSpacing: 2,
            color: C.accentText,
          }}
        >
          VS
        </span>
      </div>
      {shown.map((item, index) => (
        <div
          key={item}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 44,
            padding: '0 18px',
            background: index % 2 ? C.zebra : 'transparent',
            borderBottom: `1px solid ${C.line}`,
            fontSize: 20,
            color: C.fg,
          }}
        >
          {item}
        </div>
      ))}
      {items.length > shown.length ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 40,
            padding: '0 18px',
            fontFamily: MONO,
            fontSize: 15,
            letterSpacing: 2,
            color: C.muted,
          }}
        >
          {`+ ${items.length - shown.length} MORE`}
        </div>
      ) : null}
    </div>
  );
}

function Chip({ children, on }: { children: string; on?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 34,
        padding: '0 14px',
        border: `2px solid ${on ? C.accent : C.lineStrong}`,
        borderRadius: 3,
        background: on ? C.accent : 'transparent',
        fontFamily: MONO,
        fontSize: 17,
        letterSpacing: 2,
        color: on ? C.bg : C.muted,
      }}
    >
      {children}
    </div>
  );
}

function Card({ card }: { card: OgCard }) {
  const visual = card.visual ?? { kind: 'grid' as const };
  // the grid runs off the right edge; the other visuals sit inside the card
  const wide = visual.kind === 'grid';
  const textWidth = wide ? 560 : 610;
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px 64px 48px',
        background: C.bg,
        backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        color: C.fg,
        fontFamily: 'IBM Plex Sans, sans-serif',
      }}
    >
      {/* the accent, along the top edge */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: WIDTH,
          height: 6,
          background: C.accent,
        }}
      />
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          top: 0,
          bottom: 78,
          left: wide ? 664 : 720,
        }}
      >
        {visual.kind === 'versus' ? (
          <VersusVisual other={visual.other} features={visual.features} />
        ) : visual.kind === 'list' ? (
          <ListVisual items={visual.items} />
        ) : (
          <GridVisual />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} width={77} height={36} alt="" />
        <div
          style={{
            fontFamily: MONO,
            fontSize: 23,
            letterSpacing: 5,
            color: C.heading,
          }}
        >
          INFINITE TABLE
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          width: textWidth,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: MONO,
            fontSize: 20,
            letterSpacing: 3,
            color: C.accentText,
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: C.muted, marginRight: 12 }}>{'>'}</span>
          {clip(card.kicker, 36)}
        </div>
        <div
          style={{
            display: 'flex',
            // "Infinite Table vs <name>" reads best on two lines
            fontSize:
              visual.kind === 'versus'
                ? Math.min(52, titleSize(card.title))
                : titleSize(card.title),
            lineHeight: 1.08,
            letterSpacing: -1.5,
            color: C.heading,
          }}
        >
          {clip(card.title, 110)}
        </div>
        {card.description ? (
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              lineHeight: 1.35,
              color: C.fg,
            }}
          >
            {clip(card.description, card.title.length > 56 ? 90 : 130)}
          </div>
        ) : null}
        {card.frameworks ? (
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            {docsFrameworks.ids.map((framework) =>
              card.frameworks!.includes(framework) ? (
                <Chip key={framework} on>
                  {docsFrameworks.label(framework).toUpperCase()}
                </Chip>
              ) : null,
            )}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 20,
          borderTop: `2px solid ${C.lineStrong}`,
          fontFamily: MONO,
          fontSize: 20,
          letterSpacing: 2,
          color: C.muted,
        }}
      >
        <div style={{ display: 'flex', gap: 24 }}>
          {FOOTER_ITEMS.flatMap((text, index) => {
            const item = <span key={text}>{text}</span>;
            return index === 0
              ? [item]
              : [
                  <span key={`/${text}`} style={{ color: C.lineStrong }}>
                    /
                  </span>,
                  item,
                ];
          })}
        </div>
        <div style={{ display: 'flex', color: C.accentText }}>
          infinite-table.com
        </div>
      </div>
    </div>
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const key = slug.join('/').replace(/\.png$/, '');
  const card = getOgCards().get(key);
  if (!card) {
    return new Response('Not found', { status: 404 });
  }
  const fonts = await loadFonts();
  return new ImageResponse(<Card card={card} />, {
    width: WIDTH,
    height: HEIGHT,
    fonts: fonts.length ? fonts : undefined,
  });
}
