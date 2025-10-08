import NextLink from 'next/link';
import type { Route } from 'next';
import type { GeneratedRoute } from '@www/.gen/routes';

export type ValidRoute<T extends string> =
  | Exclude<Route<T> | URL, `/docs${string}`>
  | `/docs${GeneratedRoute}`
  | '/docs';

type TypedLinkProps<T extends string> = {
  href: ValidRoute<T>;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function TypedLink<T extends string>(props: TypedLinkProps<T>) {
  return (
    <NextLink
      {...props}
      // @ts-ignore
      href={props.href}
    />
  );
}
