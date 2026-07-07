import { asMeta } from '@www/utils/asMeta';
import { notFound } from 'next/navigation';
import {
  findTagBySlug,
  getAllTagsFromPosts,
  tagToSlug,
} from '../../blogTagUtils';
import RecentPosts from '../../RecentPosts';
import { sortedPosts } from '../../sortedPosts';

const suffix = '| Infinite Table DataGrid for React';

export function generateStaticParams() {
  return getAllTagsFromPosts(sortedPosts).map((tag) => ({
    tag: tagToSlug(tag),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: slug } = await params;
  const tag = findTagBySlug(slug, getAllTagsFromPosts(sortedPosts));

  if (!tag) {
    return asMeta({
      title: `Blog ${suffix}`,
      description:
        'Official Infinite Table React news, announcements, and release notes.',
    });
  }

  return asMeta({
    title: `${tag} — Infinite Blog ${suffix}`,
    description: `Blog posts tagged with "${tag}" on Infinite Table.`,
  });
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: slug } = await params;
  const tag = findTagBySlug(slug, getAllTagsFromPosts(sortedPosts));

  if (!tag) {
    notFound();
  }

  return <RecentPosts posts={sortedPosts} selectedTag={tag} />;
}
