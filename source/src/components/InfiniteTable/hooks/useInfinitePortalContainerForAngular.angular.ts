import { Signal, afterNextRender, signal } from '@angular/core';

import { injectGetMasterDetailContext } from '../../DataSource/DataSourceMasterDetailContextForAngular.angular';
import { injectInfiniteTable } from '../InfiniteTableContextForAngular.angular';

/**
 * Angular sibling of useInfinitePortalContainer: the element the grid
 * renders its menus and overlays into (the master grid's, in a row
 * detail) - eg the `portalContainer` of an overlay shown from a cell.
 *
 * A signal, not the element: the grid renders its portal element after its
 * body, so a component in a header or a cell is created before it exists.
 * It is set after the component first renders.
 */
export function injectInfinitePortalContainer(): Signal<HTMLElement | null> {
  const { getState } = injectInfiniteTable();
  const getMasterDetailContext = injectGetMasterDetailContext();

  const getPortalContainer = () =>
    getMasterDetailContext()?.getMasterState().portalDOMRef?.current ??
    getState().portalDOMRef.current ??
    null;

  const portalContainer = signal<HTMLElement | null>(getPortalContainer());

  afterNextRender(() => {
    portalContainer.set(getPortalContainer());
  });

  return portalContainer.asReadonly();
}
