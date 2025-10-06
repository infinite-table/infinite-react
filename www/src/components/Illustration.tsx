'use client';
import * as React from 'react';

function AuthorCredit({
  author,
  authorLink,
}: {
  author: string;
  authorLink: string;
}) {
  return (
    <p className="text-center text-secondary-dark text-base mt-2">
      <cite>
        Illustrated by{' '}
        {authorLink ? (
          <a className="text-link" href={authorLink}>
            {author}
          </a>
        ) : (
          author
        )}
      </cite>
    </p>
  );
}
export function Illustration({
  caption,
  src,
  alt,
  author,
  authorLink,
}: {
  caption: string;
  src: string;
  alt: string;
  author: string;
  authorLink: string;
  children: any;
}) {
  return (
    <div className="my-16 mx-0 2xl:mx-auto max-w-4xl 2xl:max-w-6xl">
      <figure className="my-8 flex justify-center">
        <img src={src} alt={alt} style={{ maxHeight: 300 }} />
        {caption ? (
          <figcaption className="text-center leading-tight mt-4">
            {caption}
          </figcaption>
        ) : null}
      </figure>
      {author ? <AuthorCredit author={author} authorLink={authorLink} /> : null}
    </div>
  );
}

export function IllustrationBlock({
  title,
  sequential,
  author,
  authorLink,
  children,
}: {
  title: string;
  author: string;
  authorLink: string;
  sequential: boolean;
  children: any;
}) {
  const imageInfos = React.Children.toArray(children).map(
    (child: any) => child.props,
  );
  const images = imageInfos.map((info, index) => (
    <figure key={index}>
      <div className="flex-1 flex p-0 xl:px-6 justify-center items-center my-4">
        <img src={info.src} alt={info.alt} height={info.height} />
      </div>
      {info.caption ? (
        <figcaption className="text-secondary-dark text-center leading-tight mt-4">
          {info.caption}
        </figcaption>
      ) : null}
    </figure>
  ));
  return (
    <div className="my-16 mx-0 2xl:mx-auto max-w-4xl 2xl:max-w-6xl">
      {title ? (
        <h3 className="text-center text-xl font-bold leading-9 mb-4">
          {title}
        </h3>
      ) : null}
      {sequential ? (
        <ol className="mdx-illustration-block flex">
          {images.map((x: any, i: number) => (
            <li className="flex-1" key={i}>
              {x}
            </li>
          ))}
        </ol>
      ) : (
        <div className="mdx-illustration-block">{images}</div>
      )}
      {author ? <AuthorCredit author={author} authorLink={authorLink} /> : null}
      {/* @ts-ignore */}
      <style jsx global>{`
        .mdx-illustration-block {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          justify-content: center;
          align-content: stretch;
          align-items: stretch;
          gap: 42px;
        }
        ol.mdx-illustration-block {
          gap: 60px;
        }
        .mdx-illustration-block li {
          display: flex;
          align-items: flex-start;
          align-content: stretch;
          justify-content: space-around;
          position: relative;
          padding: 1rem;
        }
        .mdx-illustration-block figure {
          display: flex;
          flex-direction: column;
          align-content: center;
          align-items: center;

          justify-content: space-between;
          position: relative;
          height: 100%;
        }
        .mdx-illustration-block li:after {
          content: ' ';
          display: block;
          position: absolute;
          top: 50%;
          right: 100%;
          transform: translateY(-50%);
          width: 60px;
          height: 49px;
          background: center / contain no-repeat url('/images/g_arrow.png');
        }
        .mdx-illustration-block li:first-child:after {
          content: ' ';
          display: none;
        }
        .mdx-illustration-block img {
          max-height: 250px;
          width: 100%;
        }
        @media (max-width: 680px) {
          .mdx-illustration-block {
            flex-direction: column;
          }
          .mdx-illustration-block img {
            max-height: 200px;
          }
          .mdx-illustration-block li:after {
            top: 0;
            left: 50%;
            right: auto;
            transform: translateX(-50%) translateY(-100%) rotate(90deg);
          }
        }
      `}</style>
    </div>
  );
}
