import * as React from 'react';

import { Demo } from '@thedatagrid/docs-kit/react';

import {
  DOCS_CODE_THEMES,
  DOCS_CONTENT_DIR,
  DOCS_DEMO_ANCHOR_PREFIX,
  DOCS_DEMO_HEIGHTS,
  DOCS_DEMO_MANIFEST,
} from '@www/utils/docsKit';

type CodeBlockProps = {
  /** The language of the code: `css`, `sh`, `json`, `tsx`… */
  lang?: string;
  /** Shown in the block's header. */
  title?: string;
  /** Lines to highlight: `2,5-7`. */
  highlight?: string;
  children?: string;
};

/** Fence languages that shiki knows under another name. */
const LANG_ALIASES: Record<string, string> = {
  txt: 'text',
};

/**
 * A highlighted code block with a copy button: the code-only card of the
 * docs demos (docs-kit), so every code block of the site looks the same.
 * A server component.
 */
export function CodeBlock(props: CodeBlockProps) {
  const lang = (props.lang || 'text').toLowerCase();
  return (
    <Demo
      context={{
        contentDir: DOCS_CONTENT_DIR,
        folder: '',
        manifest: DOCS_DEMO_MANIFEST,
        heights: DOCS_DEMO_HEIGHTS,
        themes: DOCS_CODE_THEMES,
        anchorPrefix: DOCS_DEMO_ANCHOR_PREFIX,
      }}
      code={props.children ?? ''}
      lang={LANG_ALIASES[lang] ?? lang}
      codeTitle={props.title}
      highlight={props.highlight}
    />
  );
}
