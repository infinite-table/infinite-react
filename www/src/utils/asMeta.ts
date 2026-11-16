import { Metadata } from 'next';

import { ogImageFor } from './ogCards';

/**
 * Fills in the Open Graph and Twitter fields from the title and the
 * description, with the page's social preview image: `og` is the slug of its
 * card (utils/ogCards.ts); without one, or when it has none, the site card.
 * A page that sets its own `openGraph.images` (a blog post thumbnail) keeps it.
 */
export function asMeta(meta: Metadata, og?: string) {
  meta.twitter =
    meta.twitter || ({} as Exclude<Metadata['twitter'], null | undefined>);

  meta.twitter.title = meta.twitter.title || meta.title || '';
  meta.twitter.description = meta.twitter.description || meta.description || '';

  meta.openGraph =
    meta.openGraph || ({} as Exclude<Metadata['openGraph'], null | undefined>);

  meta.openGraph.title = meta.openGraph.title || meta.title || '';
  meta.openGraph.description =
    meta.openGraph.description || meta.description || '';

  if (!meta.openGraph.images) {
    const image = {
      url: ogImageFor(og),
      width: 1200,
      height: 630,
      alt: String(meta.openGraph.title || ''),
    };
    meta.openGraph.images = [image];
    // @ts-ignore - `card` is only on some of the Twitter metadata variants
    meta.twitter.card = 'summary_large_image';
    meta.twitter.images = [image.url];
  }

  return meta;
}
