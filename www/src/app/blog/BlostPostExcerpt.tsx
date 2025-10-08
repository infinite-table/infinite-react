'use client';

import type { BlogPost } from './sortedPosts';

export const BlostPostExcerpt = ({ post }: { post: BlogPost }) => {
  return post.description ? (
    <div
      className={' mb-0 font-light'}
      dangerouslySetInnerHTML={{
        __html: post.description,
      }}
    />
  ) : null;
};
