// import { allPosts, type Post } from 'contentlayer/generated';

import { getBlogPosts } from '../../utils/blogUtils';
// they are sorted by date in descending order - so the most recent post is first
// drafts are left out: this is what the homepage, the blog sidebar, the tag
// pages and the prev/next links are built from. A draft is still reachable at
// its own URL (see sortedPostsIncludingDrafts below).
export const sortedPosts = getBlogPosts({ skipDrafts: true });

import type { BlogPost } from '../../utils/blogUtils';

export type { BlogPost };

export const sortedPostsIncludingDrafts = getBlogPosts({
  skipDrafts: false,
});
