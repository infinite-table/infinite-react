import { asMeta } from '@www/utils/asMeta';
import RecentPosts from './RecentPosts';
import { sortedPosts } from './sortedPosts';

export const metadata = asMeta({
  title: 'Blog | Infinite Table DataGrid for React',
  description:
    'Official Infinite Table React news, announcements, and release notes. Infinite Table is the modern DataGrid for building React apps — faster.',
});
export default function Blog() {
  // console.log(
  //   sortedPosts.map((post) => {
  //     return {
  //       title: post.title,
  //       readingTime: post.readingTime,
  //     };
  //   }),
  // );
  return <RecentPosts posts={sortedPosts} />;
}
