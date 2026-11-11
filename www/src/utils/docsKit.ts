import path from 'node:path';

import type { FenceDefaults, FenceInfo } from '@thedatagrid/docs-kit/remark';

/** Absolute path of the docs content (Next runs from the www folder). */
export const DOCS_CONTENT_DIR = path.join(process.cwd(), 'content');

/** Written by `npm run build-demos` / `npm run watch-demos` (docs-kit.config.mjs). */
export const DOCS_DEMO_MANIFEST = path.join(
  process.cwd(),
  'public/gen/demos/manifest.json',
);

/** Demo card anchors are `#demo-<title>` (keep in sync with docs-kit.config.mjs). */
export const DOCS_DEMO_ANCHOR_PREFIX = 'demo-';

/**
 * Props every docs-kit fence gets unless it sets its own (`lines=false`,
 * `live=false` turn one off). Used by the remark plugin and the demo builder.
 */
export const DOCS_FENCE_DEFAULTS: FenceDefaults = {
  all: { lines: true },
  demos: { live: true, height: 'default' },
};

/** Same sizes as the Sandpack examples (`size="md"` by default, `"lg"`). */
export const DOCS_DEMO_HEIGHTS = { small: 500, default: 650, large: 850 };

/** The dark Sandpack theme of the examples (src/styles/sandpack.css), as a shiki theme. */
const SANDPACK_DARK_THEME = {
  name: 'infinite-sandpack-dark',
  type: 'dark',
  colors: {
    'editor.background': '#101419',
    'editor.foreground': '#ebecf0cc',
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#757575', fontStyle: 'italic' },
    },
    {
      scope: [
        'punctuation',
        'meta.brace',
        'keyword.operator',
        'punctuation.definition.tag',
      ],
      settings: { foreground: '#939293', fontStyle: '' },
    },
    {
      scope: [
        'keyword',
        'storage',
        'keyword.operator.expression',
        'keyword.operator.new',
        'constant.language.import-export-all',
      ],
      settings: { foreground: '#ff6188' },
    },
    {
      scope: ['string', 'punctuation.definition.string'],
      settings: { foreground: '#ffd866' },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'support.constant'],
      settings: { foreground: '#ab9df2' },
    },
    {
      scope: [
        'entity.name.function',
        'support.function',
        'entity.name.tag',
        'support.class.component',
      ],
      settings: { foreground: '#a9dc76' },
    },
    {
      scope: ['meta.object-literal.key', 'variable.other.property'],
      settings: { foreground: '#78dce8', fontStyle: 'italic' },
    },
  ],
};

export const DOCS_CODE_THEMES = {
  light: 'github-light',
  // shiki takes theme objects too; the kit's type only names bundled themes
  dark: SANDPACK_DARK_THEME as unknown as string,
};

const DOCS_KIT_FILE = /\.(demo|snippet)\.[cm]?[jt]sx?$/;

/**
 * Fences for the docs-kit pipeline: `file="x.demo.tsx"` (live demos) and
 * `file="x.snippet.tsx"` (regions/highlights of type-checked files). Other
 * fences keep going to the Sandpack pipeline (markdownSnippetTransformer).
 */
export function isDocsKitFence(fence: FenceInfo): boolean {
  return typeof fence.props.file === 'string' && DOCS_KIT_FILE.test(fence.props.file);
}
