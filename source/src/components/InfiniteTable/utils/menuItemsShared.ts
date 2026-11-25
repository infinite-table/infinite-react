/**
 * Framework-neutral builders of the grid's menus, shared by React, Vue and
 * Angular: the default column menu items (with the Columns and Group by
 * submenus), the column menu, the filter operator menu and the cell / table
 * context menus.
 *
 * They return menu definitions (items, MenuProps). The few rendered bits
 * (checkboxes, icons, column labels) come from a small binder each
 * framework passes, and each framework renders the menu itself (JSX, `h()`,
 * `renderMenu()`).
 */
import type {
  DataSourceApi,
  DataSourceComponentActions,
  DataSourceFilterOperator,
  DataSourceMasterDetailContextValue,
  DataSourceState,
} from '../../DataSource/types';
import type { MenuItemObject, MenuProps } from '../../Menu/MenuProps';
import { getColumnApiForColumn } from '../api/getColumnApi';
import { getCellContext } from '../components/InfiniteTableRow/columnRendering';
import type {
  InfiniteTableApi,
  InfiniteTableColumnApi,
  InfiniteTableComputedColumn,
  InfiniteTableComputedValues,
  InfiniteTableState,
} from '../types';
import type { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';
import type { GetContextMenuItemsReturnType } from '../types/InfiniteTableProps';
import type {
  CellContextMenuLocationWithEvent,
  ContextMenuLocationWithEvent,
  InfiniteTableActions,
} from '../types/InfiniteTableState';
import {
  getMenuDefaultProps,
  getMenuItemsAndColumns,
  getMenuVisibilityProps,
} from './contextMenuUtilsShared';

export type ColumnMenuItemsParams<T> = {
  column: InfiniteTableComputedColumn<T>;
  columnApi: InfiniteTableColumnApi<T>;
  api: InfiniteTableApi<T>;
  dataSourceApi: DataSourceApi<T>;
  getState: () => InfiniteTableState<T>;
  getDataSourceState: () => DataSourceState<T>;
  getComputed: () => InfiniteTableComputedValues<T>;
  getDataSourceMasterContext: () =>
    | DataSourceMasterDetailContextValue
    | undefined;

  actions: InfiniteTableActions<T>;
  dataSourceActions: DataSourceComponentActions<T>;
};

/**
 * The props of the checkbox of a column in the Columns / Group by submenus.
 */
export type ColumnMenuCheckBoxProps = {
  /** the column id (React and Vue use it as the key of the checkbox) */
  key: string;
  disabled: boolean;
  checked: boolean;
  onChange: (checked: boolean | null) => void;
};

export type ColumnMenuItemsBinder<T> = {
  /** the checkbox of a column in the Columns / Group by submenus */
  renderCheckBox: (props: ColumnMenuCheckBoxProps) => MenuItemObject['check'];
  /** the label of a column in the Columns / Group by submenus */
  getColumnLabel: (
    column: InfiniteTableComputedColumn<T>,
  ) => MenuItemObject['label'];
};

/**
 * The default items of the column menu: sorting, collapse all (group
 * columns), clear filter, pinning, and the Columns and Group by submenus.
 */
export function getDefaultColumnMenuItems<T>(
  params: ColumnMenuItemsParams<T>,
  binder: ColumnMenuItemsBinder<T>,
): MenuProps['items'] {
  const { columnApi, column, getComputed, api, dataSourceApi } = params;

  const sortable = columnApi.isSortable();

  const sortItems = sortable
    ? [
        {
          key: 'sort-asc',
          label: 'Sort Ascending',
          disabled: column.computedSortedAsc,
          onAction: () => {
            api.setSortingForColumn(column.id, 1);
          },
        },
        {
          key: 'sort-desc',
          label: 'Sort Descending',
          disabled: column.computedSortedDesc,
          onAction: () => {
            api.setSortingForColumn(column.id, -1);
          },
        },
        {
          key: 'sort-none',
          label: 'Unsort',
          disabled: !column.computedSorted,
          onAction: () => {
            api.setSortingForColumn(column.id, null);
          },
        },
        '-',
      ]
    : [];

  const groupItems = column.groupByForColumn
    ? [
        {
          key: 'collapse-all',
          label: 'Collapse All',
          onAction: () => {
            api.collapseAllGroupRows();
          },
        },
        '-',
      ]
    : [];

  return [
    ...groupItems,
    ...sortItems,

    column.computedFilterable
      ? {
          key: 'clear-filter',
          label: 'Clear Filter',
          disabled: !column.computedFiltered,
          onAction: () => {
            api.clearColumnFilter(column.id);
          },
        }
      : null,
    column.computedFilterable ? '-' : null,

    {
      key: 'pin-start',
      label: 'Pin to start',
      disabled: column.computedPinned === 'start',
      onAction: () => {
        api.setPinningForColumn(column.id, 'start');
      },
    },
    // {
    //   key: 'pin-end',
    //   label: 'Pin to end',
    //   disabled: column.computedPinned === 'end',
    //   onAction: () => {},
    // },
    {
      key: 'unpin',
      label: 'Unpin',
      disabled: !column.computedPinned,
      onAction: () => {
        api.setPinningForColumn(column.id, false);
      },
    },
    '-',
    {
      key: 'columns',
      label: 'Columns',
      menu: () => {
        const colItems: MenuItemObject[] = [];

        const computed = getComputed();

        computed.computedColumnsMapInInitialOrder.forEach((col, id) => {
          const label = binder.getColumnLabel(col);

          colItems.push({
            key: id,
            label,

            check: binder.renderCheckBox({
              key: col.id,
              disabled:
                col.computedVisible && api.getVisibleColumnsCount() === 1,
              checked: col.computedVisible,
              onChange: (checked) => {
                const visible = !!checked;
                api.setVisibilityForColumn(col.id, visible);
                requestAnimationFrame(() => {
                  // we do need this raf
                  // because in the realignment we need to access the new state/computed state
                  // based on the new visibility
                  api.realignColumnContextMenu();
                });
              },
            }),
          });
        });

        return {
          columns: [
            {
              name: 'check',
            },
            { name: 'label' },
          ],
          items: colItems,
        };
      },
    },
    '-',
    {
      key: 'group-by',
      label: 'Group by',
      menu: () => {
        const colItems: MenuItemObject[] = [];

        const computed = getComputed();

        computed.computedColumnsMapInInitialOrder.forEach((col, id) => {
          if (col.groupByForColumn) {
            // if it's a group column, we skip it
            return;
          }
          const label = binder.getColumnLabel(col);

          colItems.push({
            key: id,
            label,

            check: binder.renderCheckBox({
              key: col.id,
              disabled: !col.computedGroupable,
              checked: col.computedGroupedBy,
              onChange: () => {
                dataSourceApi.toggleGroupByField(col.field as keyof T);
              },
            }),
          });
        });

        return {
          columns: [
            {
              name: 'check',
            },
            { name: 'label' },
          ],
          items: colItems,
        };
      },
    },
  ].filter((x) => !!x) as MenuProps['items'];
}

/**
 * The props of the column menu of the given column (null when there's no
 * such column or no items): the default items (from `getDefaultItems`)
 * after the `getColumnMenuItems` prop.
 */
export function getColumnMenuProps<T>(
  columnId: string | null,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent: VoidFunction | undefined,
  getDefaultItems: (param: ColumnMenuItemsParams<T>) => MenuProps['items'],
): MenuProps | null {
  if (columnId == null) {
    return null;
  }
  const { getComputed, getState } = context;

  const { getColumnMenuItems } = getState();

  const column = getComputed().computedColumnsMap.get(columnId);

  if (!column) {
    return null;
  }

  const param = {
    column,
    columnApi: getColumnApiForColumn(column.id, context)!,
    ...context,
  };

  const defaultItems = getDefaultItems(param)!;

  const items = getColumnMenuItems
    ? getColumnMenuItems(defaultItems, param)
    : defaultItems;

  if (!items || !items.length) {
    return null;
  }

  return {
    autoFocus: true,
    items,
    ...getMenuVisibilityProps(onHideIntent),
  };
}

export type FilterOperatorMenuBinder = {
  /** the icon of an operator: its `components.Icon`, or the filter icon */
  renderOperatorIcon: (operator: DataSourceFilterOperator<any>) => any;
  /** the label of an operator, from its `label` or `name` */
  renderOperatorLabel: (label: string) => any;
  /** the icon of the Reset item */
  renderClearIcon: () => any;
  /** the check of the current operator */
  renderDoneIcon: () => any;
};

/**
 * The props of the filter operator menu of the given column (null when
 * there's no such column or its filter type is unknown): Close / Reset and
 * one item per operator of the column's filter type, after the
 * `getFilterOperatorMenuItems` prop.
 */
export function getFilterOperatorMenuProps<T>(
  columnId: string | null,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent: VoidFunction | undefined,
  binder: FilterOperatorMenuBinder,
): MenuProps | null {
  if (columnId == null) {
    return null;
  }
  const {
    getComputed,
    getState,
    getDataSourceState,
    actions,
    dataSourceApi,
    dataSourceActions,
    api,
  } = context;

  const { getFilterOperatorMenuItems } = getState();

  const column = getComputed().computedColumnsMap.get(columnId);

  if (!column) {
    return null;
  }

  const { filterTypes } = getDataSourceState();

  const columnFilterType = filterTypes[column.computedFilterType];

  if (!columnFilterType) {
    return null;
  }

  const operatorItems = columnFilterType.operators.map((operator) => {
    const key = operator.name;
    const checked = column.computedFilterValue
      ? column.computedFilterValue.filter.operator === key
      : key === columnFilterType.defaultOperator;

    return {
      key,
      icon: binder.renderOperatorIcon(operator),
      label: binder.renderOperatorLabel(operator.label ?? operator.name),
      onAction: () => {
        api.setColumnFilterOperator(columnId, key);
      },
      checked: checked ? binder.renderDoneIcon() : null,
    };
  });

  const firstItems = [
    {
      key: 'close',
      label: 'Close Menu',
      icon: null,

      onAction: () => {
        api.hideFilterOperatorMenu();
      },
    },
    {
      key: 'reset',
      label: 'Reset',
      icon: binder.renderClearIcon(),
      disabled: !column.computedFiltered,
      onAction: () => {
        api.clearColumnFilter(columnId);
      },
    },
    '-',
  ];

  const defaultItems = [...firstItems, ...operatorItems];

  const param = {
    column,
    api,
    getState,
    getDataSourceState,
    getComputed,
    actions,
    dataSourceApi,
    dataSourceActions,
    columnFilterValue: column.computedFilterValue,
    filterTypes,
  };

  const items = getFilterOperatorMenuItems
    ? getFilterOperatorMenuItems(defaultItems as any, param as any)
    : defaultItems;

  return {
    autoFocus: true,
    columns: [
      {
        name: 'icon',
      },
      { name: 'label' },
      { name: 'checked' },
    ],
    items: items as MenuProps['items'],
    ...getMenuVisibilityProps(onHideIntent),
  };
}

/**
 * How a framework renders a context menu.
 */
export type ContextMenuBinder<R> = {
  renderMenu: (props: MenuProps) => R;
  /**
   * A lazy menu (`getCellContextMenuItems` / `getContextMenuItems` returned
   * a promise): `getLazyMenuProps()` turns the resolved definition into
   * the props of the menu.
   */
  renderLazyMenu: (
    menuDefinition: Promise<GetContextMenuItemsReturnType>,
    menuDefaultProps: MenuProps,
  ) => R;
};

function getContextMenuContent<R>(
  menuDefinition:
    | GetContextMenuItemsReturnType
    | Promise<GetContextMenuItemsReturnType>,
  menuDefaultProps: MenuProps,
  binder: ContextMenuBinder<R>,
): { menu: R | null; preventDefault: boolean } {
  const preventDefault =
    menuDefinition instanceof Promise
      ? true
      : Array.isArray(menuDefinition)
      ? true
      : !!(menuDefinition && Array.isArray(menuDefinition.items));

  if (menuDefinition instanceof Promise) {
    return {
      menu: binder.renderLazyMenu(menuDefinition, menuDefaultProps),
      preventDefault,
    };
  }

  const { items, columns } = getMenuItemsAndColumns(menuDefinition);

  if (!items || !items.length) {
    return { menu: null, preventDefault: Array.isArray(items) };
  }

  return {
    preventDefault,
    menu: binder.renderMenu({ ...menuDefaultProps, columns, items }),
  };
}

/**
 * The cell context menu (from the `getCellContextMenuItems` prop), the
 * cell context it was computed for and whether the native context menu
 * should be prevented.
 */
export function getCellContextMenuContent<T, R>(
  cellLocation: CellContextMenuLocationWithEvent,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent: VoidFunction | undefined,
  binder: ContextMenuBinder<R>,
) {
  const { columnId, rowIndex, event } = cellLocation;
  const { getComputed, getState } = context;

  const { getCellContextMenuItems } = getState();

  const { computedColumnsMap } = getComputed();

  const column = computedColumnsMap.get(columnId)!;

  const cellContext = {
    ...getCellContext({
      ...context,
      rowIndex,
      columnId: column.id,
    }),
    event,
  };

  if (!column || !getCellContextMenuItems) {
    return {
      cellContext,
      menu: null as R | null,
      preventDefault: false,
    };
  }

  const menuDefaultProps = getMenuDefaultProps({
    onHideIntent,
  });

  const menuDefinition = getCellContextMenuItems(cellContext, context);

  return {
    cellContext,
    ...getContextMenuContent(menuDefinition, menuDefaultProps, binder),
  };
}

/**
 * The table context menu (from the `getContextMenuItems` prop), the cell
 * context it was computed for (when over a cell) and whether the native
 * context menu should be prevented.
 */
export function getTableContextMenuContent<T, R>(
  menuLocation: ContextMenuLocationWithEvent,
  context: InfiniteTableStableContextValue<T>,
  onHideIntent: VoidFunction | undefined,
  binder: ContextMenuBinder<R>,
) {
  const { getState, getComputed } = context;
  const { getContextMenuItems } = getState();

  const { computedColumnsMap } = getComputed();

  const column = menuLocation.columnId
    ? computedColumnsMap.get(menuLocation.columnId)
    : undefined;

  const cellContext = column
    ? {
        ...menuLocation,
        ...getCellContext({
          ...context,
          rowIndex: menuLocation.rowIndex!,
          columnId: column.id,
        }),
      }
    : menuLocation;

  if (!getContextMenuItems) {
    return { cellContext, menu: null as R | null, preventDefault: false };
  }

  const menuDefaultProps = getMenuDefaultProps({
    onHideIntent,
  });
  const menuDefinition = getContextMenuItems(cellContext as any, context);

  return {
    cellContext,
    ...getContextMenuContent(menuDefinition, menuDefaultProps, binder),
  };
}
