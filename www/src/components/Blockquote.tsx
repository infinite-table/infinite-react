import { ReactNode } from 'react';
import { Paragraph } from './Paragraph';

type BlockquoteProps = {
  children?: ReactNode;
};

export function Blockquote(props: BlockquoteProps) {
  return (
    <Paragraph>
      <blockquote className="border-l-4 border-gray-300 bg-highlight-dark text-inherit leading-6 flex relative px-8 pb-5 pt-1 rounded-r-lg">
        {props.children}
      </blockquote>
    </Paragraph>
  );
}
