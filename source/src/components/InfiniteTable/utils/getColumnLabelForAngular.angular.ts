import { Injector, TemplateRef } from '@angular/core';

import {
  bindRenderable,
  createRenderStage,
  type RenderStage,
} from '../../RawList/bindRenderable.angular';
import { INFINITE_HEADER_CELL } from '../components/InfiniteTableHeader/InfiniteTableHeaderCellForAngular.angular';

import {
  isComponentRenderable,
  isTemplateRenderable,
} from '../../RawList/InfiniteRenderForAngular.angular';
import type { Renderable } from '../../types/FrameworkTypes.angular';
import { getColumnLabel } from '../components/InfiniteTableHeader/getColumnLabel';
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
 * the header param's properties, and `injectHeaderCell()` works in it (the
 * param, with no `domRef`) when the grid's `injector` is given.
 */
export function getColumnLabelForAngular<T>(
  colIdOrCol: string | InfiniteTableComputedColumn<T>,
  context: {
    api: InfiniteTableApi<T>;
  } & GetImperativeApiParam<T>,
  renderLocation: 'grouping-toolbar' | 'column-menu' | 'column-filter',
  injector?: Injector,
): Renderable {
  const col =
    typeof colIdOrCol === 'string'
      ? context.getComputed().computedColumnsMap.get(colIdOrCol)!
      : colIdOrCol;

  return getColumnLabel(col, context, renderLocation, (content, param) =>
    injector
      ? bindRenderable(
          content,
          param,
          getStage(injector, `${renderLocation}:${col.id}`),
          (p) => p.column,
        )
      : bindToHeaderParam(
          content,
          param as InfiniteTableColumnHeaderParam<any>,
        ),
  );
}

/**
 * One stable stage per grid, place and column: the menu is rendered again
 * on state changes, and a new injector would recreate the label's views.
 */
const STAGES = new WeakMap<Injector, Map<string, RenderStage<any>>>();

function getStage(injector: Injector, key: string): RenderStage<any> {
  let stages = STAGES.get(injector);
  if (!stages) {
    stages = new Map();
    STAGES.set(injector, stages);
  }
  let stage = stages.get(key);
  if (!stage) {
    stage = createRenderStage(INFINITE_HEADER_CELL, injector);
    stages.set(key, stage);
  }
  return stage;
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
