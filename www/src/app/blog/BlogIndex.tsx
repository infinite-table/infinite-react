'use client';

import cmpStyles from '@www/components/components.module.css';
import { BlogPost } from '@www/utils/blogUtils';
import cn from 'classnames';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import Link from 'next/link';
import { useMemo } from 'react';
import { tagHref } from './blogTagUtils';
import { BlostPostExcerpt } from './BlostPostExcerpt';

function getAuthor(post: BlogPost) {
  let author = post.author;
  if (Array.isArray(author)) {
    author = author[0];
  }
  return author;
}

function PostMeta({ post }: { post: BlogPost }) {
  const author = getAuthor(post);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-content-color/70">
      {author ? (
        <>
          <span>
            By <b className="text-content-color/90">{author}</b>
          </span>
          <span>·</span>
        </>
      ) : null}
      <time dateTime={post.date}>
        {format(
          parseISO(post.date ?? new Date().toISOString()),
          'MMMM dd, yyyy',
        )}
      </time>
      {post.readingTime ? (
        <>
          <span>·</span>
          <span>{post.readingTime}</span>
        </>
      ) : null}
    </div>
  );
}

function PostTags({ tags }: { tags?: string[] }) {
  if (!tags?.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tags.map((tag) => (
        <Link
          key={tag}
          href={tagHref(tag)}
          className="text-xs px-2.5 py-0.5 rounded-full bg-deep-dark/80 border border-white/10 text-content-color/60 capitalize hover:border-glow/40 hover:text-content-color transition-colors"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}

function PostThumbnail({
  post,
  className,
}: {
  post: BlogPost;
  className?: string;
}) {
  if (!post.thumbnail) {
    return null;
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg bg-deep-dark/40 border border-white/5',
        className,
      )}
    >
      <img
        src={post.thumbnail}
        alt={post.title}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Link
      href={post.href}
      className="group block mb-16 rounded-xl border border-white/10 bg-deep-dark/40 hover:bg-deep-dark/60 transition-colors overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-6 md:p-8">
          <span className="text-xs uppercase tracking-wider text-glow font-semibold mb-3 block">
            Latest
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-content-color group-hover:text-link transition-colors">
            {post.title}
          </h2>
          <div className="text-content-color/70 mb-4 leading-relaxed">
            <BlostPostExcerpt post={post} />
          </div>
          <PostMeta post={post} />
          <PostTags tags={post.tags} />
        </div>
        {post.thumbnail ? (
          <PostThumbnail
            post={post}
            className="lg:w-[42%] aspect-video lg:aspect-auto lg:min-h-[280px] rounded-none border-0 border-t lg:border-t-0 lg:border-l border-white/5"
          />
        ) : null}
      </div>
    </Link>
  );
}

function TimelinePost({ post }: { post: BlogPost }) {
  const date = parseISO(post.date ?? new Date().toISOString());

  return (
    <Link
      href={post.href}
      className="group flex flex-col sm:flex-row gap-4 md:gap-6 py-6 border-b border-white/5 hover:bg-white/2 -mx-4 px-4 rounded-lg transition-colors"
    >
      <div className="flex gap-4 md:gap-6 flex-1 min-w-0">
        <div className="shrink-0">
          <div className="inline-flex flex-col items-center px-3 py-2 rounded-lg bg-deep-dark/60 border border-white/10 min-w-16">
            <span className="text-xs uppercase text-content-color/50">
              {format(date, 'MMM')}
            </span>
            <span className="text-xl font-bold text-content-color leading-tight">
              {format(date, 'dd')}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2 text-content-color group-hover:text-link transition-colors">
            {post.title}
          </h3>
          <div className="text-content-color/70 text-sm leading-relaxed mb-3 line-clamp-2">
            <BlostPostExcerpt post={post} />
          </div>
          <PostMeta post={post} />
        </div>
      </div>

      <PostThumbnail
        post={post}
        className="w-full sm:w-52 md:w-60 aspect-video sm:aspect-4/3 shrink-0"
      />
    </Link>
  );
}

export default function BlogIndex({
  posts,
  selectedTag,
  childrenAfterHeader,
}: {
  posts: BlogPost[];
  selectedTag?: string;
  childrenAfterHeader?: React.ReactNode;
}) {
  const publishedPosts = useMemo(
    () => posts.filter((post) => !post.draft),
    [posts],
  );

  const allTags = useMemo(
    () =>
      Array.from(
        new Set(
          publishedPosts.flatMap((post) => post.tags ?? []).filter(Boolean),
        ),
      ).sort(),
    [publishedPosts],
  );

  const filteredPosts = useMemo(() => {
    if (!selectedTag) {
      return publishedPosts;
    }
    return publishedPosts.filter((post) => post.tags?.includes(selectedTag));
  }, [publishedPosts, selectedTag]);

  const featuredPost = filteredPosts[0] ?? null;
  const remainingPosts = filteredPosts.slice(1);

  const postsByYear = useMemo(() => {
    const groups: Record<string, BlogPost[]> = {};

    for (const post of remainingPosts) {
      const year = format(
        parseISO(post.date ?? new Date().toISOString()),
        'yyyy',
      );
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(post);
    }

    return Object.entries(groups).sort(
      ([yearA], [yearB]) => Number(yearB) - Number(yearA),
    );
  }, [remainingPosts]);

  return (
    <>
      <header className="pb-8">
        <h1
          className={`text-5xl py-4 font-black tracking-tighter ${cmpStyles.HighlightBrandToLightBackground}`}
        >
          Infinite Blog
        </h1>
        {childrenAfterHeader}
        <p className="text-content-color opacity-70 text-xl leading-large">
          News, announcements and release notes on Infinite Table.
          {selectedTag ? (
            <>
              {' '}
              Showing posts tagged{' '}
              <span className="text-content-color capitalize">
                {selectedTag}
              </span>
              .
            </>
          ) : null}
        </p>

        {allTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-8">
            <Link
              href="/blog"
              className={cn(
                'text-sm px-4 py-1.5 rounded-full border transition-colors capitalize',
                !selectedTag
                  ? 'bg-glow/20 border-glow/40 text-content-color'
                  : 'bg-deep-dark/40 border-white/10 text-content-color/60 hover:border-white/20 hover:text-content-color',
              )}
            >
              All
            </Link>
            {allTags.map((tag) => (
              <Link
                key={tag}
                href={tagHref(tag)}
                className={cn(
                  'text-sm px-4 py-1.5 rounded-full border transition-colors capitalize',
                  selectedTag === tag
                    ? 'bg-glow/20 border-glow/40 text-content-color'
                    : 'bg-deep-dark/40 border-white/10 text-content-color/60 hover:border-white/20 hover:text-content-color',
                )}
              >
                {tag}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      {featuredPost ? <FeaturedPost post={featuredPost} /> : null}

      <div className="pb-40">
        {postsByYear.map(([year, yearPosts]) => (
          <section key={year} className="mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-content-color/40 mb-2 pb-2 border-b border-white/10">
              {year}
            </h2>
            <div>
              {yearPosts.map((post) => (
                <TimelinePost key={post.href} post={post} />
              ))}
            </div>
          </section>
        ))}

        {filteredPosts.length === 0 ? (
          <p className="text-content-color/60 py-12 text-center">
            No posts match this tag.
          </p>
        ) : null}
      </div>
    </>
  );
}
