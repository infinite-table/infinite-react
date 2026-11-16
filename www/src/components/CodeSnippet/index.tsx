import { CodeBlock } from '@www/components/CodeBlock';
import React from 'react';
import { MermaidChart } from './Mermaid';

export type CodeSnippetProps = {
  lang?: string;
  code: string;
  title?: string;
  /** Lines to highlight, as written in the fence: `2,5-7`. */
  highlight?: string;
};

/**
 * An inline code fence of a docs page (see markdownSnippetTransformer).
 * Fences in type-checked languages never get here: they reference a
 * `*.snippet.tsx` / `*.demo.tsx` file and are rendered by docs-kit.
 */
export function CodeSnippet(props: CodeSnippetProps) {
  if (props.lang === 'mmd') {
    return props.code ? (
      <div className="w-full">
        <MermaidChart text={props.code} />
      </div>
    ) : null;
  }

  return (
    <CodeBlock title={props.title} highlight={props.highlight} lang={props.lang}>
      {props.code}
    </CodeBlock>
  );
}

export { CodeBlock };
