// import { allPosts, type Post } from 'contentlayer/generated';

import { getBlogPosts } from '../../utils/blogUtils';
// they are sorted by date in descending order - so the most recent post is first
export const sortedPosts = getBlogPosts();

import type { BlogPost } from '../../utils/blogUtils';

export type { BlogPost };

export const sortedPostsIncludingDrafts = getBlogPosts({
  skipDrafts: false,
});
