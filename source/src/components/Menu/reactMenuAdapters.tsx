import * as React from 'react';
import { ExpandCollapseIcon } from '../InfiniteTable/components/icons/ExpandCollapseIcon';
import { MenuSeparatorCls } from './MenuCls.css';
import type { MenuRenderAdapters } from './menuStateShared';

export function MenuSeparator() {
  return <hr className={MenuSeparatorCls} />;
}

export const reactMenuRenderAdapters: MenuRenderAdapters = {
  renderSeparator: () => <MenuSeparator />,
  renderSubmenuColumn: ({ domProps, item }) => {
    return item.menu ? (
      <div {...(domProps as any)}>
        <ExpandCollapseIcon expanded={false} />
      </div>
    ) : (
      <div {...(domProps as any)} />
    );
  },
};
