import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  InjectionToken,
  Injector,
  Signal,
  ViewEncapsulation,
  inject,
  untracked,
} from '@angular/core';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { styleWithUnits } from '../../../../utils/styleWithUnits';
import { computeGroupResize } from '../../../flexbox';
import type { MatrixBrain } from '../../../VirtualBrain/MatrixBrain';
import { injectPooledProps } from '../../../HeadlessTable/AngularPooledViews.angular';
import { InfiniteRender } from '../../../RawList/InfiniteRenderForAngular.angular';
import {
  RenderStage,
  bindRenderable,
  createRenderStage,
} from '../../../RawList/bindRenderable.angular';
import type { Renderable } from '../../../types/FrameworkTypes.angular';
import { rootClassName } from '../../internalProps';
import { InternalVars } from '../../internalVars.css';
import { cssEllipsisClassName } from '../../utilities.css';
import { injectInfiniteTable } from '../../InfiniteTableContextForAngular.angular';

import type { InfiniteTableComputedColumn } from '../../types';
import type { InfiniteTablePropColumnSizing } from '../../types';
import type { InfiniteTableComputedColumnGroup } from '../../types/InfiniteTableProps';

import { GroupResizeHandle } from './ResizeHandle/GroupResizeHandleForAngular.angular';
import { getResizeAvailableSize } from './ResizeHandle/columnResizeShared';

import { HeaderGroupCls } from './header.css';

export const TableHeaderGroupClassName = `${rootClassName}HeaderGroup`;

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);

const CONTENT_CLASS_NAME = join(
  `${TableHeaderGroupClassName}__header-content`,
  cssEllipsisClassName,
);
const HOST_CLASS_NAME = join(HeaderGroupCls, TableHeaderGroupClassName);

/**
 * What a column group header function gets, and the context of a column
 * group header template (`$implicit` is the column group).
 */
export type InfiniteTableHeaderGroupParam = {
  columnGroup: InfiniteTableComputedColumnGroup;
  horizontalLayoutPageIndex: number | null;
};

export const INFINITE_HEADER_GROUP = new InjectionToken<
  Signal<InfiniteTableHeaderGroupParam>
>('INFINITE_HEADER_GROUP');

/**
 * The props of a column group header cell, from the header's renderCell.
 */
export type InfiniteTableHeaderGroupProps = {
  columnGroup: InfiniteTableComputedColumnGroup;
  columns: InfiniteTableComputedColumn<any>[];
  height: number;
  width: number;
  columnGroupsMaxDepth: number;
  horizontalLayoutPageIndex: number | null;
};

type HeaderGroupView = {
  hidden: boolean;
  groupId: string | null;
  style: Record<string, any>;
  zIndex: string | null;
  header: Renderable;
  resizable: boolean;
  brain: MatrixBrain | null;
  draggerStyle: Record<string, any> | undefined;
  computedVisibleColumns: InfiniteTableComputedColumn<any>[];
  groupColumns: InfiniteTableComputedColumn<any>[];
};

const HIDDEN_VIEW: HeaderGroupView = {
  hidden: true,
  groupId: null,
  style: { display: 'none' },
  zIndex: null,
  header: null,
  resizable: false,
  brain: null,
  draggerStyle: undefined,
  computedVisibleColumns: [],
  groupColumns: [],
};

const groupImplicit = (param: InfiniteTableHeaderGroupParam) =>
  param.columnGroup;

/**
 * Angular sibling of InfiniteTableHeaderGroup - a column group header cell,
 * the host IS the group div (`div.InfiniteHeaderGroup`, data-group-id,
 * widths from the column width CSS vars), with the column group resize
 * handle (ports useColumnGroupResizeHandle).
 *
 * `columnGroups[id].header` is a Renderable or a function returning one;
 * a template gets the column group as `$implicit`.
 */
@Component({
  selector: 'div[infiniteHeaderGroup]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [InfiniteRender, GroupResizeHandle],
  host: {
    '[attr.data-group-id]': 'view.groupId',
    '[class]': 'hostClassName',
    '[style]': 'view.style',
    '[attr.data-z-index]': 'view.zIndex',
  },
  template: `@if (!view.hidden) {
    <div [class]="contentClassName">
      <ng-container [infiniteRender]="view.header" />
    </div>
    @if (view.resizable) {
    <div
      infiniteGroupResizeHandle
      [brain]="view.brain!"
      [draggerStyle]="view.draggerStyle"
      [columns]="view.computedVisibleColumns"
      [groupColumns]="view.groupColumns"
      [computeResize]="computeResizeForDiff"
      [onResize]="onColumnResize"
    ></div>
    }}`,
})
export class InfiniteTableHeaderGroup implements DoCheck {
  private readonly props = injectPooledProps<InfiniteTableHeaderGroupProps>();
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly table = injectInfiniteTable();
  private readonly stage: RenderStage<InfiniteTableHeaderGroupParam> =
    createRenderStage(INFINITE_HEADER_GROUP, inject(Injector));

