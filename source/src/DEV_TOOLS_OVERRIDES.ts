import type {
  DevToolsDataSourceOverrides,
  DevToolsInfiniteOverrides,
} from './components/InfiniteTable/types/DevTools';

export const DEV_TOOLS_INFINITE_OVERRIDES = new Map<
  string,
  DevToolsInfiniteOverrides
>();

export const DEV_TOOLS_DATASOURCE_OVERRIDES = new Map<
  string,
  DevToolsDataSourceOverrides
>();
