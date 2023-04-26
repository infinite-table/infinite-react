'use client';

import type { Post } from './sortedPosts';

export const BlostPostExcerpt = ({ post }: { post: Post }) => {
  return post.excerpt ? (
    <div
      className={' mb-0 font-light'}
      dangerouslySetInnerHTML={{
        __html: post.excerpt,
      }}
    />
  ) : null;
};
