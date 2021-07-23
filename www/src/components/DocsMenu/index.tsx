import {
  backgroundColorBrandDark,
  paddingX,
  paddingY,
} from "@www/styles/utils.css";
import * as React from "react";
import Link from "next/link";
import { docsMenuClassName, linkClassName } from "./index.css";

export type DocsMenuItem = {
  path: string;
  label: string;
};
type DocsMenuProps = {
  items?: DocsMenuItem[];
  children?: React.ReactNode;
  currentVersion: string;
};
export const DocsMenu = (props: DocsMenuProps) => {
  const { children, items } = props;

  const renderItem = (item: DocsMenuItem) => {
    return (
      <Link key={item.path} href={`/docs/${props.currentVersion}/${item.path}`}>
        <a className={linkClassName}>{item.label}</a>
      </Link>
    );
  };
  return (
    <div className={`${docsMenuClassName} `}>
      {(items || []).map(renderItem)}
    </div>
  );
};
