/*
 * The social preview images, rendered at build time (static export) to
 * /og/<slug>.png: one per card in utils/ogCards.ts. The Terminal look in
 * the site's dark palette.
 */
import fs from 'node:fs';
import path from 'node:path';

import { ImageResponse } from 'next/og';

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
};

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

function titleSize(title: string) {
  if (title.length > 70) return 56;
  if (title.length > 44) return 64;
  return 76;
}

function Card({ card }: { card: OgCard }) {
  const mono = 'JetBrains Mono, monospace';
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px 56px',
        background: C.bg,
        backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        color: C.fg,
        fontFamily: 'IBM Plex Sans, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} width={86} height={40} alt="" />
        <div
          style={{
            fontFamily: mono,
            fontSize: 26,
            letterSpacing: 5,
            color: C.heading,
          }}
        >
          INFINITE TABLE
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <div
          style={{
            display: 'flex',
            fontFamily: mono,
            fontSize: 24,
            letterSpacing: 4,
            color: C.accentText,
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: C.muted, marginRight: 14 }}>{'>'}</span>
          {card.kicker}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: titleSize(card.title),
            lineHeight: 1.08,
            letterSpacing: -2,
            color: C.heading,
            maxWidth: 1000,
          }}
        >
          {card.title}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 22,
          borderTop: `2px solid ${C.lineStrong}`,
          fontFamily: mono,
          fontSize: 22,
          letterSpacing: 2,
          color: C.muted,
        }}
      >
        <div style={{ display: 'flex', gap: 28 }}>
          <span>REACT</span>
          <span style={{ color: C.lineStrong }}>/</span>
          <span>VUE</span>
          <span style={{ color: C.lineStrong }}>/</span>
          <span>0 DEPENDENCIES</span>
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
