import { DocsMenuItem } from "@www/components/DocsMenu";
import * as React from "react";

export type DocsContextType = {
  currentVersion: string;
  versionInfo: {
    slug: string;
    menu: DocsMenuItem[];
    date: string;
  };
};
export const DocsContext = React.createContext<DocsContextType>({
  currentVersion: "",
  versionInfo: {
    slug: "",
    menu: [],
    date: "",
  },
});

export const useDocsContext = (): DocsContextType => {
  return React.useContext(DocsContext);
};