  protected readonly hostClassName = HOST_CLASS_NAME;
  protected readonly contentClassName = CONTENT_CLASS_NAME;

  protected view: HeaderGroupView = HIDDEN_VIEW;
  private builtFor: InfiniteTableHeaderGroupProps | null = null;

  // ports computeResizeForDiff from useColumnGroupResizeHandle
  protected readonly computeResizeForDiff = (diff: number) => {
    const state = this.table.getState();
    const { columnSizing, viewportReservedWidth, bodySize } = state;

    const columns = this.table.getComputed().computedVisibleColumns;
    const groupColumns = untracked(this.props)?.columns ?? [];
    const lastColumnInGroup = groupColumns[groupColumns.length - 1];

    let atLeastOneFlex = false;

    const columnSizingWithFlex = columns.reduce((acc, col) => {
      if (col.computedFlex) {
        // we explicitly need `{ flex: col.computedWidth }` and not
        // `{ flex: col.computedFlex }` - see #advancedcolumnresizing
        acc[col.id] = { ...columnSizing[col.id], flex: col.computedWidth };
        atLeastOneFlex = true;
      }
      return acc;
    }, {} as InfiniteTablePropColumnSizing);

    const columnSizingForResize = atLeastOneFlex
      ? {
          // #advancedcolumnresizing-important - this order is correct:
          // first the current columnSizing from state, then for flex
          // columns override with actual computed widths
          ...columnSizing,
          ...columnSizingWithFlex,
        }
      : columnSizing;

    return computeGroupResize({
      availableSize: getResizeAvailableSize(bodySize),
      reservedWidth: viewportReservedWidth || 0,
      dragHandleOffset: diff,
      dragHandlePositionAfter: lastColumnInGroup.computedVisibleIndex,
      columnSizing: columnSizingForResize,
      columnGroupSize: groupColumns.length,
      items: columns.map((c) => {
        return {
          id: c.id,
          resizable: c.computedResizable,
          computedFlex: c.computedFlex,
          computedWidth: c.computedWidth,
          computedMinWidth: c.computedMinWidth,
          computedMaxWidth: c.computedMaxWidth,
        };
      }),
    });
  };

  protected readonly onColumnResize = (diff: number) => {
    const { columnSizing, reservedWidth } = this.computeResizeForDiff(diff);

    const { actions } = this.table;
    actions.viewportReservedWidth = reservedWidth;
    actions.columnSizing = columnSizing;
  };

  ngDoCheck() {
    const props = untracked(this.props);
    if (!props || this.builtFor === props) {
      return;
    }
    this.builtFor = props;
    this.view = this.buildView(props);
    this.cdr.markForCheck();
  }

  private buildView(props: InfiniteTableHeaderGroupProps): HeaderGroupView {
    const {
      columnGroup,
      height,
      columns,
      columnGroupsMaxDepth,
      horizontalLayoutPageIndex,
    } = props;

    const firstColumn = columns[0];
    if (!columnGroup || !firstColumn) {
      return HIDDEN_VIEW;
    }

    const param: InfiniteTableHeaderGroupParam = {
      columnGroup,
      horizontalLayoutPageIndex,
    };

    let header: unknown = columnGroup.header;
    if (header instanceof Function) {
      header = header(param);
    }

    const width =
      columns.length > 1
        ? `calc( ` +
          columns
            .map(
              (col) => `var(${columnWidthAtIndex}-${col.computedVisibleIndex})`,
            )
            .join(' + ') +
          ' )'
        : `var(${columnWidthAtIndex}-${firstColumn.computedVisibleIndex})`;

    // the zIndexes are bigger at groups that are at the top
    // also groups to the left have a higher zIndex
    const zIndex = `calc(var(${columnZIndexAtIndex}-${
      firstColumn.computedVisibleIndex
    }) + ${columnGroupsMaxDepth - columnGroup.depth})`;

    const userStyle = columnGroup.style;
    let style: unknown =
      typeof userStyle === 'function' ? userStyle(param) : userStyle;
    style =
      style && typeof style === 'object'
        ? { ...styleWithUnits(style as Record<string, any>) }
        : {};

    (style as Record<string, any>).width = width;
    (style as Record<string, any>).height = `${height}px`;
    // the renderer applies data-z-index when it positions the element, which
    // for a new pooled view is before its first commit - the header cells
    // have it in their style too
    (style as Record<string, any>).zIndex = zIndex;

    const groupResizable = columns.some((c) => c.computedResizable);

    return {
      hidden: false,
      groupId: String(columnGroup.uniqueGroupId),
      style: style as Record<string, any>,
      zIndex,
      header: bindRenderable(header, param, this.stage, groupImplicit),
      resizable: groupResizable,
      brain: this.table.getState().brain,
      draggerStyle: groupResizable
        ? {
            height: `${
              height * (columnGroupsMaxDepth - columnGroup.depth + 2)
            }px`,
          }
        : undefined,
      computedVisibleColumns: this.table.getComputed().computedVisibleColumns,
      groupColumns: columns,
    };
  }
}
