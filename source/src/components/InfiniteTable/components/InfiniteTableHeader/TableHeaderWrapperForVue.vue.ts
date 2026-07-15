import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  watch,
  watchEffect,
} from 'vue';
import type { PropType } from 'vue';

import { join } from '../../../../utils/join';
import { computedWithDeps } from '../../../hooks/computedWithDeps.vue';
import { getScrollbarWidth } from '../../../utils/getScrollbarWidth';
import type { MatrixBrain } from '../../../VirtualBrain/MatrixBrain';
import type { ScrollPosition } from '../../../types/ScrollPosition';
import { RawTable } from '../../../HeadlessTable/RawTableForVue.vue';
import type {
  TableRenderCellFn,
  TableRenderCellFnParam,
} from '../../../HeadlessTable/rendererTypes';

import { internalProps } from '../../internalProps';
import type { InfiniteTableComputedColumnGroup } from '../../types/InfiniteTableProps';
import { CELL_DETACHED_CLASSNAMES } from '../cellDetachedCls';

import { buildColumnAndGroupTree } from './buildColumnAndGroupTree';
import {
  HeaderClsRecipe,
  HeaderScrollbarPlaceholderCls,
  HeaderWrapperCls,
} from './header.css';
import { InfiniteTableHeaderWrapperClassName } from './headerClassName';
import { InfiniteTableHeaderCell } from './InfiniteTableHeaderCellForVue.vue';
import { InfiniteTableHeaderGroup } from './InfiniteTableHeaderGroupForVue.vue';

import { useInfiniteTableContext } from '../../InfiniteTableContextForVue.vue';

const { rootClassName } = internalProps;

export const TableHeaderClassName = `${rootClassName}Header`;

const EMPTY_ARR: string[] = [];

const headerCls = HeaderClsRecipe({
  overflow: false,
});

/**
 * Vue sibling of TableHeaderWrapper + InfiniteTableInternalHeader: computes
 * the header rows/height (incl. column groups), wires the header MatrixBrain
 * and renders the virtualized header through the Vue rendering bridge
 * (RawTable over state.headerRenderer / state.headerOnRenderUpdater).
 *
 * Deferred: the DragList wrapper (column drag-to-reorder) and the header
 * filters row.
 */
