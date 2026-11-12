import NextLink from 'next/link';
import { ValidRoute } from './NavLink';

export function DocsLink<T extends string>(props: {
  children: string;
  href: ValidRoute<T>;
  /** Set on a Vue page when the link goes to the React page (there is no Vue one yet). */
  'data-framework-fallback'?: string;
}) {
  return (
    <NextLink
      className={` text-link hover:underline underline-offset-5 hover:text-link/80 `}
      href={props.href as any}
      data-framework-fallback={props['data-framework-fallback']}
    >
      {props.children}
    </NextLink>
  );
}
