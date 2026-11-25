import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Signal,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';

import { join } from '../../../../utils/join';
import { computedWithDeps } from '../../../hooks/computedWithDeps.angular';
import { watchSignals } from '../../../hooks/watchSignals.angular';
import { getScrollbarWidth } from '../../../utils/getScrollbarWidth';
import type { MatrixBrain } from '../../../VirtualBrain/MatrixBrain';
import type { ScrollPosition } from '../../../types/ScrollPosition';
import { renderPooled } from '../../../HeadlessTable/AngularPooledViews.angular';
import { RawTable } from '../../../HeadlessTable/RawTableForAngular.angular';
import type {
  TableRenderCellFn,
  TableRenderCellFnParam,
} from '../../../HeadlessTable/rendererTypes';
import type { Renderable } from '../../../types/FrameworkTypes.angular';

import { internalProps } from '../../internalProps';
import type { InfiniteTableComputedColumnGroup } from '../../types/InfiniteTableProps';
import { CELL_DETACHED_CLASSNAMES } from '../cellDetachedCls';
import { injectInfiniteTable } from '../../InfiniteTableContextForAngular.angular';

import { buildColumnAndGroupTree } from './buildColumnAndGroupTree';
import {
  HeaderClsRecipe,
  HeaderScrollbarPlaceholderCls,
  HeaderWrapperCls,
} from './header.css';
import { InfiniteTableHeaderWrapperClassName } from './headerClassName';
import {
  InfiniteHeaderCellHost,
  InfiniteTableHeaderCell,
  type InfiniteTableHeaderCellProps,
} from './InfiniteTableHeaderCellForAngular.angular';
import {
  InfiniteTableHeaderGroup,
  type InfiniteTableHeaderGroupProps,
} from './InfiniteTableHeaderGroupForAngular.angular';

const { rootClassName } = internalProps;

export const TableHeaderClassName = `${rootClassName}Header`;

const EMPTY_ARR: string[] = [];

const HEADER_CLASS_NAME = join(
  TableHeaderClassName,
  `${TableHeaderClassName}--virtualized`,
  HeaderClsRecipe({
    overflow: false,
  }),
);

const WRAPPER_CLASS_NAME = `${InfiniteTableHeaderWrapperClassName} ${HeaderWrapperCls}`;

/**
 * Angular sibling of TableHeaderWrapper + InfiniteTableInternalHeader (a port
 * of TableHeaderWrapperForVue.vue.ts): the host IS the header wrapper div.
 * Computes the header rows / height (incl. column groups), wires the header
 * MatrixBrain, keeps the header scrolled with the body (transform) and
 * renders the virtualized header through the RawTable directive over
 * state.headerRenderer / state.headerOnRenderUpdater - header cells and
 * column group cells are pooled views, like the body cells.
 */
@Component({
  selector: 'div[infiniteTableHeaderWrapper]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [RawTable],
  host: {
    '[class]': 'wrapperClassName',
    '[style.height.px]': 'height()',
  },
  template: `<div
      #header
      [class]="headerClassName"
      [style.height.px]="height()"
    >
      <ng-container
        infiniteRawTable
        [brain]="headerBrain()"
        [renderCell]="renderCell()"
        [renderer]="$any(headerRenderer())"
        [onRenderUpdater]="headerOnRenderUpdater()"
        [cellHoverClassNames]="emptyArray"
        [cellDetachedClassNames]="cellDetachedClassNames"
      />
    </div>
    @if (scrollbarPlaceholderWidth(); as width) {
    <div
      [class]="scrollbarPlaceholderClassName"
      [style.z-index]="1000"
      [style.width.px]="width"
    ></div>
    }`,
})
export class TableHeaderWrapper implements OnInit {
  readonly headerBrain = input.required<MatrixBrain>();
  readonly bodyBrain = input.required<MatrixBrain>();
  readonly wrapRowsHorizontally = input<boolean>(false);

  protected readonly table = injectInfiniteTable();
  private readonly injector = inject(Injector);

  protected readonly wrapperClassName = WRAPPER_CLASS_NAME;
  protected readonly headerClassName = HEADER_CLASS_NAME;
  protected readonly scrollbarPlaceholderClassName =
    HeaderScrollbarPlaceholderCls;
  protected readonly emptyArray = EMPTY_ARR;
  protected readonly cellDetachedClassNames = CELL_DETACHED_CLASSNAMES;

  private readonly headerRef = viewChild<ElementRef<HTMLElement>>('header');

  // selected, so the header doesn't re-render on every state change
  protected readonly headerRenderer = computed(
    () => this.table.state().headerRenderer,
  );
  protected readonly headerOnRenderUpdater = computed(
    () => this.table.state().headerOnRenderUpdater,
  );

  protected readonly rows = computed(() => {
    const s = this.table.state();
    const computedColumnGroups = s.computedColumnGroups;
    return !computedColumnGroups || !Object.keys(computedColumnGroups).length
      ? 1
      : s.columnGroupsMaxDepth + 2;
  });

