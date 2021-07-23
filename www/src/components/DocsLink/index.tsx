import * as React from "react";
import Link from "next/link";
import { useDocsContext } from "../DocsContext";
import { docsLinkClassName } from "./index.css";

export type DocsLinkProps = {
  href: string;
  children: string;
};
export const DocsLink = (props: DocsLinkProps) => {
  let { href = "", children } = props;

  const { currentVersion } = useDocsContext();

  if (href.startsWith("/")) {
    href = `/docs/${currentVersion}${href}`;
  }
  return (
    <Link href={href}>
      <a className={docsLinkClassName}>{children}</a>
    </Link>
  );
};
