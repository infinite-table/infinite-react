import { compile, run } from '@mdx-js/mdx';
import {
  remarkDemoFences,
  remarkFrameworkLinks,
  remarkFrameworkText,
  remarkTerminalFences,
} from '@thedatagrid/docs-kit/remark';
import * as runtime from 'react/jsx-runtime';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';

import { useMDXComponents } from '../../content/new-mdx-components';
import { siteContent } from '@www/content';

import snippetTransformer from '@www/utils/markdownSnippetTransformer';
import {
  DOCS_CONTENT_DIR,
  DOCS_FENCE_DEFAULTS,
  isDocsKitFence,
} from '@www/utils/docsKit';
import { docsHasPage } from '@www/utils/docsFrameworkContent';
import {
  docsFrameworks,
  DOCS_FRAMEWORK_PACKAGE,
  type DocsFrameworkId,
} from '@www/utils/docsFrameworks';
import {
  docsFramework,
  docsFrameworkSiblings,
} from '@www/utils/docsFrameworksRegistry';
import markdownLinkChecker from '@www/utils/markdownLinkChecker';
import markdownPropLinkChecker from '@www/utils/markdownPropLinkChecker';
import remarkMilestonePlugin from '@www/components/remarkMilestone';
import type { JSX } from 'react';

export async function renderMarkdownPage(options: {
  slug: string[];
  baseUrl: string;
  children404?: JSX.Element;
  env?: Record<string, string>;
  /**
   * The framework the page is rendered for (docs pages only). The markdown is
   * the same for every framework: links, the package name and the demo files
   * are mapped to this one.
   */
  framework?: DocsFrameworkId;
}): Promise<JSX.Element> {
  const slug = options.slug;
  const framework = options.framework ?? docsFrameworks.default;

  const env = {
    ...options.env,
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL || 'https://data.infinite-table.com',
  };

  let fileKey = '/' + slug.join('/');
  let fileInfo = siteContent.paths[fileKey];

  if (!fileInfo) {
    fileKey = `${fileKey}/`;
    fileInfo = siteContent.paths[fileKey];
  }

  if (!fileInfo) {
    console.warn(`File not found: ${fileKey}`);

    return options.children404 !== undefined ? (
      options.children404
    ) : (
      <div>404</div>
    );
  }

  const mdxComponents = useMDXComponents(fileInfo, framework);

  const contentWithoutComments = fileInfo.content.replace(
    /<!--[\s\S]*?-->/g,
    '',
  );
  const code = String(
    await compile(contentWithoutComments, {
      outputFormat: 'function-body',

      remarkPlugins: [
        remarkGfm,
        remarkMdx,
        markdownLinkChecker({
          fileInfo,
        }),
        // `@infinite-table/infinite-react` in prose, inline code and link URLs
        remarkFrameworkText({
          replacements:
            framework === docsFrameworks.default
              ? {}
              : {
                  [DOCS_FRAMEWORK_PACKAGE[docsFrameworks.default]]:
                    DOCS_FRAMEWORK_PACKAGE[framework],
                },
        }),
        // /docs/x → /vue/docs/x on a Vue page; the React page (marked as a
        // fallback) when there is no Vue version yet - also for relative links
        remarkFrameworkLinks({
          frameworks: docsFrameworks,
          framework,
          hasPage: docsHasPage,
          jsxAttributes: { YouWillLearnCard: ['path'] },
          file: fileInfo.fileAbsolutePath,
          // relative links (`[root API](api)`) whose page has no version in
          // this framework go to the React page too (the URLs have no
          // trailing slash, as the browser resolves them)
          pagePath: fileInfo.routePath.replace(/\/$/, ''),
        }),
        remarkMilestonePlugin,
        markdownPropLinkChecker({
          fileInfo,
          env,
        }),
        // file="x.demo.tsx" / file="x.snippet.tsx" fences: prebuilt, editable
        // demos and type-checked snippets. Inline ts/tsx/js code fails the
        // build - it has to live in a snippet file.
        remarkDemoFences({
          contentDir: DOCS_CONTENT_DIR,
          folder: fileInfo.folderPath,
          claim: isDocsKitFence,
          banInlineCode: true,
          staticFences: 'card',
          fenceDefaults: DOCS_FENCE_DEFAULTS,
          demoSuffixes: [docsFramework(docsFrameworks.default).demoSuffix],
          // on a Vue page, a fence naming `x.demo.tsx` / `x.snippet.tsx`
          // shows `x.demo.vue` / `x.snippet.vue` (or `x.snippet.vue.ts`);
          // without one, the React file with a "React only for now" notice
          siblings: docsFrameworkSiblings(framework),
          sourceReplacements: {
            'process.env.NEXT_PUBLIC_BASE_URL': `'${env.NEXT_PUBLIC_BASE_URL}'`,
          },
        }),
        // bash / sh fences: a terminal with a copy button; the `$` prompt
        // isn't selectable or copied (`prompt=false` on a fence hides it)
        remarkTerminalFences({ prompt: true }),
        // the other inline fences (css, json…)
        snippetTransformer(),
      ],
    }),
  );
  // console.log('code!!!!\n\n\n', code);
  // Run the compiled code with the runtime and get the default export
  //@ts-ignore
  const { default: MDXContent } = await run(code, {
    ...runtime,
    baseUrl: options.baseUrl,
  });

  return (
    <div className="not-prose">
      <MDXContent components={mdxComponents} />
    </div>
  );
}
