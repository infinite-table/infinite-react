import cmpStyles from '@www/components/components.module.css';

import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import Link from 'next/link';

import { BlogPost } from '@www/utils/blogUtils';
import { BlostPostExcerpt } from './BlostPostExcerpt';
import { CenterContent } from '../CenterContent';

export default function RecentPosts({ posts }: { posts: BlogPost[] }) {
  return (
    <>
      <CenterContent>
        <header className=" pb-8 ">
          <div className="inline-flex items-center mb-8">
            <h1
              className={`text-5xl py-4 font-black tracking-tighter  ${cmpStyles.HighlightBrandToLightBackground}`}
            >
              Infinite Blog
            </h1>
            {/* <a
                href="/feed.xml"
                className="p-2 betterhover:hover:bg-gray-20 transition duration-150 ease-in-out rounded-lg inline-flex items-center">
                <IconRss className="w-5 h-5 mr-2" />
                RSS
              </a> */}
          </div>
          <p className="text-content-color opacity-70 text-xl leading-large">
            News, announcements and release notes on Infinite Table.
          </p>
        </header>
        <div className="space-y-16 pb-40">
          {posts
            .filter((post) => !post.draft)
            .map((post) => {
              let author = post.author;
              if (Array.isArray(author)) {
                author = author[0];
              }
              return (
                <div key={post.href}>
                  <h3 className="font-bold leading-8 text-content-color text-2xl mb-4 hover:underline">
                    <Link href={post.href}>
                      {post.title}
                      {post.thumbnail && (
                        <div className="relative aspect-video overflow-hidden rounded-t-lg max-h-52 my-8">
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </Link>
                  </h3>

                  <BlostPostExcerpt post={post} />
                  <div className="flex items-center mt-4">
                    <div>
                      <p className="text-sm leading-5 ">
                        By <b>{author}</b>
                      </p>
                      <div className="flex text-sm leading-5  ">
                        <time dateTime={post.date}>
                          {format(
                            parseISO(post.date ?? new Date().toISOString()),
                            'MMMM dd, yyyy',
                          )}
                        </time>
                        <span className="mx-1">·</span>
                        <span>{post.readingTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </CenterContent>
    </>
  );
}
