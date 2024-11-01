import * as React from 'react';
import { useState } from 'react';

import { join } from '../../../../utils/join';
import { isControlled } from '../../../utils/isControlled';
import {
  ExpanderIconCls,
  ExpanderIconClsVariants,
} from './ExpandCollapseIcon.css';
import { InfiniteIconClassName } from './InfiniteIconClassName';

type ExpandCollapseIconProps = {
  size?: number;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onChange?: (expanded: boolean) => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  className?: string;
  direction?: 'end' | 'start';
};

const THIS_ICON = `${InfiniteIconClassName}-expand-collapse`;

export function ExpandCollapseIcon(props: ExpandCollapseIconProps) {
  const { size = 24, direction = 'start', disabled = false } = props;

  const [expanded, setExpanded] = useState(
    props.expanded ?? props.defaultExpanded,
  );

  const onClick = () => {
    props.onChange?.(!expanded);
    if (!isControlled('expanded', props)) {
      setExpanded(!expanded);
    }
  };

  React.useEffect(() => {
    if (isControlled('expanded', props)) {
      setExpanded(props.expanded);
    }
  }, [props.expanded]);

  const currentState = expanded ? 'expanded' : 'collapsed';
  return (
    <svg
      data-name="expand-collapse-icon"
      data-state={currentState}
      data-disabled={disabled}
      xmlns="http://www.w3.org/2000/svg"
      height={`${size}px`}
      viewBox="0 0 24 24"
      width={`${size}px`}
      style={props.style}
      onClick={disabled ? undefined : onClick}
      className={join(
        props.className,
        ExpanderIconCls,
        ExpanderIconClsVariants({
          direction: direction || 'start',
          expanded,
          disabled,
        }),
        `${InfiniteIconClassName}`,
        `${THIS_ICON}`,
        `${THIS_ICON}--${currentState}`,
        `${THIS_ICON}--${direction === 'end' ? 'end' : 'start'}`,
        disabled ? `${THIS_ICON}--disabled` : '',
      )}
    >
      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
    </svg>
  );
}
