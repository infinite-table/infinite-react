import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import remarkMdx from 'remark-mdx';

import { useMDXComponents } from '../../content/new-mdx-components';
import { siteContent } from '@www/content';

import snippetTransformer from '@www/utils/markdownSnippetTransformer';
import type { JSX } from 'react';

export async function renderMarkdownPage(options: {
  slug: string[];
  baseUrl: string;
  children404?: JSX.Element;
  env?: Record<string, string>;
}): Promise<JSX.Element> {
  const slug = options.slug;

  let fileKey = '/' + slug.join('/');
  let fileInfo = siteContent.paths[fileKey];

  if (!fileInfo) {
    fileKey = `${fileKey}/`;
    fileInfo = siteContent.paths[fileKey];
  }

  if (!fileInfo) {
    console.warn(`File not found: ${fileKey}`);
    console.log('available keys: ' + Object.keys(siteContent.paths).join('\n'));
    return options.children404 !== undefined ? (
      options.children404
    ) : (
      <div>404</div>
    );
  }

  const mdxComponents = useMDXComponents(fileInfo);

  const code = String(
    await compile(fileInfo.content, {
      outputFormat: 'function-body',

      remarkPlugins: [
        remarkMdx,
        // markdownLinkChecker({
        //   fileInfo,
        // }),
        snippetTransformer({
          fileInfo,
          env: {
            ...options.env,
            NEXT_PUBLIC_BASE_URL:
              process.env.NEXT_PUBLIC_BASE_URL ||
              'https://infinite-table.com/.netlify/functions/json-server',
          },
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
