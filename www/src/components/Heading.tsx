'use client';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getHashForText } from '../utils/getMarkdownHeadings';
import { toHashUrl } from '../utils/toHashUrl';

function Heading(props: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
}) {
  const levelCls = {
    1: 'lg:text-5xl md:text-4xl text-3xl mt-12',
    2: 'lg:text-4xl md:text-3xl text-2xl mt-10',
    3: 'lg:text-3xl md:text-2xl text-xl mt-8',
    4: 'lg:text-2xl md:text-xl text-lg mt-6',
    5: 'lg:text-xl md:text-lg text-md mt-4',
    6: 'lg:text-xl md:text-lg text-md mt-2',
  }[props.level];

  const Cmp =
    motion[`h${props.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'];

  const isLink = typeof props.children === 'string' && props.level <= 3;
  const currentPath = usePathname();

  const pathNoTrailingSlash = currentPath.endsWith('/')
    ? currentPath.slice(0, -1)
    : currentPath;

  const hash = isLink
    ? toHashUrl(getHashForText(props.children as string))
    : undefined;

  return (
    <Cmp
      id={hash}
      className={
        props.className ||
        `${levelCls} mb-10 tracking-tight font-extrabold group relative`
      }
    >
      {props.children}
      {(isLink || hash) && (
        <Link
          href={{ pathname: pathNoTrailingSlash, hash }}
          className="group-hover:opacity-50 opacity-0 font-medium absolute left-[-1em]"
        >
          #
        </Link>
      )}
    </Cmp>
  );
}

type HeadingProps = {
  children: ReactNode;
  className?: string;
};

export function Heading1(props: HeadingProps) {
  return (
    <Heading level={1} className={props.className}>
      {props.children}
    </Heading>
  );
}

export function Heading2(props: HeadingProps) {
  return (
    <Heading level={2} className={props.className}>
      {props.children}
    </Heading>
  );
}

export function Heading3(props: HeadingProps) {
  return (
    <Heading level={3} className={props.className}>
      {props.children}
    </Heading>
  );
}
export function Heading4(props: HeadingProps) {
  return (
    <Heading level={4} className={props.className}>
      {props.children}
    </Heading>
  );
}

export function Heading5(props: HeadingProps) {
  return (
    <Heading level={5} className={props.className}>
      {props.children}
    </Heading>
  );
}

export function Heading6(props: HeadingProps) {
  return (
    <Heading level={6} className={props.className}>
      {props.children}
    </Heading>
  );
}
