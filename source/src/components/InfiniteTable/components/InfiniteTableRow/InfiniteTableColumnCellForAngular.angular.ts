import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Directive,
  DoCheck,
  ElementRef,
  InjectionToken,
  Injector,
  Signal,
  ViewEncapsulation,
  inject,
  signal,
  untracked,
} from '@angular/core';

import { join } from '../../../../utils/join';
import { shallowEqualObjects } from '../../../../utils/shallowEqualObjects';
import { stripVar } from '../../../../utils/stripVar';
import type { GridMouseEvent } from '../../../types/DOMTypes';
import type { RowInfoStore } from '../../../DataSource/RowInfoStore';
import { injectPooledProps } from '../../../HeadlessTable/AngularPooledViews.angular';
import { InfiniteRender, renderComponent } from '../../../RawList/InfiniteRenderForAngular.angular';
import { renderDiv } from '../../../RawList/InfiniteDivForAngular.angular';
import {
  RenderStage,
  bindRenderable,
  createRenderStage,
} from '../../../RawList/bindRenderable.angular';
import type { Renderable } from '../../../types/FrameworkTypes.angular';
import { InternalVars } from '../../internalVars.css';
import { cssEllipsisClassName, overflow } from '../../utilities.css';
import { ColumnCellCls, SelectionCheckboxCls } from '../cell.css';
import { InfiniteCheckBox } from '../CheckBoxForAngular.angular';
import { updateRowSelectionOnCheckboxChange } from '../../eventHandlers/onCellClick';
import { ExpandCollapseIcon } from '../icons/ExpandCollapseIcon/ExpandCollapseIconForAngular.angular';

import type {
  InfiniteTableColumnCellContextType,
  InfiniteTableComputedColumn,
} from '../../types/InfiniteTableColumn';
import type { InfiniteTableRowInfo } from '../../types';
import type {
  InfiniteTablePropCellClassName,
  InfiniteTablePropCellStyle,
  InfiniteTablePropRepaintCellsKey,
  InfiniteTablePropRowClassName,
  InfiniteTablePropRowStyle,
} from '../../types/InfiniteTableProps';
import {
  isRepaintCellsKeyFn,
  subscribeToRepaintCellsKey,
} from './repaintCellsKey';
import { getColumnRenderingParams } from './columnRendering';
import type { InfiniteTableColumnRenderingContext } from './columnRenderingContextType';
import { getColumnCellStyling } from './columnCellStyling';
import {
  InfiniteTableCellClassName,
  InfiniteTableCellContentClassName,
} from './InfiniteTableCellClassNames';
import {
  type ColumnEditorSession,
  createColumnEditorSession,
  focusTemplateEditor,
} from './InfiniteTableColumnEditorForAngular.angular';

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const columnReorderEffectDurationAtIndex = stripVar(
  InternalVars.columnReorderEffectDurationAtIndex,
);

/**
 * The context of the body cell being rendered: what `injectColumnCell()`
 * returns, and the context of cell templates.
 */
export const INFINITE_COLUMN_CELL = new InjectionToken<
  Signal<InfiniteTableColumnCellContextType<any>>
>('INFINITE_COLUMN_CELL');

/**
 * In a component (or template) rendered in a body cell - a cell renderer, a
 * `components.ColumnCell` override, an editor: the cell's context (value,
 * rowInfo, column, renderBag, api, ...), as a signal.
 */
export function injectColumnCell<T = any>(): Signal<
  InfiniteTableColumnCellContextType<T>
> {
  return inject(INFINITE_COLUMN_CELL) as Signal<
    InfiniteTableColumnCellContextType<T>
  >;
}

/**
 * The default children of the cell - the content div (with the render bag)
 * and, while editing, the editor: what React passes to a
 * `components.ColumnCell` override as `props.children` and Vue as the
 * default slot.
 */
export const INFINITE_COLUMN_CELL_CHILDREN = new InjectionToken<
  Signal<Renderable>
>('INFINITE_COLUMN_CELL_CHILDREN');

