'use client';
import { useMDXComponent } from 'next-contentlayer/hooks';
import { MDXComponents } from './MDX/xMDXComponents';

export function MDXContent({ children }: { children: string }) {
  const MDXContentFromContentLayer = useMDXComponent(children);

  return (
    <MDXContentFromContentLayer
      /* @ts-ignore */
      components={MDXComponents}
    ></MDXContentFromContentLayer>
  );
}
