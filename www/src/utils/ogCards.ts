/*
 * The social preview images (og:image, twitter:image): one card per page
 * that has its own, rendered at build time by app/og/[...slug]/route.tsx to
 * /og/<slug>.png. Pages pass their slug to asMeta; everything else gets
 * the site card.
 */
import { competitors, FEATURE_KEYS } from '@www/compare/matrix';
import { SITE_THEMES } from '@www/components/themes/registry';
import { sortedPosts } from '@www/app/blog/sortedPosts';
import {
  getDocsPage,
  getDocsPageMeta,
  getDocsPagePaths,
} from '@www/utils/docsFrameworkContent';
import {
  docsFrameworks,
  type DocsFrameworkId,
} from '@www/utils/docsFrameworks';
import { docsFrameworksText } from '@www/utils/docsFrameworksRegistry';

export type OgCard = {
  /** the image is /og/<slug>.png */
  slug: string;
  /** small caps line above the title */
  kicker: string;
  title: string;
  /** one or two lines under the title */
  description?: string;
  /** docs pages: the frameworks the page is written for */
  frameworks?: DocsFrameworkId[];
  /**
   * what the card shows next to the text: a data grid (the default), the
   * two products of a comparison, or a list of names
   */
  visual?:
    | { kind: 'grid' }
    | { kind: 'versus'; other: string; features: number }
    | { kind: 'list'; items: string[] };
};

export const SITE_OG_SLUG = 'site';

export const ogImagePath = (slug: string) => `/og/${slug}.png`;

const STATIC_CARDS: OgCard[] = [
  {
    slug: SITE_OG_SLUG,
    kicker: 'One Table — Infinite Applications',
    title: `The DataGrid for ${docsFrameworksText()}, built for speed.`,
    description:
      'Sorting, grouping, pivoting, filtering, editing and lazy loading, with no dependencies.',
  },
  {
    slug: 'vue',
    kicker: 'Infinite Table for Vue',
    title: 'The DataGrid for Vue 3, built for speed.',
    description:
      'Sorting, grouping, pivoting, filtering, editing and lazy loading, in one Vue component.',
  },
  {
    slug: 'angular',
    kicker: 'Infinite Table for Angular',
    title: 'The DataGrid for Angular, built for speed.',
    description:
      'Sorting, grouping, pivoting, filtering, editing and lazy loading, in one Angular component.',
  },
  {
    slug: 'themes',
    kicker: 'Themes',
    title: `${SITE_THEMES.length} themes. Light and dark. Three densities.`,
    description: 'Try every theme on a live grid and copy its CSS variables.',
  },
  {
    slug: 'pricing',
    kicker: 'Pricing',
    title: 'One license — infinite applications.',
    description: 'Licensed per developer. Free to try, with every feature.',
  },
  {
    slug: 'compare',
    kicker: 'Compare',
    title: `How Infinite Table compares to ${competitors.length} data grids.`,
    description: `${FEATURE_KEYS.length} features, licensing, bundle size and dependencies, each with its source.`,
    visual: { kind: 'list', items: competitors.map((product) => product.name) },
  },
  {
    slug: 'benchmark',
    kicker: 'Benchmark',
    title:
      'Infinite Table, MUI X, AG Grid and TanStack Table, at a million rows.',
    description:
      'Mount, scroll, sort and filter, measured in CI with open sources.',
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
    description: 'Real-time updates, grouping and pivoting in one grid.',
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

/**
 * The slug of a docs page's card, from its neutral path (`/docs/learn/sorting`)
 * and the framework of the URL: each framework's page has its own card
 * (`docs/learn/sorting`, `vue/docs/learn/sorting`), with its own wording.
 */
export function docsOgSlug(
  neutralPath: string,
  framework: DocsFrameworkId = docsFrameworks.default,
) {
  const slug = neutralPath.replace(/^\/+|\/+$/g, '') || 'docs';
  return framework === docsFrameworks.default ? slug : `${framework}/${slug}`;
}

function docsCards(): OgCard[] {
  const cards: OgCard[] = [];
  for (const framework of docsFrameworks.ids) {
    for (const path of getDocsPagePaths(framework)) {
      const page = getDocsPage(path);
      if (!page || page.frontmatter.redirect_to) continue;
      const meta = getDocsPageMeta(page, framework);
      const title = meta.title ?? page.frontmatter.title;
      if (!title) continue;
      cards.push({
        slug: docsOgSlug(path, framework),
        kicker: docsKicker(path),
        title,
        // only a description the page wrote, not an excerpt of its first lines
        description: page.frontmatter.description
          ? meta.description
          : undefined,
        frameworks: [framework],
      });
    }
  }
  return cards;
}

function compareCards(): OgCard[] {
  return competitors.map((product) => ({
    slug: `compare/${product.id}`,
    kicker: 'Compare',
    title: `Infinite Table vs ${product.name}`,
    description:
      'Features, licensing, bundle size and dependencies, side by side.',
    visual: {
      kind: 'versus',
      other: product.name,
      features: FEATURE_KEYS.length,
    },
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
      description: post.description || undefined,
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
