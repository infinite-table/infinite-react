// Which docs pages exist for which framework. Imported by Node scripts
// (docs-kit.config.mjs, scripts/generate-llms-docs.js) as well as by the
// site, so: relative imports only (with their `.ts` extension), and no
// TypeScript syntax that needs transpiling.
import {
  DOCS_DEFAULT_FRAMEWORK,
  type DocsFrameworkId,
} from './docsFrameworksRegistry.ts';

export type { DocsFrameworkId };

/**
 * A page is written for the default framework (React) unless its frontmatter
 * says `react: false`. It has a version for another framework when the
 * frontmatter has that framework's key: `vue: true`, or an object with the
 * Vue page's own `title` / `description`.
 */
export function frontmatterHasFramework(
  frontmatter: Record<string, unknown> | undefined,
  framework: DocsFrameworkId,
): boolean {
  if (framework === DOCS_DEFAULT_FRAMEWORK) {
    return frontmatter?.[framework] !== false;
  }
  const value = frontmatter?.[framework];
  return value != null && value !== false;
}

const FRAMEWORK_CONTENT_RE =
  /<FrameworkContent\s+(framework|not)="([^"]*)"\s*>\n?([\s\S]*?)<\/FrameworkContent>\n?/g;

/**
 * A page's markdown as one framework sees it: the `<FrameworkContent>` blocks
 * of the other frameworks are dropped, its own are unwrapped. For what reads
 * the markdown without rendering it (the table of contents, the `.md` export).
 */
export function contentForFramework(
  content: string,
  framework: DocsFrameworkId,
): string {
  return content.replace(
    FRAMEWORK_CONTENT_RE,
    (_match, attribute: string, value: string, body: string) => {
      const listed = value
        .split(',')
        .map((item) => item.trim())
        .includes(framework);
      return listed === (attribute === 'framework') ? body : '';
    },
  );
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

/**
 * The same check on a page's source, without a YAML parser (for Node scripts
 * that only have the file): a top-level `vue:` key in the frontmatter, not set
 * to `false` (for the default framework: no `react: false`). `null`: the page
 * doesn't exist.
 */
export function pageSourceHasFramework(
  source: string | null,
  framework: DocsFrameworkId,
): boolean {
  if (source == null) {
    return false;
  }
  const frontmatter = FRONTMATTER_RE.exec(source)?.[1] ?? '';
  const match = new RegExp(`^${framework}:[ \\t]*(.*)$`, 'm').exec(frontmatter);
  if (!match) {
    return framework === DOCS_DEFAULT_FRAMEWORK;
  }
  return match[1].trim() !== 'false';
}