  protected readonly height = computed(() => {
    const s = this.table.state();
    return (
      this.rows() * s.columnHeaderHeight +
      (s.showColumnFilters ? s.columnHeaderHeight : 0)
    );
  });

  protected readonly scrollbarPlaceholderWidth = computed(() =>
    this.table.scrollbars().vertical ? getScrollbarWidth() : 0,
  );

  private readonly columnAndGroupTreeInfo = computedWithDeps(
    () => {
      const s = this.table.state();
      return [
        s.computedColumnGroups,
        s.columnGroupsDepthsMap,
        s.columnGroupsMaxDepth,
        this.table.computed().computedVisibleColumns,
      ];
    },
    () => {
      const s = this.table.getState();
      const { computedColumnGroups, columnGroupsDepthsMap } = s;
      const { computedVisibleColumns } = this.table.getComputed();

      if (!computedColumnGroups || !Object.keys(computedColumnGroups).length) {
        return undefined;
      }

      return buildColumnAndGroupTree(
        computedVisibleColumns,
        computedColumnGroups,
        columnGroupsDepthsMap,
        s.columnGroupsMaxDepth,
      );
    },
  );

  // memoized on the deps of the React InfiniteTableHeader renderCell, plus
  // the state the header cells select (React and Vue select it per cell; in
  // Angular it reaches them as props, so a change re-renders the header
  // through the pool) - a data update must not produce a new renderCell
  protected readonly renderCell: Signal<TableRenderCellFn> =
    computedWithDeps<TableRenderCellFn>(
      () => {
        const s = this.table.state();
        const ds = this.table.dataSourceContext.state();
        const { computedVisibleColumns, computedColumnsMap } =
          this.table.computed();
        return [
          s.headerOptions,
          s.columnHeaderHeight,
          s.columnGroupsMaxDepth,
          s.showColumnFilters,
          s.columnMenuVisibleForColumnId,
          s.columnReorderDragColumnId,
          s.columnReorderInPageIndex,
          s.columnGroupVisibility,
          s.components,
          computedVisibleColumns,
          computedColumnsMap,
          this.columnAndGroupTreeInfo(),
          this.headerBrain(),
          ds.allRowsSelected,
          ds.someRowsSelected,
          ds.selectionMode,
          ds.filterTypes,
          ds.filterDelay,
        ];
      },
      () => {
        const s = this.table.getState();
        const ds = this.table.dataSourceContext.getDataSourceState();
        const { computedVisibleColumns, computedColumnsMap } =
          this.table.getComputed();

        const headerBrain = this.headerBrain();
        const columnAndGroupTreeInfo = this.columnAndGroupTreeInfo();
        const {
          columnGroupsMaxDepth,
          headerOptions,
          columnGroupVisibility,
          columnMenuVisibleForColumnId,
          columnReorderDragColumnId,
          columnReorderInPageIndex,
          showColumnFilters,
          columnHeaderHeight,
          components,
        } = s;

        const {
          allRowsSelected,
          someRowsSelected,
          selectionMode,
          filterTypes,
        } = ds;

        return (params: TableRenderCellFnParam) => {
          const {
            rowIndex,
            colIndex,
            height,
            widthWithColspan,
            heightWithRowspan,
            hidden,
          } = params;

          const column = computedVisibleColumns[colIndex];
          if (!column || hidden) {
            return null;
          }
          const horizontalLayoutPageIndex = headerBrain.isHorizontalLayoutBrain
            ? headerBrain.getPageIndexForRow(rowIndex)
            : null;
          const colGroupItem = columnAndGroupTreeInfo
            ? columnAndGroupTreeInfo.pathsToCells.get([rowIndex, colIndex])
            : null;

          if (colGroupItem && colGroupItem.type === 'group') {
            const columns = colGroupItem.columnItems.map((item) => item.ref);
            const computedColumnGroup: InfiniteTableComputedColumnGroup = {
              ...colGroupItem.ref,
              id: colGroupItem.id,
              uniqueGroupId: colGroupItem.uniqueGroupId,
              depth: colGroupItem.depth,
              columns: columns.map((c) => c.id),
              computedWidth: colGroupItem.computedWidth,
              groupOffset: colGroupItem.groupOffset,
            };
            const visible = columnGroupVisibility[colGroupItem.id] !== false;

            const groupProps: InfiniteTableHeaderGroupProps = {
              horizontalLayoutPageIndex,
              columnGroupsMaxDepth,
              columns,
              width: widthWithColspan,
              height,
              columnGroup: computedColumnGroup,
            };

            return visible
              ? (renderPooled(
                  InfiniteTableHeaderGroup,
                  groupProps,
                ) as unknown as Renderable)
              : null;
          }

          const cellProps: InfiniteTableHeaderCellProps = {
            column,
            columnsMap: computedColumnsMap,
            horizontalLayoutPageIndex,
            headerOptions,
            width: widthWithColspan,
            height: heightWithRowspan,
            allRowsSelected,
            someRowsSelected,
            selectionMode,
            columnMenuVisibleForColumnId,
            columnReorderDragColumnId,
            columnReorderInPageIndex,
            showColumnFilters: !!showColumnFilters,
            columnHeaderHeight,
            components,
            filterTypes,
          };

          const HeaderCell = (column as any).components?.HeaderCell;

          // the pooled header cell keeps its component and DOM element and
          // only gets new props
          return (HeaderCell
            ? renderPooled(HeaderCell, cellProps, [InfiniteHeaderCellHost])
            : renderPooled(
                InfiniteTableHeaderCell,
                cellProps,
              )) as unknown as Renderable;
        };
      },
    );

