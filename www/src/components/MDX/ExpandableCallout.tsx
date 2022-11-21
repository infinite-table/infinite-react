import cn from 'classnames';
import * as React from 'react';

import { IconGotcha } from '../Icon/IconGotcha';
import { IconHint } from '../Icon/IconHint';
import { IconNote } from '../Icon/IconNote';
import { IconReadMore } from '../Icon/IconReadMore';

type CalloutVariants = 'gotcha' | 'note' | 'readMore' | 'hint';

interface ExpandableCalloutProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  type: CalloutVariants;
}

const variantMap = {
  note: {
    title: 'Note',
    Icon: IconNote,
    containerClasses: 'bg-highlight-dark bg-opacity-1 text-lg',
    textColor: 'text-green-60',
    overlayGradient:
      'linear-gradient(rgba(245, 249, 248, 0), rgba(245, 249, 248, 1)',
  },
  gotcha: {
    title: 'Gotcha',
    Icon: IconGotcha,
    containerClasses: 'bg-yellow-5 bg-yellow-60 bg-opacity-20',
    textColor: 'text-yellow-40',
    overlayGradient:
      'linear-gradient(rgba(249, 247, 243, 0), rgba(249, 247, 243, 1)',
  },
  hint: {
    title: 'Hint',
    Icon: IconHint,
    containerClasses: ' bg-green-60 bg-opacity-20 text-lg',
    textColor: 'text-green-30',
    overlayGradient:
      'linear-gradient(rgba(245, 249, 248, 0), rgba(245, 249, 248, 1)',
  },
  readMore: {
    title: 'Find Out More',
    Icon: IconReadMore,
    containerClasses: 'bg-opacity-30 bg-purple-30text-primary-dark',
    textColor: 'text-purple-20',
    overlayGradient:
      'linear-gradient(rgba(245, 249, 248, 0), rgba(245, 249, 248, 1)',
  },
};

function ExpandableCallout({ children, type, title }: ExpandableCalloutProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const variant = variantMap[type];

  return (
    <div
      className={cn(
        'pt-8 pb-4 px-5 sm:px-8 my-8 relative rounded-none shadow-inner  sm:mx-auto sm:rounded-lg',
        variant.containerClasses,
      )}
    >
      <h3 className={cn('mb-2 text-2xl font-bold', variant.textColor)}>
        <variant.Icon
          className={cn('inline mr-3 mb-1 text-lg', variant.textColor)}
        />
        {title ?? variant.title}
      </h3>
      <div className="relative">
        <div ref={contentRef} className="py-2">
          {children}
        </div>
      </div>
    </div>
  );
}

ExpandableCallout.defaultProps = {
  type: 'note',
};

export default ExpandableCallout;
