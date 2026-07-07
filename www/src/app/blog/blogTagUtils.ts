import { BlogPost } from '@www/utils/blogUtils';

export function tagToSlug(tag: string) {
  return tag.toLowerCase().trim();
}

export function findTagBySlug(
  slug: string,
  tags: string[],
): string | undefined {
  return tags.find((tag) => tagToSlug(tag) === slug.toLowerCase());
}

export function getAllTagsFromPosts(posts: BlogPost[]) {
  const tags = new Set<string>();

  posts.forEach((post) => {
    if (!post.draft) {
      post.tags?.forEach((tag) => tags.add(tag));
    }
  });

  return Array.from(tags).sort();
}

export function tagHref(tag: string) {
  return `/blog/tags/${tagToSlug(tag)}`;
}
