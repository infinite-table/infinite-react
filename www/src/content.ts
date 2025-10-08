import { MarkdownFileInfo } from './utils/MarkdownFileInfo';

import contentJSON from './.gen/index.json';
export const siteContent = contentJSON as {
  paths: Record<string, MarkdownFileInfo>;
  routes: MarkdownFileInfo[];
};
