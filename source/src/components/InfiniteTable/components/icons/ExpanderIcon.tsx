import * as React from 'react';
import { useState } from 'react';
import { join } from '../../../../utils/join';
import { isControlled } from '../../../utils/isControlled';
import { fill, flex, cursor, transform } from '../../utilities.css';

type ExpanderIconProps = {
  size?: number;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onChange?: (expanded: boolean) => void;
  style?: React.CSSProperties;
  className?: string;
};
export function ExpanderIcon(props: ExpanderIconProps) {
  const { size = 24 } = props;

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
  return (
    <svg
      data-name="expander-icon"
      xmlns="http://www.w3.org/2000/svg"
      height={`${size}px`}
      viewBox="0 0 24 24"
      width={`${size}px`}
      style={props.style}
      onClick={onClick}
      className={join(
        props.className,
        fill.accentColor,
        flex.none,
        cursor.pointer,
        expanded ? fill.accentColor : '',
        expanded ? transform.rotate90 : '',
        'InfiniteIcon',
        'InfiniteIcon-expander',
        `InfiniteIcon-expander--${expanded ? 'expanded' : 'collapsed'}`,
      )}
    >
      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
    </svg>
  );
}
