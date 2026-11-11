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

// What the blog index and the tag pages list. In dev mode this includes the
// drafts (marked as such), so a post can be checked in place before it goes out.
export const listedPosts =
  process.env.NODE_ENV === 'development'
    ? sortedPostsIncludingDrafts
    : sortedPosts;
