import { onMounted, shallowRef } from 'vue';
import type { ShallowRef } from 'vue';

import { useGetMasterDetailContextForVue } from '../../DataSource/DataSourceMasterDetailContextForVue.vue';
import { useInfiniteTableContext } from '../InfiniteTableContextForVue.vue';

/**
 * Vue sibling of useInfinitePortalContainer: the element the grid renders
 * its menus and overlays into (the master grid's, in a row detail), to use
 * as the target of a `<Teleport>`.
 *
 * A ref, not the element: the grid renders its portal element after its
 * body, so a component in a header or a cell is set up before it exists.
 * The ref is filled once the component is mounted.
 */
export function useInfinitePortalContainer(): ShallowRef<HTMLElement | null> {
  const { getState } = useInfiniteTableContext();
  const getMasterDetailContext = useGetMasterDetailContextForVue();

  const getPortalContainer = () =>
    getMasterDetailContext()?.getMasterState().portalDOMRef?.current ??
    getState().portalDOMRef.current ??
    null;

  const portalContainer = shallowRef<HTMLElement | null>(getPortalContainer());

  onMounted(() => {
    portalContainer.value = getPortalContainer();
  });

  return portalContainer;
}
