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

export const DEV_TOOLS_INFINITE_INITIALS = new Map<
  string,
  DevToolsInfiniteOverrides
>();

export const DEV_TOOLS_DATASOURCE_INITIALS = new Map<
  string,
  DevToolsDataSourceOverrides
>();

/**
 * CSS variable overrides (per debugId) applied by the devtools theme builder.
 * Values are applied as inline styles on the table root DOM node.
 */
export const DEV_TOOLS_CSS_VAR_OVERRIDES = new Map<
  string,
  Record<string, string>
>();
