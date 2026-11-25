import {
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  DestroyRef,
  Directive,
  DoCheck,
  ElementRef,
  EnvironmentInjector,
  InjectionToken,
  Injector,
  Signal,
  TemplateRef,
  Type,
  ViewEncapsulation,
  WritableSignal,
  createComponent,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { styleWithUnits } from '../../../../utils/styleWithUnits';
import type { DataSourcePropSelectionMode } from '../../../DataSource/types';
import type { DataSourcePropFilterTypes } from '../../../DataSource/types';
import { injectPooledProps } from '../../../HeadlessTable/AngularPooledViews.angular';
import {
  InfiniteRender,
  isComponentRenderable,
  renderComponent,
  renderTemplate,
} from '../../../RawList/InfiniteRenderForAngular.angular';
import {
  RenderStage,
  bindRenderable,
  createRenderStage,
} from '../../../RawList/bindRenderable.angular';
import { renderDiv } from '../../../RawList/InfiniteDivForAngular.angular';
import type { Renderable } from '../../../types/FrameworkTypes.angular';
import { getColumnApiForColumn } from '../../api/getColumnApi';
import { useCellClassName } from '../../hooks/useCellClassName';
import {
  TopLeft,
  createColumnPointerDownHandler,
} from '../../hooks/useColumnPointerEventsForAngular.angular';
import { InternalVars } from '../../internalVars.css';
import { ThemeVars } from '../../vars.css';
import { injectInfiniteTable } from '../../InfiniteTableContextForAngular.angular';

import type {
  InfiniteTableColumnHeaderParam,
  InfiniteTableComputedColumn,
  InfiniteTableHeaderCellContextType,
} from '../../types/InfiniteTableColumn';
import type {
  InfiniteTableColumnApi,
  InfiniteTablePropComponents,
  InfiniteTablePropHeaderOptions,
} from '../../types/InfiniteTableProps';
import {
  cssEllipsisClassName,
  cursor,
  flex,
  justifyContent,
  overflow,
  userSelect,
} from '../../utilities.css';
import { ColumnCellCls, SelectionCheckboxCls } from '../cell.css';
import { InfiniteCheckBox } from '../CheckBoxForAngular.angular';
import { FilterIcon } from '../icons/FilterIcon/FilterIconForAngular.angular';
import { HiddenIcon } from '../icons/IconForAngular.angular';
import { MenuIcon } from '../icons/MenuIconForAngular.angular';
import { SortIcon } from '../icons/SortIcon/SortIconForAngular.angular';
import {
  InfiniteTableCellClassName,
  InfiniteTableCellContentClassName,
} from '../InfiniteTableRow/InfiniteTableCellClassNames';

import {
  CellCls,
  HeaderCellRecipe,
  HeaderSortIconCls,
  HeaderCellContentRecipe,
  HeaderCellContentVariantsType,
  HeaderCellProxy,
  HeaderCellProxyRemoveIconRecipe,
  HeaderSortIconRecipe,
} from './header.css';
import { InfiniteTableHeaderCellClassName } from './headerClassName';
import { computeColumnResizeForDiff } from './ResizeHandle/columnResizeShared';
import {
  ResizeFnParam,
  ResizeHandle,
} from './ResizeHandle/ResizeHandleForAngular.angular';

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const columnReorderEffectDurationAtIndex = stripVar(
  InternalVars.columnReorderEffectDurationAtIndex,
);
const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);
const columnVisibilityAtIndex = stripVar(InternalVars.columnVisibilityAtIndex);

/**
 * The context of the header cell being rendered: what `injectHeaderCell()`
 * returns, and the context of header templates (`$implicit` is the column).
 */
// explicit type: the inferred one is the expanded alias, which the d.ts
// emit gets wrong (it keeps the alias' type parameter)
export const INFINITE_HEADER_CELL: InjectionToken<
  Signal<InfiniteTableHeaderCellContextType<any>>
