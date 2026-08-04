export type IndexEntry = {
  type: 'folder' | 'page';
  name: string;
  path: string;
  href: string;
  depth: number;
};

export type TestPagesIndexProps = {
  segments: string[];
  parentHref: string | null;
  entries: IndexEntry[];
};
