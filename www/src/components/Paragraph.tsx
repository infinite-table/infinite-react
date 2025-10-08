import { ReactNode } from 'react';

type ParagraphProps = {
  children: ReactNode;
};

export function Paragraph(props: ParagraphProps) {
  return (
    <div
      role="paragraph"
      // className={`mt-4 lg:text-xl md:text-lg text-md text-white/90 leading-[1.5]!`}
      className={`mt-4 text-foreground leading-base`}
    >
      {props.children}
    </div>
  );
}
