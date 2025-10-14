import Sandpack from '@www/components/Sandpack';
import { CodeBlock } from '@www/components/CodeBlock';
import React from 'react';
import { SandpackInputFile } from '../Sandpack/SandpackTypes';
import { Mermaid } from './Mermaid';

export type CodeSnippetProps = {
  live?: boolean;
  size?: 'default' | 'md' | 'lg';
  title?: string;
  description?: React.ReactNode | string;
  tailwind?: boolean;
  code?: string;
  file?: string;
  lang?: string;
  files: SandpackInputFile[];
  highlightLines?: string;
  importedPackages?: string[];
  viewMode?: 'code' | 'preview' | 'both';
  cwd?: string;
} & (
  | {
      code: string;
    }
  | {
      file: string;
    }
);

const isDescription = (el: React.ReactElement) => {
  //@ts-ignore
  return el.type?.name === 'Description';
};
export function CodeSnippet(props: CodeSnippetProps) {
  const files = props.files || [];

  const children = React.Children.toArray(
    //@ts-ignore
    props.children,
  ) as React.ReactElement[];
  const descriptions = children.filter((el) => isDescription(el));
  if (props.lang === 'mmd') {
    return (
      <Mermaid
        title={props.title}
        description={props.description || descriptions}
        files={files}
      />
    );
  }
  if (props.live) {
    return (
      <Sandpack
        size={props.size || 'md'}
        viewMode={props.viewMode || 'both'}
        title={props.title}
        description={props.description || descriptions}
        files={files}
        tailwind={props.tailwind}
        deps={props.importedPackages}
      ></Sandpack>
    );
  }

  return (
    <CodeBlock title={props.title} highlightLines={props.highlightLines}>
      {files[0]?.code}
    </CodeBlock>
  );
}

export { CodeBlock };
