import { asMeta } from '@www/utils/asMeta';

import RecentPosts from './RecentPosts';
import { listedPosts } from './sortedPosts';

export const metadata = asMeta({
  title: 'Blog | Infinite Table DataGrid for React',
  description:
    'Official Infinite Table React news, announcements, and release notes. Infinite Table is the modern DataGrid for building React apps — faster.',
});
export default function Blog() {
  return <RecentPosts posts={listedPosts} />;
}
