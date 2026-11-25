import { TemplateRef } from '@angular/core';

import {
  isComponentRenderable,
  isTemplateRenderable,
} from '../../RawList/InfiniteRenderForAngular.angular';
import type { Renderable } from '../../types/FrameworkTypes.angular';
import { getColumnApiForColumn } from '../api/getColumnApi';
import type { GetImperativeApiParam } from '../api/type';
import type { InfiniteTableApi, InfiniteTableComputedColumn } from '../types';
import type { InfiniteTableColumnHeaderParam } from '../types/InfiniteTableColumn';

/**
 * Angular sibling of getColumnLabel (InfiniteTableHeader/getColumnLabel.ts)
 * for the places that render a column's header outside a header cell (the
 * Columns and Group by submenus): the label is bound to the header param it
 * was computed with, so a header template gets the column (`$implicit`)
 * and the header param (`let-columnApi="columnApi"`, ...), not the context
 * of the menu cell it is shown in; a component gets its inputs named like
 * the header param's properties.
 *
 * TODO(header slice): also provide the header cell token
 * (`injectHeaderCell()`) to the content, from `param` (no `domRef`), once
 * it exists - an `injector` on the bound template/component.
 */
export function getColumnLabelForAngular<T>(
  colIdOrCol: string | InfiniteTableComputedColumn<T>,
  context: {
    api: InfiniteTableApi<T>;
  } & GetImperativeApiParam<T>,
  renderLocation: 'grouping-toolbar' | 'column-menu' | 'column-filter',
): Renderable {
  const col =
    typeof colIdOrCol === 'string'
      ? context.getComputed().computedColumnsMap.get(colIdOrCol)!
      : colIdOrCol;

  const {
    api,
    getComputed,
    getDataSourceState,
    actions,
    dataSourceActions,
    dataSourceApi,
  } = context;
  const { allRowsSelected, someRowsSelected, selectionMode } =
    getDataSourceState();
  const computed = getComputed();

  const defaultLabel: Renderable = col.name || col.id || '';

  const columnApi = getColumnApiForColumn(col.id, {
    ...context,
    actions,
    dataSourceActions,
    dataSourceApi,
  })!;

  const param = {
    horizontalLayoutPageIndex: null,
    column: col,
    columnApi,
    dataSourceApi,
    renderLocation,
    dragging: false,
    columnsMap: computed.computedColumnsMap,
    columnSortInfo: col.computedSortInfo,
    columnFilterValue: col.computedFilterValue,
    filtered: col.computedFiltered,
    allRowsSelected,
    someRowsSelected,
    selectionMode,
    api,
    renderBag: {
      header: defaultLabel,
    },
  } as any as InfiniteTableColumnHeaderParam<any>;

  const header = col.header as unknown;

  if (typeof header === 'function') {
    const label = (header as Function)(param) ?? null;
    return bindToHeaderParam(label, param);
  }

  if (header) {
    return bindToHeaderParam(header as Renderable, param);
  }

  return defaultLabel;
}

function bindToHeaderParam(
  content: Renderable,
  param: InfiniteTableColumnHeaderParam<any>,
): Renderable {
  if (content == null || typeof content !== 'object') {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map((item) => bindToHeaderParam(item, param));
  }
  const context = { ...param, $implicit: param.column };
  if (content instanceof TemplateRef) {
    return { kind: 'template', template: content, context };
  }
  if (isTemplateRenderable(content)) {
    return content.context !== undefined ? content : { ...content, context };
  }
  if (isComponentRenderable(content)) {
    return {
      ...content,
      // the outlet only sets the inputs the component declares
      inputs: { ...(param as any), ...content.inputs },
    };
  }
  return content;
}
