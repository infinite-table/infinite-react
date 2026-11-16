/*
 * The social preview images (og:image, twitter:image): one card per page
 * that has its own, rendered at build time by app/og/[...slug]/route.tsx to
 * /og/<slug>.png. Pages pass their slug to asMeta; everything else gets
 * the site card.
 */
import { competitors } from '@www/compare/matrix';
import { SITE_THEMES } from '@www/components/themes/registry';
import { sortedPosts } from '@www/app/blog/sortedPosts';
import {
  getDocsPage,
  getDocsPageMeta,
  getDocsPagePaths,
} from '@www/utils/docsFrameworkContent';

export type OgCard = {
  /** the image is /og/<slug>.png */
  slug: string;
  /** small caps line above the title */
  kicker: string;
  title: string;
};

export const SITE_OG_SLUG = 'site';

export const ogImagePath = (slug: string) => `/og/${slug}.png`;

const STATIC_CARDS: OgCard[] = [
  {
    slug: SITE_OG_SLUG,
    kicker: 'One Table — Infinite Applications',
    title: 'The DataGrid for React and Vue, built for speed.',
  },
  {
    slug: 'themes',
    kicker: 'Themes',
    title: `${SITE_THEMES.length} themes. Light and dark. Three densities.`,
  },
  {
    slug: 'pricing',
    kicker: 'Pricing',
    title: 'One license — infinite applications.',
  },
  {
    slug: 'compare',
    kicker: 'Compare',
    title: `How Infinite Table compares to ${competitors.length} data grids.`,
  },
  {
    slug: 'benchmark',
    kicker: 'Benchmark',
    title: 'Infinite Table, MUI X, AG Grid and TanStack Table, at a million rows.',
  },
  {
    slug: 'blog',
    kicker: 'Blog',
    title: 'News, releases and how-tos from the Infinite Table team.',
  },
  {
    slug: 'demo',
    kicker: 'Live demo',
    title: 'A live trading blotter: 10,000 rows ticking, grouped and pivoted.',
  },
];

/** "/docs/learn/grouping-and-pivoting/pivoting" -> "Docs / Grouping and pivoting" */
function docsKicker(neutralPath: string) {
  const [, , section, group] = neutralPath.split('/');
  if (section === 'reference') return 'API reference';
  if (section === 'releases') return 'Releases';
  if (!group) return 'Docs';
  const words = group.replace(/-/g, ' ');
  return `Docs / ${words[0].toUpperCase()}${words.slice(1)}`;
}

/** The slug of a docs page's card, from its neutral path (`/docs/learn/sorting`). */
export function docsOgSlug(neutralPath: string) {
  return neutralPath.replace(/^\/+|\/+$/g, '') || 'docs';
}

function docsCards(): OgCard[] {
  const paths = new Set([
    ...getDocsPagePaths('react'),
    ...getDocsPagePaths('vue'),
  ]);
  const cards: OgCard[] = [];
  for (const path of paths) {
    const page = getDocsPage(path);
    if (!page || page.frontmatter.redirect_to) continue;
    const title = getDocsPageMeta(page, 'react').title ?? page.frontmatter.title;
    if (!title) continue;
    cards.push({ slug: docsOgSlug(path), kicker: docsKicker(path), title });
  }
  return cards;
}

function compareCards(): OgCard[] {
  return competitors.map((product) => ({
    slug: `compare/${product.id}`,
    kicker: 'Compare',
    title: `Infinite Table vs ${product.name}`,
  }));
}

/** blog posts that have no thumbnail of their own */
function blogCards(): OgCard[] {
  return sortedPosts
    .filter((post) => !post.thumbnail)
    .map((post) => ({
      slug: post.path.replace(/^\/+|\/+$/g, ''),
      kicker: 'Blog',
      title: post.title,
    }));
}

let cards: Map<string, OgCard> | null = null;

export function getOgCards() {
  if (!cards) {
    cards = new Map();
    for (const card of [
      ...STATIC_CARDS,
      ...compareCards(),
      ...docsCards(),
      ...blogCards(),
    ]) {
      cards.set(card.slug, card);
    }
  }
  return cards;
}

/** The image a page should use: its own card if it has one, else the site's. */
export function ogImageFor(slug: string | undefined) {
  return ogImagePath(slug && getOgCards().has(slug) ? slug : SITE_OG_SLUG);
}