> = new InjectionToken<Signal<InfiniteTableHeaderCellContextType<any>>>(
  'INFINITE_HEADER_CELL',
);

/**
 * In a component (or template) rendered in a column header - a `header`
 * renderer, an icon hook, a `components.HeaderCell` override: the header
 * cell's param (column, columnApi, renderBag, sort and filter info, ...), as
 * a signal.
 */
export function injectHeaderCell<T = any>(): Signal<
  InfiniteTableHeaderCellContextType<T>
> {
  return inject(INFINITE_HEADER_CELL) as Signal<
    InfiniteTableHeaderCellContextType<T>
  >;
}

/**
 * The default content of the header cell being rendered (the content div,
 * the filter row, the resize handle), as a Renderable: what a
 * `components.HeaderCell` override renders where React passes `children`
 * and Vue the default slot:
 *
 * ```ts
 * @Component({
 *   selector: 'div[myHeaderCell]',
 *   imports: [InfiniteRender],
 *   host: { '[style.background]': "'red'" },
 *   template: `<ng-container [infiniteRender]="children()" />!`,
 * })
 * class MyHeaderCell {
 *   protected readonly children = injectHeaderCellChildren();
 * }
 * ```
 */
export const INFINITE_HEADER_CELL_CHILDREN = new InjectionToken<
  Signal<Renderable>
>('INFINITE_HEADER_CELL_CHILDREN');

export function injectHeaderCellChildren(): Signal<Renderable> {
  return inject(INFINITE_HEADER_CELL_CHILDREN);
}

/**
 * The props of a header cell, from the header's renderCell.
 *
 * The table state the cell depends on is part of the props (React and Vue
 * select it per cell): a change re-renders the header cells through the
 * pool, without a change detection of the rest of the application.
 */
export type InfiniteTableHeaderCellProps<T = any> = {
  column: InfiniteTableComputedColumn<T>;
  columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  width: number;
  height: number;
  headerOptions: InfiniteTablePropHeaderOptions;
  horizontalLayoutPageIndex: number | null;
  allRowsSelected: boolean;
  someRowsSelected: boolean;
  selectionMode: DataSourcePropSelectionMode;
  columnMenuVisibleForColumnId: string | null | undefined;
  columnReorderDragColumnId: string | false | null | undefined;
  columnReorderInPageIndex: number | null | undefined;
  showColumnFilters: boolean;
  columnHeaderHeight: number;
  components: InfiniteTablePropComponents | undefined;
  filterTypes: DataSourcePropFilterTypes<T>;
};

/**
 * Angular port of defaultRenderSelectionCheckBox from
 * InfiniteTableHeaderCell.tsx - the header (select all) checkbox.
 */
export const defaultRenderSelectionCheckBox = (params: any): Renderable => {
  const { allRowsSelected, someRowsSelected, api, dataSourceApi } = params;

  const selected = allRowsSelected ? true : someRowsSelected ? null : false;
  const { components, isTree } = api.getState();
  const CheckBoxCmp = components?.CheckBox || InfiniteCheckBox;

  return overrideRenderable(CheckBoxCmp, {
    domProps: {
      class: SelectionCheckboxCls,
    },
    onChange: (selected: boolean | null) => {
      if (isTree) {
        if (selected) {
          dataSourceApi.treeApi.selectAll();
        } else {
          dataSourceApi.treeApi.deselectAll();
        }
        return;
      }

      if (selected) {
        api.rowSelectionApi.selectAll();
      } else {
        api.rowSelectionApi.deselectAll();
      }
    },
    checked: selected,
  });
};

/**
 * A `components.*` override (a component class or a template) rendered with
 * the given props: inputs of a component, the context of a template
 * (`$implicit` is the props object).
 */
function overrideRenderable(
  cmp: Type<unknown> | TemplateRef<any>,
  props: Record<string, unknown>,
): Renderable {
  if (cmp instanceof TemplateRef) {
    return renderTemplate(cmp, { $implicit: props, ...props });
  }
  return renderComponent(cmp, { inputs: props });
}

