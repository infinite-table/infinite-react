'use client';
import * as React from 'react';

import { useTocHighlight } from './useTocHighlight';

export function Toc({
  headings,
  noHighlight,
}: {
  noHighlight?: boolean;
  headings: Array<{
    url: string;
    text: React.ReactNode;
    depth: number;
  }>;
}) {
  // if (headings && headings.length > 0) {
  //   headings = [
  //     {
  //       depth: 1,
  //       text: 'Overview',
  //       url: '#',
  //     },
  //     ...headings,
  //   ];
  // }
  const { currentIndex } = useTocHighlight();
  // TODO: We currently have a mismatch between the headings in the document
  // and the headings we find in MarkdownPage (i.e. we don't find Recap or Challenges).
  // Select the max TOC item we have here for now, but remove this after the fix.
  const selectedIndex = noHighlight
    ? -1
    : Math.min(currentIndex, headings.length - 1);
  return (
    <nav role="navigation" aria-label="On this page" className="docs-toc">
      <h2 className="docs-toc__label">On this page</h2>
      <ul className="docs-toc__list">
        {headings.map((h, i) => {
          if (h.url == null) {
            // TODO: only log in DEV
            console.error('Heading does not have URL');
          }
          if (h.depth && h.depth > 3) {
            return null;
          }
          return (
            <li key={`heading-${h.url}-${i}`}>
              <a
                href={h.url}
                data-depth={h.depth === 3 ? 3 : 2}
                aria-current={selectedIndex === i ? 'location' : undefined}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
