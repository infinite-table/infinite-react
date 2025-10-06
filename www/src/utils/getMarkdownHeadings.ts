import { toHashUrl } from './toHashUrl';

export type TocHeading = {
  url: string;
  depth: number;
  text: string;
};

function toUrl(str: string) {
  return toHashUrl(str);
}

const removeHTMLTags = (str: string) => {
  // str.trim().replace(/<[^>]*>([^<]*)<\/[^>]*>|<[^>]*>/g, '$1');
  const stringWithoutTags = str
    .trim()
    .replace(
      /<[^>]*name="([^"]+)"[^>]*\/>|<[^>]*>([^<]*)<\/[^>]*>|<[^>]*>/g,
      (_match, name, innerHTML) => {
        if (name) {
          return name;
        } else {
          return innerHTML;
        }
      },
    );

  return stringWithoutTags;
};

const removeBackticks = (str: string) => str.replace(/`/g, '');
const getNameAttributeFromSelfClosingTag = (tag: string) => {
  const match = tag.match(/<[^>]*name="([^"]*)"[^>]*\/>/i);
  return match ? match[1] : tag;
};

export function getPropHeadings(mdxString: string): TocHeading[] {
  const tags = mdxString.match(/<Prop\s+.*?name=["'](\w+)["'].*?>/g);

  let anchors = (tags || [])
    .map((tag) => {
      const name = tag.match(/name=["'](\w+)["']/)?.[1] || '';

      return name.trim() || '';
    })
    .sort()
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
export function getMarkdownHeadingsForPage(mdxString: string): TocHeading[] {
  let anchors = getMarkdownHeadings(mdxString);
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

export function getHashForText(mdxString: string | string[]): string {
  const text = Array.isArray(mdxString) ? mdxString : [mdxString.trim()];

  let str = text
    .map(removeHTMLTags)
    .map(removeBackticks)
    .map(getNameAttributeFromSelfClosingTag)
    .filter(Boolean)
    .join('');

  // Build valid URL hash identifier
  str = str
    .toLowerCase()
    .trim()
    .replace(/\./g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return str;
}

export function getMarkdownHeadings(mdxString: string): TocHeading[] {
  const headings = mdxString.match(/^#+\s.+$/gm);
  const result = headings ? headings.map((heading) => heading.trim()) : [];

  const anchors = result
    .map((heading) => {
      const depth = heading.match(/^#+/gm);
      let text = heading.match(/[^#]*$/gm);
      if (!text) {
        return null;
      }
      const cleanText = text
        .map(removeHTMLTags)
        .map(removeBackticks)
        .map(getNameAttributeFromSelfClosingTag)
        .filter(Boolean)
        .join('');

      const str = getHashForText(cleanText);

      const result = {
        url: '#' + toUrl(str),
        depth: depth ? depth[0].length : 0,
        text: cleanText,
      };

      return result;
    })
    .filter(Boolean) as TocHeading[];
  return anchors;
}