/**
 * FILTERS SLICE HOOK POINT - the column filter of a header cell (React:
 * InfiniteTableColumnHeaderFilter, Vue: InfiniteTableColumnHeaderFilterForVue).
 *
 * Called for every header cell render. What it returns is
 * `renderBag.filterEditor` and - when `showColumnFilters` is true - is
 * rendered after the content div, before the resize handle (the content div
 * is then half of the cell's height). Until the filters slice lands it
 * renders nothing.
 *
 * What the filters slice has to port here (see the Vue header cell): the
 * filter type / operator lookup (`filterTypes[column.computedFilterType]`,
 * the operator from `column.computedFilterValue` or the type's
 * `defaultOperator`), the FilterEditor / FilterOperatorSwitch component
 * lookup (operator, filter type, column, default), the debounced
 * `api.setColumnFilter(column.id, value)` (recreated when the column id or
 * the DataSource `filterDelay` changes - the cell is pooled, so key it on the
 * column id), and `InfiniteTableColumnHeaderFilterEmpty` for columns that
 * are not filterable.
 */
export type HeaderFilterHookParam = {
  column: InfiniteTableComputedColumn<any>;
  horizontalLayoutPageIndex: number | null;
  filterTypes: DataSourcePropFilterTypes<any>;
  columnHeaderHeight: number;
  showColumnFilters: boolean;
  headerParam: InfiniteTableHeaderCellContextType<any>;
};
export function renderColumnHeaderFilter(
  _param: HeaderFilterHookParam,
): Renderable {
  return null;
}

const SPACER = renderDiv(flex['1'], null);

const HEADER_CELL_PROXY_CLASS_NAME = `${InfiniteTableHeaderCellClassName}Proxy ${HeaderCellProxy}`;

/**
 * The content div of a header cell (the host is the div): what the default
 * header cell and `injectHeaderCellChildren()` render.
 */
@Component({
  selector: 'div[infiniteHeaderCellContent]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [InfiniteRender],
  host: {
    '[class]': 'className()',
    '[style]': 'style()',
  },
  template: `<ng-container [infiniteRender]="children()" />`,
})
export class InfiniteHeaderCellContent {
  readonly className = input<string>('');
  readonly style = input<Record<string, any> | null>(null);
  readonly children = input<Renderable>();
}

/**
 * The column drag proxy, rendered in the grid's portal while a header is
 * dragged to reorder the columns (React: draggingProxy in the header cell).
 */
@Component({
  selector: 'div[infiniteHeaderCellProxy]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [InfiniteRender, HiddenIcon],
  host: {
    '[class]': 'className',
  },
  template: `<div [class]="removeIconClassName()">
      <svg infiniteHiddenIcon [size]="16"></svg>
    </div>
    <ng-container [infiniteRender]="header()" />`,
})
export class InfiniteHeaderCellProxy {
  protected readonly className = HEADER_CELL_PROXY_CLASS_NAME;
  readonly outside = signal(false);
  readonly header = signal<Renderable>(null);

  protected readonly removeIconClassName = () =>
    HeaderCellProxyRemoveIconRecipe({ visible: this.outside() });
}

type HeaderCellView = {
  hidden: boolean;
  className: string;
  style: Record<string, any> | null;
  dataField: string | null;
  columnId: string | null;
  headerAlign: string | null;
  dataName: string | null;
  sort: string | null;
  sortIndex: string | null;
  zIndex: string | null;
  defaultChildren: Renderable;
};

const HIDDEN_VIEW: HeaderCellView = {
  hidden: true,
  className: '',
  style: { display: 'none' },
  dataField: null,
  columnId: null,
  headerAlign: null,
  dataName: null,
  sort: null,
  sortIndex: null,
  zIndex: null,
  defaultChildren: null,
};

const headerImplicit = (param: InfiniteTableColumnHeaderParam<any>) =>
  param.column;

