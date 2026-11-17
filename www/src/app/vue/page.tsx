// /vue - the home page of Infinite Table for Vue. The Vue docs live under
// /vue/docs/...; this page is their front door.
import { VueHomePage } from '@www/components/home/VueHomePage';
import { asMeta } from '@www/utils/asMeta';

export const metadata = asMeta(
  {
    title: 'Infinite Table for Vue — the Vue DataGrid for huge datasets',
    description:
      'Infinite Table is the modern Vue DataGrid for building Vue apps — faster. Virtualized, with sorting, row grouping, pivoting, aggregations, filtering and lazy loading.',
    alternates: { canonical: 'https://infinite-table.com/vue' },
  },
  'vue',
);

export default function VueLandingPage() {
  return <VueHomePage />;
}