  ngOnInit() {
    // what useMatrixBrain does for the header brain in TableHeaderWrapper
    // (React: memoized callbacks, so the brain only updates on a change)
    watchSignals(
      () => {
        const s = this.table.state();
        const {
          computedVisibleColumns,
          computedPinnedStartColumns,
          computedPinnedEndColumns,
          columnSize,
        } = this.table.computed();
        return [
          this.headerBrain(),
          computedVisibleColumns,
          computedPinnedStartColumns,
          computedPinnedEndColumns,
          columnSize,
          this.rows(),
          this.height(),
          this.columnAndGroupTreeInfo(),
          s.showColumnFilters,
          s.columnHeaderHeight,
        ] as const;
      },
      ([
        headerBrain,
        computedVisibleColumns,
        computedPinnedStartColumns,
        computedPinnedEndColumns,
        columnSize,
        rows,
        height,
        columnAndGroupTreeInfo,
        showColumnFilters,
        columnHeaderHeight,
      ]) => {
        const cellspan = ({
          rowIndex,
          colIndex,
        }: {
          rowIndex: number;
          colIndex: number;
        }) => {
          const column = computedVisibleColumns[colIndex];

          const rowspan = 1;
          const colspan = 1;
          if (!column || !columnAndGroupTreeInfo) {
            return { rowspan, colspan };
          }

          const treeItem = columnAndGroupTreeInfo.pathsToCells.get([
            rowIndex,
            colIndex,
          ]);

          if (!treeItem) {
            return { rowspan, colspan };
          }
          if (treeItem.type === 'column') {
            return {
              colspan,
              rowspan: rows - treeItem.depth,
            };
          }

          const index = treeItem.columnItems.findIndex(
            (child) => child.id === column.id,
          );

          return {
            rowspan,
            colspan: index === 0 ? treeItem.columnItems.length : 1,
          };
        };

        const rowHeight = (index: number) =>
          showColumnFilters
            ? index < rows - 1
              ? columnHeaderHeight
              : 2 * columnHeaderHeight
            : columnHeaderHeight;

        if (
          computedPinnedStartColumns.length ||
          computedPinnedEndColumns.length
        ) {
          headerBrain.updateFixedCells({
            fixedColsStart: computedPinnedStartColumns.length,
            fixedColsEnd: computedPinnedEndColumns.length,
          });
        }

        headerBrain.update({
          colWidth: columnSize,
          rowHeight,
          rows,
          cols: computedVisibleColumns.length,
          height,
          rowspan: ({ rowIndex, colIndex }) =>
            cellspan({ rowIndex, colIndex }).rowspan,
          colspan: ({ rowIndex, colIndex }) =>
            cellspan({ rowIndex, colIndex }).colspan,
        });
      },
      { injector: this.injector, immediate: true },
    );
  }

  constructor() {
    // ------- scroll transform sync -------
    afterRenderEffect((onCleanup) => {
      const headerBrain = this.headerBrain();
      untracked(() => {
        const removeOnScroll = headerBrain.onScroll((scrollPosition) =>
          this.updateDOMTransform(headerBrain, scrollPosition),
        );
        // useful when the brain is changed - when toggling
        // wrapRowsHorizontally
        this.updateDOMTransform(
          headerBrain,
          headerBrain.getScrollPosition() || { scrollLeft: 0, scrollTop: 0 },
        );
        onCleanup(removeOnScroll);
      });
    });
  }

  private updateDOMTransform(
    headerBrain: MatrixBrain,
    scrollPosition: ScrollPosition,
  ) {
    const headerDOMNode = untracked(this.headerRef)?.nativeElement;
    if (headerDOMNode) {
      // relative to the scroll origin, like the header cells - see
      // largeContent.ts (in horizontal layout the header brain uses the
      // body brain's origin, so header and body stay aligned)
      const { scrollLeft } = headerBrain.getDOMScrollPosition(scrollPosition);
      headerDOMNode.style.transform = `translate3d(${-scrollLeft}px, 0px, 0px)`;
    }
  }
}
