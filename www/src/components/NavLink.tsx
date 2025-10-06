import type { Route } from 'next';
import type { GeneratedRoute } from '@www/.gen/routes';
import { TypedLink } from './TypedLink';

export type ValidRoute<T extends string> =
  | Exclude<Route<T> | URL, `/docs${string}`>
  | `/docs${GeneratedRoute}`
  | '/docs';

export function NavLink<T extends string>(props: {
  children: string;
  href: ValidRoute<T>;
}) {
  return (
    <TypedLink
      className={`text-textcolorpale hover:text-white text-ellipsis overflow-hidden whitespace-nowrap block py-1 flex-none`}
      // @ts-ignore
      href={props.href}
      style={{
        transition: 'opacity .2s, color .2s',
      }}
    >
      {props.children}
    </TypedLink>
  );
}
