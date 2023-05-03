import { toHashUrl } from '@www/utils/toHashUrl';
import * as React from 'react';

export function childToId(child: React.ReactNode): string {
  if (typeof child === 'string') {
    return toHashUrl(child);
  } else if (Array.isArray(child)) {
    return child.map(childToId).join('');
  } else if (
    child &&
    // @ts-ignore
    child.props &&
    // @ts-ignore
    child.props.name &&
    // @ts-ignore
    child.type &&
    // @ts-ignore
    child.type.displayName in
      {
        HookLink: true,
        PropLink: true,
        ApiLink: true,
        DApiLink: true,
        DataSPropLink: true,
      }
  ) {
    return toHashUrl(
      // @ts-ignore
      typeof child.props.children === 'string'
        ? // @ts-ignore
          child.props.children
        : // @ts-ignore
          child.props.name,
    );
  } else if (child && (child as any).props && (child as any).props.children) {
    const arr = React.Children.toArray((child as any).props.children);
    return arr.map(childToId).join('');
  }
  return '';
}
