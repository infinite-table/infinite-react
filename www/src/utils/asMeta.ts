import { Metadata } from 'next';

export function asMeta(meta: Metadata) {
  meta.twitter =
    meta.twitter || ({} as Exclude<Metadata['twitter'], null | undefined>);

  meta.twitter.title = meta.twitter.title || meta.title || '';
  meta.twitter.description = meta.twitter.description || meta.description || '';

  meta.openGraph =
    meta.openGraph || ({} as Exclude<Metadata['openGraph'], null | undefined>);

  meta.openGraph.title = meta.openGraph.title || meta.title || '';
  meta.openGraph.description =
    meta.openGraph.description || meta.description || '';

  return meta;
}