/**
 * In a `components.ColumnCell` override: the default children of the cell
 * (the content div with the render bag and, while editing, the editor) -
 * React's `props.children`, Vue's default slot. Render them where the default
 * content goes, at the top level of the template, so the content div stays a
 * direct child of the cell:
 *
 * ```ts
 * @Component({
 *   selector: 'div[countryCell]', // an attribute selector: the host is the cell div
 *   imports: [InfiniteRender],
 *   host: { style: 'padding: 5px 20px' },
 *   template: `<ng-container [infiniteRender]="children()" /> {{ cell().value }}`,
 * })
 * class CountryCell {
 *   readonly cell = injectColumnCell();
 *   readonly children = injectColumnCellChildren();
 * }
 * ```
 *
 * The host element of the override is the cell root: the grid applies the
 * cell's class names, styles, data attributes and listeners to it.
 */
export function injectColumnCellChildren(): Signal<Renderable> {
  return inject(INFINITE_COLUMN_CELL_CHILDREN);
}

/**
 * The props of a body cell, from the root's renderCell.
 */
export type InfiniteTableColumnCellProps<T = any> = {
  rowIndex: number;
  rowHeight: number;
  width: number;
  hidden: boolean;
  column: InfiniteTableComputedColumn<T>;
  columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  fieldsToColumn: Map<keyof T, InfiniteTableComputedColumn<T>>;
  showZebraRows: boolean;
  rowDetailState: false | 'collapsed' | 'expanded';
  inEditMode?: boolean;
  rowIndexInHorizontalLayoutPage: number | null;
  horizontalLayoutPageIndex: number | null;
  rowStyle?: InfiniteTablePropRowStyle<T>;
  rowClassName?: InfiniteTablePropRowClassName<T>;
  cellStyle?: InfiniteTablePropCellStyle<T>;
  cellClassName?: InfiniteTablePropCellClassName<T>;
  /**
   * Already resolved: the column-level key if present, otherwise the table-level one.
   */
  repaintCellsKey?: InfiniteTablePropRepaintCellsKey<T>;
  getData: () => InfiniteTableRowInfo<T>[];
  rowInfoStore: RowInfoStore<T>;
  renderingContext: InfiniteTableColumnRenderingContext<T>;
  getComputedVisibleColumns: () => InfiniteTableComputedColumn<T>[];
  getComputedColumnOrder: () => string[];
  dataSourceStatePartial?: {
    isNodeReadOnly: unknown;
    selectionMode: unknown;
    cellSelection: unknown;
  };
  /**
   * The editor of the cell when it is in edit mode (rendered after the
   * content), from the root. `session` is the editing session of the cell:
   * the editor is rendered with its injector, which provides
   * `injectColumnEditor()`.
   */
  renderEditor?: (
    param: InfiniteTableColumnCellContextType<T>,
    session: ColumnEditorSession<T>,
  ) => Renderable;
  onMouseEnter?: (event: GridMouseEvent) => void;
  onMouseLeave?: (event: GridMouseEvent) => void;
};

/**
 * Angular equivalents of the default render functions in
 * InfiniteTableColumnCell.tsx (same DOM: same classnames + data attributes).
 */
export const defaultRenderRowDetailIcon = (params: any): Renderable => {
  const { toggleCurrentRowDetails, rowDetailState } = params;
  return renderComponent(ExpandCollapseIcon, {
    inputs: {
      style: { visibility: rowDetailState === false ? 'hidden' : 'visible' },
      expanded: rowDetailState === 'expanded',
      onChange: toggleCurrentRowDetails,
    },
  });
};

const EXPANDER_STYLE = {
  display: 'inline-block',
  visibility: 'visible',
} as const;

export const defaultRenderTreeIcon = (params: any): Renderable => {
  const { rowInfo, toggleCurrentTreeNode, nodeExpanded, api } = params;
  const isNodeReadOnly = api.getDataSourceState().isNodeReadOnly;
  return renderComponent(ExpandCollapseIcon, {
    inputs: {
      disabled:
        rowInfo.isTreeNode && rowInfo.isParentNode
          ? isNodeReadOnly(rowInfo)
          : false,
      style: EXPANDER_STYLE,
      expanded: nodeExpanded,
      onChange: toggleCurrentTreeNode,
    },
  });
};

