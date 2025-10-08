// import fs from 'node:fs';
// import path from 'node:path';

import * as React from 'react';

import SyntaxHighlight from '../SyntaxHighlight';

import { TitleBlock } from '../Sandpack/TitleBlock';
import { ClipboardCopy } from './ClipboardCopy';

type BasicCodeBlockProps = {
  className?: string;
  inline?: boolean;
  highlightLines?: string;
  title?: string;
  children?: string;
  lang?: string;
};

// import packageJSON from '../../../package.json';

// export const getFileContent = async (file: string) => {
//   const contentRoot =
//     process.env.npm_config_contentroot ?? packageJSON.docsRoot.source;

//   let filePath = file.startsWith('@content/')
//     ? path.join(contentRoot, file.replace('@content/', ''))
//     : file;

//   console.log('reading file', filePath);

//   let fileContent = '';
//   try {
//     fileContent = fs.readFileSync(path.resolve(filePath), 'utf8');
//   } catch (error) {
//     console.error('Error reading file', error);
//     throw error;
//   }

//   return fileContent;
// };

export function CodeBlock(props: BasicCodeBlockProps) {
  return <CodeBlockCmp {...props} />;
}

function CodeBlockCmp(props: Omit<BasicCodeBlockProps, 'file'>) {
  const style = {
    letterSpacing: '-.012em',
    textDecoration: 'inherit',
  };
  if (props.inline) {
    return (
      <div
        className={`${
          props.className || ''
        } underline-offset-10 relative text-base bg-gradient-to-r from-datagrid-blue to-datagrid-purple text-white group inline-block px-2 rounded-md`}
        style={style}
      >
        <pre>
          <code>{props.children}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden my-8 max-w-full`}>
      {props.title && <TitleBlock>{props.title}</TitleBlock>}
      <div className={`${props.className || ''} text-base group`} style={style}>
        <>
          {/* @ts-ignore */}
          <SyntaxHighlight highlightLines={props.highlightLines}>
            {props.children}
          </SyntaxHighlight>
          <ClipboardCopy text={props.children ?? ''} />
        </>
      </div>
    </div>
  );
}

export function InlineCode(
  props: BasicCodeBlockProps & { files: { name: string; code: string }[] },
) {
  const { files, inline, ...otherProps } = props;

  const code = files?.[0]?.code ?? '';

  return (
    <CodeBlock {...otherProps} inline>
      {code}
    </CodeBlock>
  );
}
