import { Metadata } from 'next';
import { asMeta } from '@www/utils/asMeta';
import { getMarkdownHeadingsForPage } from '@www/utils/getMarkdownHeadings';

import {
  sortedPosts,
  sortedPostsIncludingDrafts,
  BlogPost as BlogPostType,
} from '../sortedPosts';
import { BlogPost } from './BlogPost';
import { renderMarkdownPage } from '../../../components/renderMarkdownPage';

const suffix = '| Infinite Table DataGrid for React';
const meta = {
  title: `Blog ${suffix}`,
  description: `Official Infinite Table React news, announcements, and release notes. Infinite Table is the modern DataGrid for building React apps — faster.`,
};

export async function generateStaticParams() {
  const result = sortedPostsIncludingDrafts
    .map((post) => {
      return {
        blogpost: post.href
          .split('/')
          .slice(2) // to take out the first empty string and the '/blog' portion
          .map((x) => x.trim())
          .filter(Boolean),
      };
    })
    .filter((x) => x.blogpost.length > 0);

  return result;
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ blogpost: string[] }>;
}): Promise<Metadata> => {
  const p = await params;
  const path = `/blog/${p.blogpost.join('/')}`;

  const postIndex = sortedPostsIncludingDrafts.findIndex(
    (post) => post.href === path,
  );
  const post = sortedPostsIncludingDrafts[postIndex] as BlogPostType;

  const metadata: any = {
    title: (post?.title ? `${post?.title} ${suffix}` : null) ?? meta.title,
    description:
      (post?.description ? `${post.description} ${suffix}` : null) ??
      meta.description,
  };

  const canonical = post
    ? `https://infinite-table.com${post?.path}`
    : 'https://infinite-table.com/blog';

  metadata.openGraph = metadata.openGraph || {};
  metadata.openGraph.type = 'article';
  metadata.openGraph.url = canonical;

  // Add Open Graph image if thumbnail is available
  if (post?.thumbnail) {
    const ogImageUrl = `https://infinite-table.com${post.thumbnail}`;

    metadata.openGraph.images = [
      {
        url: ogImageUrl,
        width: post.thumbnailDimensions?.width,
        height: post.thumbnailDimensions?.height,
        alt: metadata.title || 'Blog post thumbnail',
      },
    ];

    metadata.twitter = {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: [ogImageUrl],
    };
  }

  return asMeta(metadata);
};
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ blogpost: string[] }>;
}) {
  const p = await params;
  const path = `/blog/${p.blogpost.join('/')}`;

  let arr = sortedPosts;
  let postIndex = arr.findIndex((post) => post.href === path);

  if (postIndex === -1) {
    arr = sortedPostsIncludingDrafts;
    postIndex = arr.findIndex((post) => post.href === path);
  }
  const post = arr[postIndex] as BlogPostType;

  // the prev post is older, so it's the next post in the array
  const prevPost = arr[postIndex + 1];

  // the next post is more recent, so it's the previous post in the array
  const nextPost = arr[postIndex - 1];

  const children = await renderMarkdownPage({
    slug: ['blog', ...p.blogpost],
    baseUrl: import.meta.url,
  });

  return (
    <BlogPost
      headings={getMarkdownHeadingsForPage(post.content)}
      children={children}
      post={post}
      nextRoute={
        nextPost
          ? {
              title: nextPost?.title,
              path: nextPost?.href,
            }
          : {
              title: 'All posts',
              path: '/blog',
            }
      }
      prevRoute={
        prevPost
          ? {
              title: prevPost?.title,
              path: prevPost?.href,
            }
          : {
              title: 'All posts',
              path: '/blog',
            }
      }
    />
  );
}