export const defaultRenderSelectionCheckBox = (params: any): Renderable => {
  const { rowInfo, rowIndex, api } = params;
  const { components } = api.getState();
  const isNodeSelectable = api.getDataSourceState().isNodeSelectable;
  const CheckBoxCmp = components?.CheckBox || InfiniteCheckBox;

  return renderComponent(CheckBoxCmp, {
    inputs: {
      domProps: { class: SelectionCheckboxCls },
      disabled: rowInfo.isTreeNode ? !isNodeSelectable(rowInfo) : false,
      onChange: () => {
        updateRowSelectionOnCheckboxChange(api, rowIndex);
      },
      checked: rowInfo.rowSelected,
    },
  });
};

const cellValue = (param: InfiniteTableColumnCellContextType<any>) =>
  param.value;

type CellView = {
  hidden: boolean;
  className: string;
  style: Record<string, any>;
  columnId: string | null;
  rowId: string | null;
  zIndex: unknown;
  contentClassName: string;
  children: Renderable;
  editor: Renderable;
  renderParam: InfiniteTableColumnCellContextType<any> | null;
};

const HIDDEN_VIEW: CellView = {
  hidden: true,
  className: '',
  style: { display: 'none' },
  columnId: null,
  rowId: null,
  zIndex: null,
  contentClassName: '',
  children: null,
  editor: null,
  renderParam: null,
};

/**
 * Everything a body cell does, as a host directive: the default cell
 * (InfiniteTableColumnCell) uses it, and so does a `components.ColumnCell`
 * override (the grid adds it to the override, whose host element is then
 * the cell).
 *
 * The cell view is built in ngDoCheck - like a React render - when the
 * props, the row info or the repaint key changed: it runs the shared render
 * bag pipeline, binds every render hook result to its stage (see
 * bindRenderable) and the shared styling. Clicks, mouse down and hover are
 * native listeners: they never schedule a change detection.
 *
 * Cell root overrides (`column.components.ColumnCell`; the header cells
 * follow the same pattern for `components.HeaderCell`):
 * - the root returns `renderPooled(Override, props, [InfiniteColumnCellHost])`,
 *   so the pool creates the user's component with this directive on its host
 *   element: the host IS the cell root and gets the class names, styles,
 *   data attributes, listeners and the context providers from here;
 * - the default children (content div + editor) reach the override as ONE
 *   Renderable, `injectColumnCellChildren()`, which the override renders
 *   with `<ng-container [infiniteRender]="children()" />` at the top level of
 *   its template - the content div stays a direct child of the cell root.
 *   Built only when injected, so default cells don't pay for it;
 * - `createComponent({ directives })` puts the component before this
 *   directive, so the component's own ngDoCheck runs BEFORE this one: an
 *   override reads the cell through the signals (`injectColumnCell()`,
 *   `injectColumnCellChildren()`), in its template or an effect, never in
 *   ngDoCheck.
 */
