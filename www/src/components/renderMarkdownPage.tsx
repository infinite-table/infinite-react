import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import remarkMdx from 'remark-mdx';

import { useMDXComponents } from '../../content/new-mdx-components';
import { siteContent } from '@www/content';

import snippetTransformer from '@www/utils/markdownSnippetTransformer';
import markdownLinkChecker from '@www/utils/markdownLinkChecker';
import markdownPropLinkChecker from '@www/utils/markdownPropLinkChecker';
import remarkMilestonePlugin from '@www/components/remarkMilestone';
import type { JSX } from 'react';

export async function renderMarkdownPage(options: {
  slug: string[];
  baseUrl: string;
  children404?: JSX.Element;
  env?: Record<string, string>;
}): Promise<JSX.Element> {
  const slug = options.slug;

  const env = {
    ...options.env,
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL ||
      'https://infinite-table.com/.netlify/functions/json-server',
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

  const mdxComponents = useMDXComponents(fileInfo);

  const contentWithoutComments = fileInfo.content.replace(
    /<!--[\s\S]*?-->/g,
    '',
  );
  const code = String(
    await compile(contentWithoutComments, {
      outputFormat: 'function-body',

      remarkPlugins: [
        remarkMdx,
        markdownLinkChecker({
          fileInfo,
        }),
        remarkMilestonePlugin,
        markdownPropLinkChecker({
          fileInfo,
          env,
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
