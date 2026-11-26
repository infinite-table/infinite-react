// /angular - the home page of Infinite Table for Angular. The Angular docs
// live under /angular/docs/...; this page is their front door.
import { AngularHomePage } from '@www/components/home/AngularHomePage';
import { asMeta } from '@www/utils/asMeta';
import { sortedPosts } from '../blog/sortedPosts';

export const metadata = asMeta(
  {
    title:
      'Infinite Table for Angular — the Angular DataGrid for huge datasets',
    description:
      'Infinite Table is the modern Angular DataGrid for building Angular apps — faster. Virtualized, with sorting, row grouping, pivoting, aggregations, filtering and lazy loading.',
    alternates: { canonical: 'https://infinite-table.com/angular' },
  },
  'angular',
);

export default function AngularLandingPage() {
  return (
    <AngularHomePage
      posts={sortedPosts.filter((post) => !post.hide_in_homepage).slice(0, 4)}
    />
  );
}
