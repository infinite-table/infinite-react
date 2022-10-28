import cn from 'classnames';
import * as React from 'react';

import { Button } from '../Button';
import { IconChevron } from '../Icon/IconChevron';
import { IconCodeBlock } from '../Icon/IconCodeBlock';
import { IconDeepDive } from '../Icon/IconDeepDive';

interface ExpandableExampleProps {
  children: React.ReactNode;
  title: string;
  excerpt?: string;
  type: 'DeepDive' | 'Example' | 'ExpandableDescription';
}

function ExpandableExample({
  children,
  title,
  excerpt,
  type,
}: ExpandableExampleProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isDeepDive = type === 'DeepDive';
  const isExample = type === 'Example';

  return (
    <div
      className={cn('my-12 rounded-lg shadow-inner relative', {
        'bg-opacity-20 bg-purple-60': isDeepDive,
        'bg-opacity-20 bg-yellow-60': isExample,
      })}
    >
      <div className="p-8">
        <h5
          className={cn('mb-4 uppercase font-bold flex items-center text-sm', {
            'text-purple-30 ': isDeepDive,
            'text-yellow-30 ': isExample,
          })}
        >
          {isDeepDive && (
            <>
              <IconDeepDive className="inline mr-2 text-purple-30" />
              Deep Dive
            </>
          )}
          {isExample && (
            <>
              <IconCodeBlock className="inline mr-2 text-yellow-30" />
              Example
            </>
          )}
        </h5>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-primary-dark">{title}</h3>
          {excerpt && <div>{excerpt}</div>}
        </div>
        <Button
          active={true}
          className={cn({
            'bg-purple-50 border-purple-50 hover:bg-purple-40 focus:bg-purple-50 active:bg-purple-50':
              isDeepDive,
            'bg-yellow-50 border-yellow-50 hover:bg-yellow-40 focus:bg-yellow-50 active:bg-yellow-50':
              isExample,
          })}
          onClick={() => setIsExpanded((current) => !current)}
        >
          <span className="mr-1">
            <IconChevron displayDirection={isExpanded ? 'up' : 'down'} />
          </span>
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </Button>
      </div>
      <div
        className={cn('p-8 border-t', {
          'dark:border-purple-60 border-purple-10 ': isDeepDive,
          'dark:border-yellow-60 border-yellow-50': isExample,
          hidden: !isExpanded,
        })}
      >
        {children}
      </div>
    </div>
  );
}

export default ExpandableExample;