/**
 * Everything a header cell does, as a host directive: the default header
 * cell (InfiniteTableHeaderCell) uses it, and so does a
 * `components.HeaderCell` override (the grid adds it to the override, whose
 * host element is then the header cell).
 *
 * The view is built in ngDoCheck - like a React render - when the props
 * changed: the render bag pipeline (header, sort / filter / menu icons,
 * selection checkbox, renderHeader), every hook result bound to its stage
 * (see bindRenderable), class names, style and data attributes. Pointer
 * down (sorting, column reordering) is a native listener.
 */
@Directive({
  selector: '[infiniteHeaderCellHost]',
  host: {
    '[class]': 'view.className',
    '[style]': 'view.style',
    '[attr.data-field]': 'view.dataField',
    '[attr.data-column-id]': 'view.columnId',
    '[attr.data-header-align]': 'view.headerAlign',
    '[attr.data-name]': 'view.dataName',
    '[attr.data-sort]': 'view.sort',
    '[attr.data-sort-index]': 'view.sortIndex',
    // used by the headless renderer - look for #updatezindex
    '[attr.data-z-index]': 'view.zIndex',
  },
  providers: [
    {
      provide: INFINITE_HEADER_CELL,
      useFactory: () => inject(InfiniteHeaderCellHost).renderParam,
    },
    {
      provide: INFINITE_HEADER_CELL_CHILDREN,
      useFactory: () => inject(InfiniteHeaderCellHost).defaultChildren,
    },
  ],
})
export class InfiniteHeaderCellHost implements DoCheck {
  private readonly props = injectPooledProps<InfiniteTableHeaderCellProps>();
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);
  private readonly table = injectInfiniteTable();
  private readonly element =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** the render param of the header cell, for injectHeaderCell() */
  readonly renderParam: WritableSignal<
    InfiniteTableHeaderCellContextType<any>
  > = signal<InfiniteTableHeaderCellContextType<any>>(null as any, {
    equal: () => false,
  });

  /** the default children, for injectHeaderCellChildren() */
  readonly defaultChildren = signal<Renderable>(null, { equal: () => false });

  view: HeaderCellView = HIDDEN_VIEW;

  private builtFor: InfiniteTableHeaderCellProps | null = null;

  private stages = new Map<string, RenderStage<any>>();

  private readonly htmlElementRef = { current: null as HTMLElement | null };

  private columnApi: InfiniteTableColumnApi<any> | null = null;

  // ---- the column drag proxy ----
  private proxyRef: ComponentRef<InfiniteHeaderCellProxy> | null = null;
  private proxyHeader: Renderable = null;

  // the menu icon's mouse down (stable, so the icon doesn't rebind it)
  private readonly menuIconDomProps = {
    onMouseDown: (event: MouseEvent) => {
      event.stopPropagation();
      this.columnApi?.toggleContextMenu(event.target!);
    },
  };

  constructor() {
    this.htmlElementRef.current = this.element;

    const { getState, getComputed, actions, api } = this.table;

    // mirrors useColumnPointerEvents: drag-to-reorder for draggable columns,
    // toggle-sorting for plain clicks
    const { onPointerDown } = createColumnPointerDownHandler<any>({
      getColumnId: () => untracked(this.props)?.column.id ?? '',
      context: { getState, getComputed, actions, api },
      domRef: this.htmlElementRef,
      getHorizontalLayoutPageIndex: () =>
        untracked(this.props)?.horizontalLayoutPageIndex ?? null,
      // same default as the React header state (allowColumnHideWhileDragging)
      allowColumnHideOnDrag: true,
      setProxyPosition: (position) => this.setProxyPosition(position),
      setDragColumnOutside: (outside) => this.setDragColumnOutside(outside),
      // not the cell's injector: the pooled view may be gone by then
      injector: this.environmentInjector,
    });

    const el = this.element;
    const onPointerDownListener = (event: PointerEvent) => {
      if (!untracked(this.props)?.column) {
        return;
      }
      onPointerDown(event);
    };
    el.addEventListener('pointerdown', onPointerDownListener);

    inject(DestroyRef).onDestroy(() => {
      el.removeEventListener('pointerdown', onPointerDownListener);
      this.destroyProxy();
    });
  }

  private stage(name: string): RenderStage<any> {
    let stage = this.stages.get(name);
    if (!stage) {
      stage = createRenderStage(INFINITE_HEADER_CELL, this.injector);
      this.stages.set(name, stage);
    }
    return stage;
  }

  private bind(name: string, content: unknown, param: any): Renderable {
    if (content == null) {
      return content as Renderable;
    }
    return bindRenderable(content, param, this.stage(name), headerImplicit);
  }

  private hook(name: string, render: Function, param: any): Renderable {
    return this.bind(name, render(param), param);
  }

  ngDoCheck() {
    const props = untracked(this.props);
    if (!props || this.builtFor === props) {
      return;
    }
    this.builtFor = props;
    this.view = this.buildView(props);
    this.cdr.markForCheck();
  }

  private buildView(props: InfiniteTableHeaderCellProps): HeaderCellView {
    const {
      column,
      columnsMap,
      horizontalLayoutPageIndex,
      headerOptions,
      allRowsSelected,
      someRowsSelected,
      selectionMode,
      showColumnFilters,
      columnHeaderHeight,
    } = props;

    if (!column) {
      return HIDDEN_VIEW;
    }

    const { api, actions, getState, getComputed, dataSourceContext } =
      this.table;
    const { getDataSourceState, dataSourceApi, dataSourceActions } =
      dataSourceContext;

    const columnApi = getColumnApiForColumn<any>(column, {
      actions,
      api,
      dataSourceActions,
      dataSourceApi,
      getComputed,
      getDataSourceState,
      getDataSourceMasterContext: () =>
        getDataSourceState().getDataSourceMasterContextRef?.current?.() ??
        undefined,
      getState,
    } as any)!;
    this.columnApi = columnApi;

    const sortInfo = column.computedSortInfo;
    const header = column.header;

    const computedSortable = columnApi.isSortable();

    const alwaysShow = headerOptions.alwaysReserveSpaceForSortIcon;

    const alignFnOrValue = column.headerAlign ?? column.align;
    const align =
      (typeof alignFnOrValue === 'function'
        ? alignFnOrValue({ isHeader: true, column })
        : alignFnOrValue) ?? 'start';

    const verticalAlign =
      (typeof column.verticalAlign === 'function'
        ? column.verticalAlign({ isHeader: true, column })
        : column.verticalAlign) ?? 'center';

    const sortIcon: Renderable =
      computedSortable && (column.computedSorted || alwaysShow)
        ? renderComponent(SortIcon, {
            inputs: {
              index: column.computedMultiSort
                ? column.computedSortIndex + 1
                : undefined,
              style: {
                marginInlineStart: ThemeVars.spacing[2],
                marginInlineEnd: ThemeVars.spacing[2],
              },
              className: `${InfiniteTableHeaderCellClassName}__sort-icon ${HeaderSortIconCls} ${HeaderSortIconRecipe(
                {
                  align,
                },
              )}`,
              direction: column.computedSorted
                ? column.computedSortedAsc
                  ? 1
                  : -1
                : 0,
            },
          })
        : null;

    const filtered = column.computedFilterable && column.computedFiltered;
    const filterIcon: Renderable = filtered
      ? renderComponent(FilterIcon)
      : null;

    const headerCSSEllipsis =
      column.headerCssEllipsis ?? column.cssEllipsis ?? true;

    const dragging = props.columnReorderDragColumnId === column.id;
    const insideDisabledDraggingPage =
      props.columnReorderInPageIndex != null
        ? horizontalLayoutPageIndex !== props.columnReorderInPageIndex
        : false;

    const menuIconProps: Record<string, any> = {
      reserveSpaceWhenHidden: align === 'center',
      menuVisible: props.columnMenuVisibleForColumnId === column.id,

      style:
        align === 'end'
          ? {
              marginInlineStart: `calc(${ThemeVars.components.HeaderCell.resizeHandleActiveAreaWidth} / 2)`,
              marginInlineEnd: ThemeVars.spacing[2],
            }
          : {
              marginInlineEnd: `calc(${ThemeVars.components.HeaderCell.resizeHandleActiveAreaWidth} / 2)`,
              marginInlineStart: ThemeVars.spacing[2],
            },
      domProps: this.menuIconDomProps,
    };
    const MenuIconCmp =
      (column.components?.MenuIcon as any) ||
      (props.components?.MenuIcon as any) ||
      MenuIcon;
    const menuIcon = overrideRenderable(MenuIconCmp, {
      ...menuIconProps,
      children: undefined,
    });

    const initialRenderParam = {
      horizontalLayoutPageIndex,
      dragging,
      domRef: (() => {}) as any,
      htmlElementRef: this.htmlElementRef as any,
      renderLocation: 'column-header',
      column,
      columnsMap,
      columnSortInfo: sortInfo,
      columnFilterValue: column.computedFilterValue,
      filtered: column.computedFiltered,
      someRowsSelected,
      allRowsSelected,
      selectionMode,
      api,
      dataSourceApi,
      columnApi,
      renderBag: {
        sortIcon,
        filterIcon,
        menuIcon,
        menuIconProps: menuIconProps as any,
        selectionCheckBox: null,
        header: null as Renderable,
      },
    } as InfiniteTableColumnHeaderParam<any>;

    // a header that is not a function (text, a template, a descriptor) is
    // rendered with the header param too
    initialRenderParam.renderBag.header =
      column.header && typeof column.header !== 'function'
        ? this.bind('headerValue', column.header, initialRenderParam)
        : (column.name as Renderable);

    const renderParam =
      initialRenderParam as InfiniteTableHeaderCellContextType<any>;

    // FILTERS SLICE HOOK POINT - see renderColumnHeaderFilter
    const columnFilterEditor = renderColumnHeaderFilter({
      column,
      horizontalLayoutPageIndex,
      filterTypes: props.filterTypes,
      columnHeaderHeight,
      showColumnFilters,
      headerParam: renderParam,
    });
    renderParam.renderBag.filterEditor = columnFilterEditor;
    this.renderParam.set(renderParam);

    // ------- header render pipeline (mirrors renderChildren) -------
    const pipelineParam = {
      ...initialRenderParam,
      renderBag: { ...initialRenderParam.renderBag },
    };
    const bag = pipelineParam.renderBag as Record<string, any>;
    const staged = () => ({
      ...pipelineParam,
      renderBag: { ...pipelineParam.renderBag },
    });

    if (column.renderSortIcon) {
      bag.sortIcon = this.hook(
        'sortIcon',
        column.renderSortIcon as Function,
        staged(),
      );
    }

    if (column.renderFilterIcon) {
      bag.filterIcon = this.hook(
        'filterIcon',
        column.renderFilterIcon as Function,
        staged(),
      );
    }

    if (typeof column.renderMenuIcon === 'function') {
      const result = this.hook(
        'menuIcon',
        column.renderMenuIcon as Function,
        staged(),
      );

      bag.menuIcon =
        result != null && result !== false
          ? // if it's already a MenuIcon, use as is - otherwise wrap it
            isComponentRenderable(result) &&
            (result.component === MenuIconCmp || result.component === MenuIcon)
            ? result
            : overrideRenderable(MenuIconCmp, {
                ...menuIconProps,
                children: result,
              })
          : null;
    }

    if (column.renderSelectionCheckBox && selectionMode === 'multi-row') {
      // the default checkbox is in the render bag also when
      // column.renderSelectionCheckBox is a function, so people can enhance it
      bag.selectionCheckBox = this.hook(
        'defaultSelectionCheckBox',
        defaultRenderSelectionCheckBox,
        staged(),
      );

      const renderHeaderSelectionCheckBox =
        column.renderHeaderSelectionCheckBox ?? column.renderSelectionCheckBox;
      if (
        renderHeaderSelectionCheckBox &&
        renderHeaderSelectionCheckBox !== true
      ) {
        bag.selectionCheckBox = this.hook(
          'selectionCheckBox',
          renderHeaderSelectionCheckBox as Function,
          staged(),
        );
      }
    }

    if (header instanceof Function) {
      bag.header = this.hook('header', header as Function, staged());
    }

    const headerContent: Renderable = headerCSSEllipsis
      ? renderDiv(cssEllipsisClassName, bag.header)
      : bag.header;

    const theMenuIcon =
      column.renderMenuIcon === false ? null : (bag.menuIcon as Renderable);

    const all: Renderable[] = [
      // for align center, we push content to middle, except the menu icon
      // - this spacer pushes from start
      align === 'center' ? SPACER : null,
      bag.selectionCheckBox,

      headerContent,

      bag.sortIcon,
      bag.filterIcon,
      // for align center, this spacer pushes from end
      align === 'center' ? SPACER : null,

      // for align non center, we push the menu icon at the end
      align !== 'center' ? SPACER : null,
      theMenuIcon,
    ];

    const children: Renderable = column.renderHeader
      ? this.hook('renderHeader', column.renderHeader as Function, {
          ...pipelineParam,
          renderBag: { ...pipelineParam.renderBag, all },
        })
      : all;

    // what the drag proxy shows
    this.proxyHeader = bag.header;
    if (this.proxyRef) {
      this.proxyRef.instance.header.set(bag.header);
      this.proxyRef.changeDetectorRef.detectChanges();
    }

    // ------- style + class names (same contract as React and Vue) -------
    let style: Record<string, any> = {
      height: `${props.height}px`,
    };

    if (column.headerStyle) {
      style =
        typeof column.headerStyle === 'function'
          ? {
              ...style,
              ...styleWithUnits(
                (column.headerStyle(renderParam as any) || {}) as any,
              ),
            }
          : { ...style, ...styleWithUnits(column.headerStyle as any) };
    }

    const headerClassName =
      typeof column.headerClassName === 'function'
        ? column.headerClassName(renderParam as any)
        : column.headerClassName;

    const colIndex = column.computedVisibleIndex;
    const zIndex = `var(${columnZIndexAtIndex}-${colIndex})`;
    style.zIndex = zIndex;
    style.visibility = `var(${columnVisibilityAtIndex}-${colIndex}, visible)`;
    style.width = `var(${columnWidthAtIndex}-${colIndex})`;
    style.transition = `transform var(${columnReorderEffectDurationAtIndex}-${colIndex}, 0s)`;

    const contentRecipeVariants: HeaderCellContentVariantsType = {
      filtered: column.computedFiltered,
      verticalAlign,
      align,
    };

    const className = join(
      InfiniteTableHeaderCellClassName,
      userSelect.none,
      computedSortable ? cursor.pointer : '',
      headerClassName,
      useCellClassName(
        column,
        [InfiniteTableHeaderCellClassName, InfiniteTableCellClassName],
        HeaderCellRecipe,
        {
          dragging,
          insideDisabledDraggingPage,
          align,
          verticalAlign,
          rowSelected: false,
          cellSelected: false,
          rowDisabled: false,
          zebra: false,
          rowActive: false,
          firstRow: true,
          firstRowInHorizontalLayoutPage: true,
          treeNode: false,
          groupCell: false,
          groupRow: false,
          rowExpanded: false,
        },
      ),
      CellCls,
      InfiniteTableCellClassName,
      ColumnCellCls,
    );

    const contentNode = renderComponent(InfiniteHeaderCellContent, {
      inputs: {
        className: join(
          InfiniteTableCellContentClassName,
          headerCSSEllipsis ? cssEllipsisClassName : overflow.hidden,
          HeaderCellContentRecipe(contentRecipeVariants),
          justifyContent[align],
        ),
        style: showColumnFilters ? { height: `${props.height / 2}px` } : null,
        children,
      },
    });

    // ------- resize handle (mirrors useColumnResizeHandle) -------
    const computeResize = (resizeParam: ResizeFnParam) =>
      computeColumnResizeForDiff({
        context: { getState, getComputed },
        column,
        diff: resizeParam.diff,
        shareSpaceOnResize: resizeParam.shareSpaceOnResize,
      });

    const resizeHandle: Renderable = column.computedResizable
      ? renderComponent(ResizeHandle, {
          inputs: {
            horizontalLayoutPageIndex,
            columns: getComputed().computedVisibleColumns,
            columnIndex: column.computedVisibleIndex,
            computeResize,
            onResize: (resizeParam: ResizeFnParam) => {
              const { columnSizing, reservedWidth } =
                computeResize(resizeParam);

              if (!resizeParam.shareSpaceOnResize) {
                actions.viewportReservedWidth = reservedWidth;
              }
              actions.columnSizing = columnSizing;
            },
          },
        })
      : null;

    // mirrors afterChildren in the React header cell
    const defaultChildren: Renderable = [
      contentNode,
      showColumnFilters ? columnFilterEditor : null,
      resizeHandle,
    ];
    this.defaultChildren.set(defaultChildren);

    return {
      hidden: false,
      className,
      style,
      dataField: `${column.field || ''}`,
      columnId: column.id,
      headerAlign: align,
      dataName: 'HeaderCell',
      sort: column.computedSortedAsc
        ? 'asc'
        : column.computedSortedDesc
        ? 'desc'
        : 'none',
      sortIndex: `${column.computedSortIndex ?? -1}`,
      zIndex,
      defaultChildren,
    };
  }

  // ------- drag proxy (mirrors draggingProxy in the React header cell) -------
  private setProxyPosition(position: TopLeft | null) {
    if (!position) {
      this.destroyProxy();
      return;
    }
    const props = untracked(this.props);
    const { columnReorderDragColumnId, portalDOMRef } = this.table.getState();
    const portalNode = portalDOMRef.current;
    if (
      !props ||
      columnReorderDragColumnId !== props.column.id ||
      !portalNode
    ) {
      return;
    }

    if (!this.proxyRef) {
      const ref = createComponent(InfiniteHeaderCellProxy, {
        environmentInjector: this.environmentInjector,
        elementInjector: this.injector,
      });
      ref.instance.header.set(this.proxyHeader);
      this.appRef.attachView(ref.hostView);
      ref.changeDetectorRef.detectChanges();
      portalNode.appendChild(ref.location.nativeElement);
      this.proxyRef = ref;
    }

    const proxyElement = this.proxyRef.location.nativeElement as HTMLElement;
    const proxyStyle = proxyElement.style;
    proxyStyle.height = `${props.height}px`;
    proxyStyle.width = `${props.width}px`;
    proxyStyle.left = `${position.left ?? 0}px`;
    proxyStyle.top = `${position.top ?? 0}px`;
  }

  private setDragColumnOutside(outside: boolean) {
    const ref = this.proxyRef;
    if (ref && untracked(ref.instance.outside) !== outside) {
      ref.instance.outside.set(outside);
      ref.changeDetectorRef.detectChanges();
    }
  }

  private destroyProxy() {
    const ref = this.proxyRef;
    this.proxyRef = null;
    if (ref) {
      const element = ref.location.nativeElement as HTMLElement;
      ref.destroy();
      element.remove();
    }
  }
}

/**
 * The default header cell: the host is the header cell element
 * (`div.InfiniteHeaderCell`), with the content div, the filter and the
 * resize handle inside.
 */
@Component({
  selector: 'div[infiniteHeaderCell]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [InfiniteRender],
  hostDirectives: [InfiniteHeaderCellHost],
  template: `@if (!cell.view.hidden) {<ng-container
      [infiniteRender]="cell.view.defaultChildren"
    />}`,
})
export class InfiniteTableHeaderCell {
  protected readonly cell = inject(InfiniteHeaderCellHost);
}
