import { visit } from 'unist-util-visit';

/**
 * Code fences that the docs-kit plugin leaves alone - inline code in
 * languages that are not type-checked (css, sh, json…) and mermaid charts -
 * become `<CodeSnippet lang code title highlight />` (see CodeSnippet).
 *
 *     ```css {2} title="Changing the row height"
 *     .infinite-theme-name--default {
 *       --infinite-row-height: 50px;
 *     }
 *     ```
 *
 * `{2,5-7}` highlights lines of the block; `title="…"` names it.
 */
export default () => {
  const transformer = (tree: any) => {
    visit(tree, 'code', (node: any, index, parent: any) => {
      if (!node.lang || index == null || !parent) {
        return;
      }
      let meta: string = node.meta || '';
      const attributes: Record<string, string> = {
        lang: node.lang,
        code: node.value || '',
      };

      const highlight = /\{([\d,\s-]+)\}/.exec(meta);
      if (highlight) {
        attributes.highlight = highlight[1].replace(/\s+/g, '');
        meta = meta.replace(highlight[0], '');
      }
      const title = /\btitle="([^"]*)"/.exec(meta);
      if (title) {
        attributes.title = title[1];
      }

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'CodeSnippet',
        attributes: Object.entries(attributes).map(([name, value]) => ({
          type: 'mdxJsxAttribute',
          name,
          value,
        })),
        children: [],
      };
    });
  };

  return () => transformer;
};
