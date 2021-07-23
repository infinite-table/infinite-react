import { DocsMenuItem } from "@www/components/DocsMenu";
import * as React from "react";

export type DocsContextType = {
  currentVersion: string;
  versionInfo: {
    menu: DocsMenuItem[];
    date: string;
    alias: string;
  };
};
export const DocsContext = React.createContext<DocsContextType>({
  currentVersion: "",
  versionInfo: {
    menu: [],
    date: "",
    alias: "",
  },
});

export const useDocsContext = (): DocsContextType => {
  return React.useContext(DocsContext);
};
