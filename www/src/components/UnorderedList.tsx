import { ReactNode } from 'react';
import { Paragraph } from './Paragraph';

type UnorderedListProps = {
  children?: ReactNode;
};

export function UnorderedList(props: UnorderedListProps) {
  return (
    <Paragraph>
      <ul role="unordered-list" className={`ml-6 my-3 list-disc text-inherit`}>
        {props.children}
      </ul>
    </Paragraph>
  );
}

export const LI = (p: React.JSX.IntrinsicElements['li']) => (
  <li className="leading-relaxed mb-1" {...p} />
);
