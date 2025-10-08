import NextLink from 'next/link';
import { ValidRoute } from './NavLink';

export function DocsLink<T extends string>(props: {
  children: string;
  href: ValidRoute<T>;
}) {
  return (
    <NextLink
      className={` text-link hover:underline underline-offset-5 hover:text-link/80 `}
      href={props.href as any}
    >
      {props.children}
    </NextLink>
  );
}
