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
  const anchorProps: any = {};

  if (href.startsWith("/")) {
    href = `/docs/${currentVersion}${href}`;
  } else if (
    href.startsWith("https://") &&
    !href.includes("https://infinite-table.com")
  ) {
    anchorProps.target = "_blank";
  }

  return (
    <Link href={href}>
      <a className={docsLinkClassName} {...anchorProps}>
        {children}
      </a>
    </Link>
  );
};
