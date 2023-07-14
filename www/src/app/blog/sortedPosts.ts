import { allPosts, type Post } from 'contentlayer/generated';

import parseISO from 'date-fns/parseISO';
// they are sorted by date in descending order - so the most recent post is first
export const sortedPosts = allPosts
  .filter((post) => post.draft !== true)
  .sort((post1, post2) =>
    parseISO(post1.date) > parseISO(post2.date) ? -1 : 1,
  );

export const sortedPostsIncludingDrafts = allPosts.sort((post1, post2) =>
  parseISO(post1.date) > parseISO(post2.date) ? -1 : 1,
);

export type { Post };
