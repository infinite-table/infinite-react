export type MarkdownFileInfo = {
  filePath: string;
  routePath: string;
  fileAbsolutePath: string;
  fileName: string;
  folderPath: string;
  frontmatter: Record<string, any>;
  excerpt: string;
  readingTime: string;
  content: string;
};

export type MarkdownFileEnv = {
  NEXT_PUBLIC_BASE_URL?: string;
};

export type SnippetMetaProps = {
  highlightLines: number[];
  importedPackages?: string[];
  files: { name: string; code: string }[];
  code: string;
  live: boolean;
  inline: boolean;
} & Record<string, string | boolean | number[]>;