export const TableHeaderWrapper = defineComponent({
  name: 'TableHeaderWrapper',
  props: {
    headerBrain: { type: Object as PropType<MatrixBrain>, required: true },
    bodyBrain: { type: Object as PropType<MatrixBrain>, required: true },
    wrapRowsHorizontally: { type: Boolean, default: false },
  },
  setup(props) {
    const tableContext = useInfiniteTableContext();
    const { state, getState, getComputed, dataSourceContext } = tableContext;

    const rowsRef = computed(() => {
      const s = state.value;
      const computedColumnGroups = s.computedColumnGroups;
      return !computedColumnGroups || !Object.keys(computedColumnGroups).length
        ? 1
        : s.columnGroupsMaxDepth + 2;
    });

    const heightRef = computed(() => {
      const s = state.value;
      return (
        rowsRef.value * s.columnHeaderHeight +
        (s.showColumnFilters ? s.columnHeaderHeight : 0)
      );
    });

    const columnAndGroupTreeInfoRef = computedWithDeps(
      () => {
        const s = state.value;
        return [
          s.computedColumnGroups,
          s.columnGroupsDepthsMap,
          s.columnGroupsMaxDepth,
          getComputed().computedVisibleColumns,
        ];
      },
      () => {
        const s = getState();
        const { computedColumnGroups, columnGroupsDepthsMap } = s;
        const { computedVisibleColumns } = getComputed();

        if (
          !computedColumnGroups ||
          !Object.keys(computedColumnGroups).length
        ) {
          return undefined;
        }

        return buildColumnAndGroupTree(
          computedVisibleColumns,
          computedColumnGroups,
          columnGroupsDepthsMap,
          s.columnGroupsMaxDepth,
        );
      },
      'header.treeInfo',
    );

    // what useMatrixBrain does for the header brain in TableHeaderWrapper
    watchEffect(() => {
      const s = state.value;
      const {
        computedVisibleColumns,
        computedPinnedStartColumns,
        computedPinnedEndColumns,
        columnSize,
      } = getComputed();

      const rows = rowsRef.value;
      const height = heightRef.value;
      const columnAndGroupTreeInfo = columnAndGroupTreeInfoRef.value;
      const showColumnFilters = s.showColumnFilters;
      const columnHeaderHeight = s.columnHeaderHeight;

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

      const headerBrain = props.headerBrain;

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
    });

    // ------- internal header: scroll transform sync -------
    let headerDOMNode: HTMLElement | null = null;
    const updateDOMTransform = (scrollPosition: ScrollPosition) => {
      if (headerDOMNode) {
        headerDOMNode.style.transform = `translate3d(-${scrollPosition.scrollLeft}px, 0px, 0px)`;
      }
    };
    const headerDomRef = (el: any) => {
      headerDOMNode = (el as HTMLElement) ?? null;
    };

    let removeOnScroll: VoidFunction | null = null;
    watch(
      () => props.headerBrain,
      (headerBrain) => {
        removeOnScroll?.();
        removeOnScroll = headerBrain.onScroll(updateDOMTransform);

        // useful when the brain is changed - when toggling wrapRowsHorizontally
        updateDOMTransform(
          headerBrain.getScrollPosition() || { scrollLeft: 0, scrollTop: 0 },
        );
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      removeOnScroll?.();
      removeOnScroll = null;
    });

    // ------- internal header: virtualized header cells -------
    // memoized on the same deps as the React InfiniteTableHeader renderCell
    // useCallback - a data update must not produce a new renderCell identity
    // (which would force-rerender every header cell)
    const renderCellComputed = computedWithDeps<TableRenderCellFn>(
      () => {
        const s = state.value;
        const ds = dataSourceContext.state.value;
        const { computedVisibleColumns, computedColumnsMap } = getComputed();
        return [
          s.headerOptions,
          s.columnHeaderHeight,
          s.columnGroupsMaxDepth,
          s.showColumnFilters,
          computedVisibleColumns,
          computedColumnsMap,
          columnAndGroupTreeInfoRef.value,
          props.headerBrain,
          ds.allRowsSelected,
          ds.someRowsSelected,
          ds.selectionMode,
          ds.filterTypes,
          ds.filterDelay,
        ];
      },
      () => {
        const s = getState();
        const ds = dataSourceContext.getDataSourceState();
        const { computedVisibleColumns, computedColumnsMap } = getComputed();

        const headerBrain = props.headerBrain;
        const columnAndGroupTreeInfo = columnAndGroupTreeInfoRef.value;
        const columnGroupsMaxDepth = s.columnGroupsMaxDepth;
        const headerOptions = s.headerOptions;

        const { allRowsSelected, someRowsSelected, selectionMode } = ds;

        return (params: TableRenderCellFnParam) => {
          const {
            rowIndex,
            colIndex,
            domRef,
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
            const visible =
              getState().columnGroupVisibility[colGroupItem.id] !== false;

            return visible
              ? (h(InfiniteTableHeaderGroup, {
                  key: colGroupItem.uniqueGroupId.join('/'),
                  horizontalLayoutPageIndex,
                  columnGroupsMaxDepth,
                  domRef: domRef as any,
                  columns,
                  width: widthWithColspan,
                  height,
                  columnGroup: computedColumnGroup,
                }) as any)
              : null;
          }

          return h(InfiniteTableHeaderCell, {
            key: column.id,
            domRef: domRef as any,
            column,
            columnsMap: computedColumnsMap,
            horizontalLayoutPageIndex,
            headerOptions,
            width: widthWithColspan,
            height: heightWithRowspan,
            allRowsSelected,
            someRowsSelected,
            selectionMode,
          }) as any;
        };
      },
      'header.renderCell',
    );

    return () => {
      const height = heightRef.value;
      const { scrollbars } = getComputed();
      const s = state.value;

      const header = h(
        'div',
        {
          ref: headerDomRef,
          class: join(
            TableHeaderClassName,
            `${TableHeaderClassName}--virtualized`,
            headerCls,
          ),
          style: { height: `${height}px` },
        },
        [
          h(RawTable, {
            name: 'header',
            renderCell: renderCellComputed.value,
            brain: props.headerBrain,
            renderer: s.headerRenderer as any,
            onRenderUpdater: s.headerOnRenderUpdater,
            cellHoverClassNames: EMPTY_ARR,
            cellDetachedClassNames: CELL_DETACHED_CLASSNAMES,
          }),
        ],
      );

      const verticalScrollbarPlaceholder =
        scrollbars.vertical && getScrollbarWidth()
          ? h('div', {
              class: HeaderScrollbarPlaceholderCls,
              style: {
                zIndex: 1000,
                width: `${getScrollbarWidth()}px`,
              },
            })
          : null;

      return h(
        'div',
        {
          class: `${InfiniteTableHeaderWrapperClassName} ${HeaderWrapperCls}`,
          style: {
            height: `${height}px`,
          },
        },
        [header, verticalScrollbarPlaceholder],
      );
    };
  },
});
