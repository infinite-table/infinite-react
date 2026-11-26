/** a folder or a page of the test pages index (scripts/buildTestPagesIndexProps.js) */
export type IndexNode =
  | {
      type: 'page';
      name: string;
      href: string;
    }
  | {
      type: 'folder';
      name: string;
      href: string;
      children: IndexNode[];
    };

export type TestPagesIndexProps = {
  segments: string[];
  parentHref: string | null;
  /** the folders and pages of the folder, as a tree */
  entries: IndexNode[];
};
