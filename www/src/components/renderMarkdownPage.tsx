import { compile, run } from '@mdx-js/mdx';
import {
  remarkDemoFences,
  remarkFrameworkLinks,
  remarkFrameworkText,
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
  DOCS_VUE_SIBLINGS,
  isDocsKitFence,
} from '@www/utils/docsKit';
import { docsHasPage } from '@www/utils/docsFrameworkContent';
import {
  docsFrameworks,
  DOCS_FRAMEWORK_PACKAGE,
  type DocsFrameworkId,
} from '@www/utils/docsFrameworks';
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
        // fallback) when there is no Vue version yet
        remarkFrameworkLinks({
          frameworks: docsFrameworks,
          framework,
          hasPage: docsHasPage,
          jsxAttributes: { YouWillLearnCard: ['path'] },
          file: fileInfo.fileAbsolutePath,
        }),
        remarkMilestonePlugin,
        markdownPropLinkChecker({
          fileInfo,
          env,
        }),
        // file="x.demo.tsx" / file="x.snippet.tsx" fences (prebuilt, editable
        // demos and type-checked snippets); everything else stays on Sandpack
        remarkDemoFences({
          contentDir: DOCS_CONTENT_DIR,
          folder: fileInfo.folderPath,
          claim: isDocsKitFence,
          banInlineCode: false,
          staticFences: 'card',
          fenceDefaults: DOCS_FENCE_DEFAULTS,
          siblings: framework === 'vue' ? DOCS_VUE_SIBLINGS : undefined,
          sourceReplacements: {
            'process.env.NEXT_PUBLIC_BASE_URL': `'${env.NEXT_PUBLIC_BASE_URL}'`,
          },
        }),
        snippetTransformer({
          fileInfo,
          env,
        }),
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
