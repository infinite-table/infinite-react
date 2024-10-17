import { useMasterDetailContext } from '../../DataSource/publicHooks/useDataSourceState';
import { useInfiniteTable } from './useInfiniteTable';

export function useInfinitePortalContainer() {
  const masterContext = useMasterDetailContext();

  const masterState = masterContext ? masterContext.getMasterState() : null;
  const infiniteState = useInfiniteTable().getState();

  const portalContainer = (masterState || infiniteState).portalDOMRef.current;

  return portalContainer;
}