@Directive({
  selector: '[infiniteColumnCellHost]',
  host: {
    '[class]': 'view.className',
    '[style]': 'view.style',
    '[attr.data-column-id]': 'view.columnId',
    '[attr.data-row-id]': 'view.rowId',
    '[attr.data-z-index]': 'view.zIndex',
  },
  providers: [
    {
      provide: INFINITE_COLUMN_CELL,
      useFactory: () => inject(InfiniteColumnCellHost).renderParam,
    },
    {
      provide: INFINITE_COLUMN_CELL_CHILDREN,
      useFactory: () => inject(InfiniteColumnCellHost).requestChildren(),
    },
  ],
})
export class InfiniteColumnCellHost implements DoCheck, AfterViewChecked {
  private readonly props = injectPooledProps<InfiniteTableColumnCellProps>();
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef)
    .nativeElement;

  /** the render param of the cell, for injectColumnCell() */
  readonly renderParam = signal<InfiniteTableColumnCellContextType<any>>(
    null as any,
    { equal: () => false },
  );

  view: CellView = HIDDEN_VIEW;

  /**
   * The default children as one Renderable, for `components.ColumnCell`
   * overrides (built only once someone asked for them)
   */
  private readonly children = signal<Renderable>(null);
  private childrenRequested = false;

  /** the editing session, while the cell is in edit mode */
  private editorSession: ColumnEditorSession<any> | null = null;

  private builtFor: {
    props: InfiniteTableColumnCellProps | null;
    rowInfo: InfiniteTableRowInfo<any> | undefined;
    repaintTick: number;
  } = { props: null, rowInfo: undefined, repaintTick: -1 };

  private rowInfo: InfiniteTableRowInfo<any> | undefined;
  private repaintTick = 0;

  private subscribedFor: {
    rowInfoStore: RowInfoStore<any> | null;
    rowIndex: number;
    repaintCellsKey: unknown;
    column: unknown;
  } = { rowInfoStore: null, rowIndex: -1, repaintCellsKey: null, column: null };
  private unsubscribeRowInfo: VoidFunction | null = null;
  private unsubscribeRepaintKey: VoidFunction | null = null;

  private stages = new Map<string, RenderStage<any>>();

  private readonly htmlElementRef = { current: null as HTMLElement | null };

  constructor() {
    this.htmlElementRef.current = this.element;
    const el = this.element;
    const onClick = (event: MouseEvent) => this.onClick(event);
    const onMouseDown = (event: MouseEvent) => this.onMouseDown(event);
    const onMouseEnter = (event: MouseEvent) => this.onMouseEnter(event);
    const onMouseLeave = (event: MouseEvent) => this.onMouseLeave(event);
    el.addEventListener('click', onClick);
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('mouseleave', onMouseLeave);

    inject(DestroyRef).onDestroy(() => {
      el.removeEventListener('click', onClick);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
      this.unsubscribeRowInfo?.();
      this.unsubscribeRepaintKey?.();
    });
  }

  /** for INFINITE_COLUMN_CELL_CHILDREN */
  requestChildren(): Signal<Renderable> {
    if (!this.childrenRequested) {
      this.childrenRequested = true;
      this.updateChildren();
    }
    return this.children.asReadonly();
  }

  private updateChildren() {
    const view = this.view;
    this.children.set(
      view.hidden
        ? null
        : [renderDiv(view.contentClassName, view.children), view.editor],
    );
  }

  ngAfterViewChecked() {
    // a template editor: focus it once its view exists
    const session = this.editorSession;
    if (session?.focusPending) {
      focusTemplateEditor(
        session,
        this.element,
        InfiniteTableCellContentClassName,
      );
    }
  }

  private stage(name: string): RenderStage<any> {
    let stage = this.stages.get(name);
    if (!stage) {
      stage = createRenderStage(INFINITE_COLUMN_CELL, this.injector);
      this.stages.set(name, stage);
    }
    return stage;
  }

  private hook(name: string, render: Function, param: any): Renderable {
    const result = render(param);
    if (result == null) {
      return result;
    }
    return bindRenderable(result, param, this.stage(name), cellValue);
  }

  private subscribe(props: InfiniteTableColumnCellProps) {
    const { rowInfoStore, rowIndex, repaintCellsKey, column } = props;
    const current = this.subscribedFor;

    if (current.rowInfoStore !== rowInfoStore || current.rowIndex !== rowIndex) {
      this.unsubscribeRowInfo?.();
      this.rowInfo = rowInfoStore.getRowInfoAtIndex(rowIndex);
      // per-row updates (eg mutations) re-render just this cell (React:
      // useSyncExternalStore on the rowInfoStore)
      this.unsubscribeRowInfo = rowInfoStore.subscribeToRowIndex(rowIndex, () => {
        this.rowInfo = rowInfoStore.getRowInfoAtIndex(rowIndex);
        this.cdr.markForCheck();
      });
    }

    if (
      current.repaintCellsKey !== repaintCellsKey ||
      current.column !== column ||
      current.rowIndex !== rowIndex ||
      current.rowInfoStore !== rowInfoStore
    ) {
      this.unsubscribeRepaintKey?.();
      this.unsubscribeRepaintKey = null;
      // a function repaintCellsKey is re-evaluated after every data change:
      // a new key re-renders this cell (React: useRepaintCellsKey)
      if (isRepaintCellsKeyFn(repaintCellsKey)) {
        this.unsubscribeRepaintKey = subscribeToRepaintCellsKey(
          repaintCellsKey,
          {
            column,
            rowIndex,
            rowInfoStore,
            getDataSourceState: props.renderingContext.getDataSourceState,
          },
          () => {
            this.repaintTick++;
            this.cdr.markForCheck();
          },
        );
      }
    }

    this.subscribedFor = { rowInfoStore, rowIndex, repaintCellsKey, column };
  }

  ngDoCheck() {
    const props = untracked(this.props);
    if (!props) {
      return;
    }
    this.subscribe(props);

    const built = this.builtFor;
    if (
      // shallow, like React.memo and Vue's props check: the root creates new
      // props objects for every render range, the cells that get the same
      // values don't render again
      (built.props === props ||
        (!!built.props && shallowEqualObjects(built.props, props))) &&
      built.rowInfo === this.rowInfo &&
      built.repaintTick === this.repaintTick
    ) {
      return;
    }
    this.builtFor = {
      props,
      rowInfo: this.rowInfo,
      repaintTick: this.repaintTick,
    };
    this.view = this.buildView(props, this.rowInfo);
    if (this.view.hidden) {
      this.editorSession = null;
    }
    if (this.childrenRequested) {
      this.updateChildren();
    }
    this.cdr.markForCheck();
  }

  /**
   * The editor while the cell is in edit mode: one session per edit, kept
   * while the editor stays open, so the editor is not recreated by the cell
   * re-renders that happen meanwhile.
   */
  private renderEditor(
    props: InfiniteTableColumnCellProps,
    renderParam: InfiniteTableColumnCellContextType<any>,
    inEdit: boolean,
  ): Renderable {
    if (!inEdit || !props.renderEditor) {
      this.editorSession = null;
      return null;
    }
    const { getState } = props.renderingContext;
    const editingCell = getState().editingCell;
    const key = `${renderParam.rowInfo.id}:${renderParam.column.id}`;

    let session = this.editorSession;
    if (
      !session ||
      session.key !== key ||
      // a new edit started while the previous one was still visible
      (editingCell?.active && !session.active)
    ) {
      session = createColumnEditorSession({
        key,
        renderParam,
        getState,
        parentInjector: this.injector,
      });
      this.editorSession = session;
    } else {
      session.update(editingCell);
    }
    return props.renderEditor(renderParam, session);
  }

  private buildView(
    props: InfiniteTableColumnCellProps,
    rowInfo: InfiniteTableRowInfo<any> | undefined,
  ): CellView {
    const {
      column,
      rowIndex,
      rowHeight,
      hidden,
      rowDetailState,
      renderingContext,
      rowIndexInHorizontalLayoutPage,
      horizontalLayoutPageIndex,
    } = props;

    if (!column || !rowInfo) {
      return HIDDEN_VIEW;
    }

    const { getState, getDataSourceState } = renderingContext;
    const { activeRowIndex, keyboardNavigation, columnReorderInPageIndex } =
      getState();
    const rowActive =
      rowIndex === activeRowIndex && keyboardNavigation === 'row';
    const rowDisabled = rowInfo.rowDisabled;
    const { rowSelected } = rowInfo;

    const visibleColumnIds = props
      .getComputedVisibleColumns()
      .map((x: any) => x.id);

    const {
      stylingParam,
      renderParams,
      formattedValueContext,
      renderFunctions,
      groupByColumnReference,
      inEdit,
    } = getColumnRenderingParams({
      horizontalLayoutPageIndex,
      rowIndexInHorizontalLayoutPage,
      column,
      rowInfo,
      rowDetailState,
      columnsMap: props.columnsMap,
      visibleColumnIds,
      fieldsToColumn: props.fieldsToColumn,
      context: renderingContext,
    });

    const { align, verticalAlign } = renderParams;

    const renderParam = renderParams as InfiniteTableColumnCellContextType<any>;
    renderParam.domRef = (() => {}) as any;
    renderParam.htmlElementRef = this.htmlElementRef as any;

    this.renderParam.set(renderParam);

    const { selectionMode } = getDataSourceState();
    const cellSelected = renderParam.cellSelected;
    const cellSelection = getDataSourceState().cellSelection ?? null;

    // ------- render bag (mirrors the React renderChildren body) -------
    let children: Renderable = null;
    const staged = () => ({
      ...renderParam,
      renderBag: { ...renderParam.renderBag },
    });
    const bag = renderParam.renderBag as Record<string, any>;

    if (!hidden && !inEdit) {
      if (renderFunctions.renderGroupIcon) {
        bag.groupIcon = this.hook(
          'groupIcon',
          renderFunctions.renderGroupIcon as Function,
          staged(),
        );
      }

      if (
        renderFunctions.renderSelectionCheckBox &&
        selectionMode == 'multi-row'
      ) {
        // the default checkbox is in the render bag also when
        // column.renderSelectionCheckBox is a function, so people can
        // enhance it
        bag.selectionCheckBox = this.hook(
          'defaultSelectionCheckBox',
          defaultRenderSelectionCheckBox,
          renderParam,
        );

        if (renderFunctions.renderSelectionCheckBox !== true) {
          bag.selectionCheckBox = this.hook(
            'selectionCheckBox',
            renderFunctions.renderSelectionCheckBox as Function,
            staged(),
          );
        }
      }

      if (rowInfo.isTreeNode) {
        const { isParentNode } = rowInfo;

        const renderForNodeOrLeaf = isParentNode
          ? renderFunctions.renderTreeIconForParentNode
          : renderFunctions.renderTreeIconForLeafNode;

        let fn: any =
          renderForNodeOrLeaf ||
          // for parents, fallback to the renderTreeIcon as well
          (typeof renderFunctions.renderTreeIcon === 'function'
            ? renderFunctions.renderTreeIcon
            : isParentNode && renderFunctions.renderTreeIcon === true
            ? defaultRenderTreeIcon
            : undefined);

        if (fn === true) {
          fn = defaultRenderTreeIcon;
        } else if (fn) {
          bag.treeIcon = this.hook(
            'defaultTreeIcon',
            defaultRenderTreeIcon,
            renderParam,
          );
        }

        if (fn) {
          bag.treeIcon = this.hook('treeIcon', fn as Function, staged());
        }
      }

      if (renderFunctions.renderRowDetailIcon) {
        bag.rowDetailsIcon = this.hook(
          'defaultRowDetailsIcon',
          defaultRenderRowDetailIcon,
          staged(),
        );
        if (typeof renderFunctions.renderRowDetailIcon === 'function') {
          bag.rowDetailsIcon = this.hook(
            'rowDetailsIcon',
            renderFunctions.renderRowDetailIcon as Function,
            staged(),
          );
        }
      }

      if (renderFunctions.renderValue) {
        bag.value = this.hook(
          'renderValue',
          renderFunctions.renderValue as Function,
          staged(),
        );
      }

      if (rowInfo.isGroupRow && renderFunctions.renderGroupValue) {
        bag.value = this.hook(
          'renderGroupValue',
          renderFunctions.renderGroupValue as Function,
          staged(),
        );
      }
      if (!rowInfo.isGroupRow && renderFunctions.renderLeafValue) {
        bag.value = this.hook(
          'renderLeafValue',
          renderFunctions.renderLeafValue as Function,
          staged(),
        );
      }

      let valueToRender = bag.value as any;

      // make date rendering work without any additional code
      if (valueToRender instanceof Date) {
        valueToRender = valueToRender.toLocaleDateString();
      }

      const all: Renderable[] = [
        align !== 'end' ? bag.treeIcon : null,
        align !== 'end' ? bag.groupIcon : null,
        align !== 'end' ? bag.rowDetailsIcon : null,
        align !== 'end' ? bag.selectionCheckBox : null,
        valueToRender,
        align === 'end' ? bag.selectionCheckBox : null,
        align === 'end' ? bag.rowDetailsIcon : null,
        align === 'end' ? bag.groupIcon : null,
        align === 'end' ? bag.treeIcon : null,
      ];

      children = column.render
        ? this.hook('render', column.render as Function, {
            ...renderParam,
            renderBag: { ...renderParam.renderBag, all },
          })
        : all;
    }

    // ------- styling (shared controller, same as React and Vue) -------
    const { style, className } = getColumnCellStyling({
      column,
      rowInfo,
      rowIndex,
      rowHeight,
      rowIndexInHorizontalLayoutPage,
      horizontalLayoutPageIndex,
      align,
      verticalAlign,
      stylingParam,
      formattedValueContext,
      groupByColumnReference,
      rowStyle: props.rowStyle as any,
      rowClassName: props.rowClassName as any,
      cellStyle: props.cellStyle as any,
      cellClassName: props.cellClassName as any,
      showZebraRows: props.showZebraRows,
      rowActive,
      rowDisabled,
      rowSelected,
      cellSelected,
      cellSelection,
      getData: props.getData,
      computedVisibleColumns: props.getComputedVisibleColumns(),
      computedColumnOrder: props.getComputedColumnOrder(),
      columnReorderInPageIndex,
    });

    // ------- DOM (mirrors InfiniteTableCell for body cells) -------
    const colIndex = column.computedVisibleIndex;
    const cssEllipsis = column.cssEllipsis ?? true;

    const finalStyle: Record<string, any> = {
      width: `var(${columnWidthAtIndex}-${colIndex})`,
      transition: `transform var(${columnReorderEffectDurationAtIndex}-${colIndex}, 0s)`,
      ...(style as any),
      height:
        typeof style.height === 'number' ? `${style.height}px` : style.height,
    };

    // what the row mouse callbacks get (same as React and Vue)
    this.mouseEnterContext = { ...formattedValueContext, rowIndex };
    this.mouseLeaveContext = { ...formattedValueContext, rowIndex, rowInfo };

    return {
      hidden: false,
      className: join(className, InfiniteTableCellClassName, ColumnCellCls),
      style: finalStyle,
      columnId: column.id,
      rowId: `${rowInfo.id}`,
      zIndex: finalStyle.zIndex,
      contentClassName: join(
        `${InfiniteTableCellClassName}_content`,
        cssEllipsis ? cssEllipsisClassName : overflow.hidden,
      ),
      children,
      editor: this.renderEditor(props, renderParam, inEdit),
      renderParam,
    };
  }

  private mouseEnterContext: any = null;
  private mouseLeaveContext: any = null;

  private onClick(event: MouseEvent) {
    const props = untracked(this.props);
    if (!props?.column) {
      return;
    }
    const { renderingContext, column, rowIndex } = props;
    renderingContext.getState().cellClick({
      rowIndex,
      colIndex: column.computedVisibleIndex,
      event: event as any,
    });
  }

  private onMouseDown(event: MouseEvent) {
    const props = untracked(this.props);
    if (!props?.column) {
      return;
    }
    const { renderingContext, column, rowIndex } = props;
    const { getState, actions } = renderingContext;
    const colIndex = column.computedVisibleIndex;

    getState().cellMouseDown({
      rowIndex,
      colIndex,
      event: event as any,
    });

    const { keyboardNavigation } = getState();
    const rowDisabled = this.rowInfo?.rowDisabled ?? false;

    if (keyboardNavigation === 'row') {
      if (!rowDisabled) {
        actions.activeRowIndex = rowIndex;
      }
      return;
    }
    if (keyboardNavigation === 'cell') {
      actions.activeCellIndex = [rowIndex, colIndex];
    }
  }

  // the renderer's handlers (row hover class names) + the user callbacks
  private onMouseEnter(event: MouseEvent) {
    const props = untracked(this.props);
    if (!props) {
      return;
    }
    const { onRowMouseEnter } = props.renderingContext.getState();
    if (onRowMouseEnter && this.mouseEnterContext) {
      onRowMouseEnter(this.mouseEnterContext, event as any);
    }
    props.onMouseEnter?.(event as any);
  }

  private onMouseLeave(event: MouseEvent) {
    const props = untracked(this.props);
    if (!props) {
      return;
    }
    const { onRowMouseLeave } = props.renderingContext.getState();
    if (onRowMouseLeave && this.mouseLeaveContext) {
      onRowMouseLeave(this.mouseLeaveContext, event as any);
    }
    props.onMouseLeave?.(event as any);
  }
}

/**
 * The default body cell: the host is the cell element
 * (`div.InfiniteColumnCell`), with the content div inside and the editor
 * after it.
 */
@Component({
  selector: 'div[infiniteColumnCell]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [InfiniteRender],
  hostDirectives: [InfiniteColumnCellHost],
  template: `@if (!cell.view.hidden) {<div [class]="cell.view.contentClassName"><ng-container [infiniteRender]="cell.view.children" /></div>@if (cell.view.editor) {<ng-container [infiniteRender]="cell.view.editor" />}}`,
})
export class InfiniteTableColumnCell {
  protected readonly cell = inject(InfiniteColumnCellHost);
}
