import { asMeta } from '@www/utils/asMeta';
import { getMarkdownHeadings } from '@www/utils/getMarkdownHeadings';
import { Metadata } from 'next';
import { sortedPosts, type Post } from '../sortedPosts';
import { BlogPost } from './BlogPost';

const suffix = '| Infinite Table DataGrid for React';
const meta = {
  title: `Blog ${suffix}`,
  description: `Official Infinite Table React news, announcements, and release notes. Infinite Table is the modern DataGrid for building React apps — faster.`,
};

export async function generateStaticParams() {
  const result = sortedPosts
    .map((post) => {
      return {
        blogpost: post.url
          .split('/')
          .slice(2) // to take out the first empty string and the '/blog' portion
          .map((x) => x.trim())
          .filter(Boolean),
      };
    })
    .filter((x) => x.blogpost.length > 0);

  // console.log('result', result);
  return result;
}

export const generateMetadata = async ({
  params,
}: {
  params: { blogpost: string[] };
}): Promise<Metadata> => {
  const path = `/blog/${params.blogpost.join('/')}`;

  const postIndex = sortedPosts.findIndex((post) => post.url === path);
  const post = sortedPosts[postIndex] as Post;

  const res = {
    title: (post?.title ? `${post?.title} ${suffix}` : null) ?? meta.title,
    description:
      (post?.description ? `${post.description} ${suffix}` : null) ??
      meta.description,
  };

  return asMeta(res);
};
export default function BlogPostPage({
  params,
}: {
  params: { blogpost: string[] };
}) {
  const path = `/blog/${params.blogpost.join('/')}`;

  const postIndex = sortedPosts.findIndex((post) => post.url === path);
  const post = sortedPosts[postIndex] as Post;

  // the prev post is older, so it's the next post in the array
  const prevPost = sortedPosts[postIndex + 1];

  // the next post is more recent, so it's the previous post in the array
  const nextPost = sortedPosts[postIndex - 1];

  return (
    <BlogPost
      headings={getMarkdownHeadings(post.body.raw)}
      post={{
        author: post.author,
        date: post.date,
        title: post.title,
        url: post.url,
        body: {
          code: post.body.code,
        },
      }}
      nextRoute={
        nextPost
          ? {
              title: nextPost?.title,
              path: nextPost?.url,
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
              path: prevPost?.url,
            }
          : {
              title: 'All posts',
              path: '/blog',
            }
      }
    />
  );
}
