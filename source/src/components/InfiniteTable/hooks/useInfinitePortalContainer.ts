import { useDataSourceMasterDetailSelector } from '../../DataSource/publicHooks/useDataSourceMasterDetailSelector';
import { useInfiniteTableSelector } from './useInfiniteTableSelector';

export function useInfinitePortalContainer() {
  const { masterPortalDOMRef } =
    useDataSourceMasterDetailSelector((ctx) => {
      return {
        masterPortalDOMRef: ctx.getMasterState().portalDOMRef,
      };
    }) ?? {};

  const portalDOMRef = useInfiniteTableSelector(
    (ctx) => ctx.state.portalDOMRef,
  );

  const portalContainer = masterPortalDOMRef?.current ?? portalDOMRef?.current;

  return portalContainer;
}
