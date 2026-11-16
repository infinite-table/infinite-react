import { HomePage } from '@www/components/home/HomePage';
import { asMeta } from '@www/utils/asMeta';
import { sortedPosts } from './blog/sortedPosts';

const seoTitle =
  'Infinite Table DataGrid for React — One Table — Infinite Applications.';
const seoDescription = `Infinite Table DataGrid for React — One Table — Infinite Applications. Infinite Table is the modern DataGrid for building React apps — faster.`;

export const metadata = asMeta({
  title: seoTitle,
  description: seoDescription,
});

export default function Home() {
  return (
    <HomePage
      posts={sortedPosts.filter((post) => !post.hide_in_homepage).slice(0, 4)}
    />
  );
}
