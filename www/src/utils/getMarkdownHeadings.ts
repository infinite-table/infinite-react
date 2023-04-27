import { toHashUrl } from './toHashUrl';

export type TocHeading = {
  url: string;
  depth: number;
  text: string;
};

function toUrl(str: string) {
  return toHashUrl(str);
}
export function getPropHeadings(mdxString: string): TocHeading[] {
  const tags = mdxString.match(/<Prop\s+.*?name=["'](\w+)["'].*?>/g);

  let anchors = (tags || [])
    .map((tag) => {
      const name = tag.match(/name=["'](\w+)["']/)?.[1] || '';

      return name.trim() || '';
    })
    .map((name) => {
      return {
        url: '#' + name,
        depth: 0,
        text: name,
      };
    })

    .filter(Boolean) as TocHeading[];

  if (anchors.length) {
    anchors = [
      {
        depth: 1,
        text: 'Overview',
        url: '#',
      },
      ...anchors,
    ];
  }
  return anchors;
}
export function getMarkdownHeadings(mdxString: string): TocHeading[] {
  const headings = mdxString.match(/^#+\s.+$/gm);
  const result = headings ? headings.map((heading) => heading.trim()) : [];

  let anchors = result
    .map((heading) => {
      const depth = heading.match(/^#+/gm);
      const text = heading.match(/[^#]*$/gm);
      if (!text) {
        return null;
      }

      const str = text
        .map((x) => x.trim())
        .filter(Boolean)
        .join('');

      return {
        url: '#' + toUrl(str),
        depth: depth ? depth[0].length : 0,
        text: str,
      };
    })
    .filter(Boolean) as TocHeading[];

  if (anchors.length) {
    anchors = [
      {
        depth: 1,
        text: 'Overview',
        url: '#',
      },
      ...anchors,
    ];
  }
  return anchors;
}
