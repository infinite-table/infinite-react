import { siteContent } from '../content';
import { MarkdownFileInfo } from './MarkdownFileInfo';

export interface BlogPost {
  path: string;
  title: string;
  description: string;
  readingTime?: string;
  href: string;
  thumbnail?: string;
  thumbnailDimensions?: {
    width: number;
    height: number;
  };
  date?: string;
  hide_in_homepage?: boolean;
  draft: boolean;
  author?: string;
  authorData?: {
    label: string;
    key: string;
  };
  tags?: string[];
  content: string;
}

export function getFileInfoBySlug(slug: string[]): MarkdownFileInfo | null {
  let fileKey = slug.join('/');
  if (!fileKey.startsWith('/')) {
    fileKey = '/' + fileKey;
  }

  const fileInfo =
    siteContent.paths[fileKey] || siteContent.paths[`${fileKey}/`];

  return fileInfo;
}

export function getBlogPosts(options?: {
  sortRecentFirst?: boolean;
  skipDrafts?: boolean;
}): BlogPost[] {
  const { sortRecentFirst = true, skipDrafts = false } = options || {};
  return Object.entries(siteContent.paths)
    .filter(([path]) => path.startsWith('/blog/') && path !== '/blog/')

    .map(([path, fileInfo]) => ({
      path,
      title: fileInfo.frontmatter?.title || path.split('/').pop() || 'Untitled',
      description: fileInfo.frontmatter?.description || '',
      readingTime: fileInfo.readingTime,
      href: path as any,
      hide_in_homepage: fileInfo.frontmatter?.hide_in_homepage === true,
      date: fileInfo.frontmatter?.date,
      thumbnail: fileInfo.frontmatter?.thumbnail,
      thumbnailDimensions: fileInfo.frontmatter?.thumbnailDimensions,
      author: fileInfo.frontmatter?.author,
      authorData: fileInfo.frontmatter?.authorData,
      draft: fileInfo.frontmatter?.draft === true,
      tags: fileInfo.frontmatter?.tags || [],
      content: fileInfo.content,
    }))
    .filter((post) => !skipDrafts || !post.draft)
    .sort((a, b) => {
      const aDate = a.date ? new Date(a.date) : new Date(0);
      const bDate = b.date ? new Date(b.date) : new Date(0);
      return sortRecentFirst
        ? bDate.getTime() - aDate.getTime()
        : aDate.getTime() - bDate.getTime();
    });
}
