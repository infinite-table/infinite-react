/**
 * Angular sibling of InfiniteTableColumnHeaderFilter.tsx (and of the Vue
 * InfiniteTableColumnHeaderFilterForVue.vue.ts): the filter row a header
 * cell renders below its content when `showColumnFilters` is on, the
 * operator switch, and `injectColumnFilterEditor()` for (custom) filter
 * editors.
 *
 * How a header cell uses it (what the React and Vue header cells do):
 *
 * ```ts
 * // once per header cell
 * const getOnFilterChange = createColumnFilterChangeHandler(tableContext);
 * // when rendering
 * renderBag.filterEditor = getColumnHeaderFilter({
 *   column, columnApi, filterTypes: dataSourceState.filterTypes,
 *   columnHeaderHeight, horizontalLayoutPageIndex,
 *   onChange: getOnFilterChange(column.id),
 * });
 * ```
 *
 * and renders `renderBag.filterEditor` (with `[infiniteRender]`) when
 * `showColumnFilters` is true.
 */
import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  Signal,
  TemplateRef,
  ViewEncapsulation,
  WritableSignal,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';

import { join } from '../../../../utils/join';
import { debounce } from '../../../utils/debounce';
import type {
  DataSourceFilterOperator,
  DataSourceFilterValueItem,
  DataSourcePropFilterTypes,
  DataSourceFilterType,
} from '../../../DataSource/types';
import type { Renderable } from '../../../types/FrameworkTypes.angular';
import {
  InfiniteRender,
  renderComponent,
} from '../../../RawList/InfiniteRenderForAngular.angular';
import { injectInfiniteTable } from '../../InfiniteTableContextForAngular.angular';
import type { InfiniteTableContextValueForAngular } from '../../InfiniteTableContextForAngular.angular';
import type {
  InfiniteTableApi,
  InfiniteTableColumnApi,
  InfiniteTableComputedColumn,
} from '../../types';
import { height } from '../../utilities.css';
import { FilterIcon } from '../icons/FilterIcon/FilterIconForAngular.angular';
import { StringFilterEditor } from '../FilterEditorsForAngular.angular';

import { getColumnLabel } from './getColumnLabel';
import {
  HeaderFilterRecipe,
  HeaderFilterEditorCls,
  HeaderFilterOperatorCls,
  HeaderFilterOperatorIconRecipe,
} from './header.css';
import {
  InfiniteTableColumnHeaderFilterClassName,
  InfiniteTableColumnHeaderFilterOperatorClassName,
  InfiniteTableColumnHeaderFilterInputClassName,
} from './headerFilterClassNames';

/**
 * What can be given as a filter editor or operator switch: a component
 * class, a template, a Renderable or a function returning one (the
 * `components.FilterEditor` of filter types and operators).
 */
export type FilterRenderableSource =
  | Renderable
  | (() => Renderable)
  | (new (...args: any[]) => unknown);

export type InfiniteTableColumnHeaderFilterAngularProps<T = any> = {
  column: InfiniteTableComputedColumn<T>;
  columnApi: InfiniteTableColumnApi<T>;
  horizontalLayoutPageIndex: null | number;
  filterEditor: FilterRenderableSource;
  filterOperatorSwitch: FilterRenderableSource;
  filterTypes: DataSourcePropFilterTypes<T>;
  columnFilterValue: DataSourceFilterValueItem<T> | null;
  operator?: DataSourceFilterOperator<T>;
  columnLabel: Renderable;
  columnFilterType?: string;
  columnHeaderHeight: number;
  onChange: (value: any) => void;
};

/**
 * The props of the filter row, for the filter editors inside it (see
 * `injectColumnFilterEditor()`).
 */
export const INFINITE_COLUMN_FILTER = new InjectionToken<
  Signal<InfiniteTableColumnHeaderFilterAngularProps<any>>
>('INFINITE_COLUMN_FILTER');

// the filter row sets its props input here in its constructor (it can't
// provide itself: the editor it creates in the constructor injects them)
const COLUMN_FILTER_SOURCE = new InjectionToken<
  WritableSignal<Signal<
    InfiniteTableColumnHeaderFilterAngularProps<any>
  > | null>
>('COLUMN_FILTER_SOURCE');

function isComponentClass(value: unknown): boolean {
  return typeof value === 'function' && !!(value as any).ɵcmp;
}

/**
 * A filter editor / operator switch / operator icon as a Renderable: a
 * component class is rendered, a function (the shared `() => Renderable`
 * signature) is called.
 */
export function toFilterRenderable(
  source: FilterRenderableSource | undefined,
  props?: Record<string, unknown>,
): Renderable {
  if (source == null) {
    return null;
  }
  if (source instanceof TemplateRef) {
    return source;
  }
  if (isComponentClass(source)) {
    return renderComponent(
      source as any,
      props ? { inputs: props } : undefined,
    );
  }
  if (typeof source === 'function') {
    return (source as (props?: any) => Renderable)(props);
  }
  return source as Renderable;
}

export type ColumnFilterEditorForAngular<T = any> = {
  /** the value in the editor (local: set right away, the filter may be debounced) */
  value: Signal<any>;
  setValue: (value: any) => void;
  clearValue: () => void;
  removeColumnFilter: () => void;
  disabled: Signal<boolean | undefined>;
  operator: Signal<DataSourceFilterOperator<T> | undefined>;
  operatorName: Signal<string | undefined>;
  filterType: Signal<DataSourceFilterType<T> | undefined>;
  filterTypes: Signal<DataSourcePropFilterTypes<T>>;
  filterTypeKey: Signal<string>;
  filtered: Signal<boolean>;
  columnFilterValue: Signal<DataSourceFilterValueItem<T> | null>;
  column: Signal<InfiniteTableComputedColumn<T>>;
  columnApi: Signal<InfiniteTableColumnApi<T>>;
  api: InfiniteTableApi<T>;
  ariaLabel: Signal<string>;
  className: string;
};

/**
 * In a filter editor (a component rendered in the header filter row): the
 * filter value and how to change it - the Angular equivalent of React's
 * `useInfiniteColumnFilterEditor` / Vue's `useInfiniteColumnFilterEditor`.
 *
 * ```ts
 * @Component({
 *   selector: 'input[myFilter]',
 *   host: { '[value]': 'editor.value() ?? ""', '(input)': 'editor.setValue($any($event.target).value)' },
 *   template: '',
 * })
 * class MyFilter { protected readonly editor = injectColumnFilterEditor(); }
 * ```
 */
export function injectColumnFilterEditor<
  T = any,
>(): ColumnFilterEditorForAngular<T> {
  const tableContext = injectInfiniteTable<T>();
  const filterProps = inject(INFINITE_COLUMN_FILTER) as Signal<
    InfiniteTableColumnHeaderFilterAngularProps<T>
  >;

  const { api, getComputed, getState, actions, dataSourceContext } =
    tableContext;
  const { getDataSourceState, dataSourceApi, dataSourceActions } =
    dataSourceContext;

  const column = computed(() => filterProps().column);

  const filterType = computed(() => {
    const { columnFilterType, filterTypes } = filterProps();
    return filterTypes[columnFilterType!];
  });

  const filterValue = computed(
    () => filterProps().columnFilterValue?.filter.value,
  );

  // like the React effect: follows the filter value; a column without a
  // filter value has the filter type's empty value (not '')
  const theValue = linkedSignal<any, any>({
    source: filterValue,
    computation: (value, previous) => {
      if (filterProps().columnFilterValue) {
        return value;
      }
      const type = filterType();
      if (type) {
        return [...type.emptyValues][0];
      }
      return previous ? previous.value : '';
    },
  });

  const setValue = (value: any) => {
    theValue.set(value);
    untracked(filterProps).onChange(value);
  };

  const clearValue = () => {
    api.clearColumnFilter(untracked(column).id);
  };
  const removeColumnFilter = () => {
    api.removeColumnFilter(untracked(column).id);
  };

  const stableContext = {
    api,
    getState,
    getComputed,
    getDataSourceState,
    actions,
    dataSourceActions,
    dataSourceApi,
  };

  // text only: a template or component label can't be an attribute
  const ariaLabel = computed(() => {
    const col = column();
    const label = getColumnLabel(col, stableContext as any, 'column-filter');
    const text =
      typeof label === 'string' || typeof label === 'number'
        ? label
        : col.name || col.id;
    return `Filter for ${text}`;
  });

  return {
    api,
    column,
    columnApi: computed(() => filterProps().columnApi),
    columnFilterValue: computed(() => filterProps().columnFilterValue),
    operator: computed(() => filterProps().operator),
    operatorName: computed(() => filterProps().operator?.name),
    value: theValue.asReadonly(),
    disabled: computed(() => filterProps().columnFilterValue?.disabled),
    filterType,
    filterTypes: computed(() => filterProps().filterTypes),
    filterTypeKey: computed(() => filterProps().columnFilterType!),
    filtered: computed(() => !!column().computedFiltered),
    setValue,
    clearValue,
    removeColumnFilter,
    ariaLabel,
    className: `${HeaderFilterEditorCls} ${InfiniteTableColumnHeaderFilterInputClassName}`,
  };
}

const stopPropagation = (e: Event) => e.stopPropagation();

/**
 * The filter row of a header cell. The filter editor and the operator
 * switch inside it can `injectColumnFilterEditor()`; a template editor gets
 * the same object as `$implicit` (`let-editor`).
 */
@Component({
  selector: 'div[infiniteColumnHeaderFilter]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [InfiniteRender],
  providers: [
    { provide: COLUMN_FILTER_SOURCE, useFactory: () => signal(null) },
    {
      provide: INFINITE_COLUMN_FILTER,
      useFactory: () => {
        const source = inject(COLUMN_FILTER_SOURCE);
        return computed(() => source()!());
      },
    },
  ],
  host: {
    '[class]': 'className()',
    '[style.height.px]': 'filterProps().columnHeaderHeight',
    '(pointerup)': 'stopPropagation($event)',
    '(pointerdown)': 'stopPropagation($event)',
    '(focusin)': 'focused.set(true)',
    '(focusout)': 'focused.set(false)',
  },
  template: `<ng-container
      [infiniteRender]="operatorSwitch()"
      [infiniteRenderContext]="templateContext"
    /><ng-container
      [infiniteRender]="editor()"
      [infiniteRenderContext]="templateContext"
    />`,
})
export class InfiniteTableColumnHeaderFilter<T = any> {
  readonly filterProps =
    input.required<InfiniteTableColumnHeaderFilterAngularProps<T>>();

  private readonly tableContext = injectInfiniteTable<T>();

  protected readonly focused = signal(false);
  protected readonly stopPropagation = stopPropagation;

  protected readonly templateContext: {
    $implicit: ColumnFilterEditorForAngular<T>;
    editor: ColumnFilterEditorForAngular<T>;
  };

  protected readonly className = computed(() => {
    const column = this.filterProps().column;
    const active =
      this.tableContext.state().filterOperatorMenuVisibleForColumnId ===
        column.id || this.focused();
    return `${InfiniteTableColumnHeaderFilterClassName} ${HeaderFilterRecipe({
      active,
    })}`;
  });

  protected readonly operatorSwitch = computed(() => {
    const source = this.filterProps().filterOperatorSwitch;
    return untracked(() => toFilterRenderable(source));
  });

  protected readonly editor = computed(() => {
    const source = this.filterProps().filterEditor;
    return untracked(() => toFilterRenderable(source));
  });

  constructor() {
    inject(COLUMN_FILTER_SOURCE).set(this.filterProps);
    const editor = injectColumnFilterEditor<T>();
    this.templateContext = { $implicit: editor, editor };
  }
}

/**
 * The default operator switch: the icon of the current operator; a
 * mousedown toggles the filter operator menu.
 */
@Component({
  selector: 'div[infiniteFilterOperatorSwitch]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [InfiniteRender],
  host: {
    'data-name': 'filter-operator',
    '[attr.data-disabled]': 'editor.disabled()',
    '[class]': 'className()',
    '(mousedown)': 'onMouseDown($event)',
  },
  template: `<ng-container [infiniteRender]="icon()" />`,
})
export class InfiniteTableFilterOperatorSwitch {
  protected readonly editor = injectColumnFilterEditor();

  protected readonly className = computed(() =>
    join(
      InfiniteTableColumnHeaderFilterOperatorClassName,
      HeaderFilterOperatorCls,
      this.editor.disabled()
        ? `${InfiniteTableColumnHeaderFilterOperatorClassName}--disabled`
        : '',
    ),
  );

  protected readonly icon = computed(() => {
    const operator = this.editor.operator();
    const props = {
      size: 20,
      className: `${HeaderFilterOperatorIconRecipe({
        disabled: !!this.editor.disabled(),
      })}`,
    };
    const Icon = operator?.components?.Icon;
    return untracked(() =>
      Icon
        ? toFilterRenderable(Icon as any, props)
        : renderComponent(FilterIcon, { inputs: props }),
    );
  });

  protected onMouseDown(event: MouseEvent) {
    event.stopPropagation();
    if (this.editor.disabled()) {
      return;
    }
    this.editor.columnApi().toggleFilterOperatorMenu(event.target!);
  }
}

/**
 * What a filterable header cell shows in the filter row when its column
 * is not filterable.
 */
@Component({
  selector: 'div[infiniteColumnHeaderFilterEmpty]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'className',
    '(pointerup)': 'stopPropagation($event)',
    '(pointerdown)': 'stopPropagation($event)',
  },
  template: '',
})
export class InfiniteTableColumnHeaderFilterEmpty {
  protected readonly className = `${InfiniteTableColumnHeaderFilterClassName} ${HeaderFilterRecipe(
    { active: false },
  )} ${height['50%']}`;
  protected readonly stopPropagation = stopPropagation;
}

const EMPTY_FILTER = renderComponent(InfiniteTableColumnHeaderFilterEmpty);

/**
 * The filter change handler of a header cell (React's
 * debouncedOnFilterValueChange memo): `api.setColumnFilter`, debounced by
 * the DataSource's `filterDelay`, recreated when the column id or the delay
 * changes.
 */
export function createColumnFilterChangeHandler<T>(
  tableContext: Pick<
    InfiniteTableContextValueForAngular<T>,
    'api' | 'dataSourceContext'
  >,
) {
  let current: { key: string; fn: (filterValue: any) => void } | null = null;

  return (columnId: string) => {
    const filterDelay =
      tableContext.dataSourceContext.getDataSourceState().filterDelay;
    const key = `${columnId}:${filterDelay}`;

    if (!current || current.key !== key) {
      const fn = (filterValue: any) => {
        tableContext.api.setColumnFilter(columnId, filterValue);
      };
      current = {
        key,
        fn: filterDelay > 0 ? debounce(fn, { wait: filterDelay }) : fn,
      };
    }
    return current.fn;
  };
}

/**
 * What a header cell renders in its filter row (`renderBag.filterEditor`):
 * the filter row with the editor of the column's operator / filter type /
 * column (in this order), or the empty filter for a column that isn't
 * filterable. Mirrors the React and Vue header cells.
 */
export function getColumnHeaderFilter<T>(params: {
  column: InfiniteTableComputedColumn<T>;
  columnApi: InfiniteTableColumnApi<T>;
  filterTypes: DataSourcePropFilterTypes<T>;
  columnHeaderHeight: number;
  horizontalLayoutPageIndex: null | number;
  onChange: (value: any) => void;
}): Renderable {
  const { column, filterTypes } = params;

  if (!column.computedFilterable) {
    return EMPTY_FILTER;
  }

  const filterTypeKey = column.computedFilterType;
  const filterType = filterTypes[filterTypeKey];

  const operatorName =
    column.computedFilterValue?.filter.operator ?? filterType?.defaultOperator;

  const operator = filterType
    ? filterType.operators.find((op) => op.name === operatorName)
    : undefined;

  const columnComponents = column.components as
    | Record<string, FilterRenderableSource | undefined>
    | undefined;

  const filterEditor: FilterRenderableSource =
    operator?.components?.FilterEditor ||
    filterType?.components?.FilterEditor ||
    columnComponents?.FilterEditor ||
    StringFilterEditor;

  const filterOperatorSwitch: FilterRenderableSource =
    filterType?.components?.FilterOperatorSwitch ||
    columnComponents?.FilterOperatorSwitch ||
    InfiniteTableFilterOperatorSwitch;

  const filterProps: InfiniteTableColumnHeaderFilterAngularProps<T> = {
    column,
    columnApi: params.columnApi,
    horizontalLayoutPageIndex: params.horizontalLayoutPageIndex,
    filterEditor,
    filterOperatorSwitch,
    operator,
    filterTypes,
    onChange: params.onChange,
    columnFilterType: filterTypeKey,
    columnLabel: column.field || column.name || column.id,
    columnFilterValue: column.computedFilterValue,
    columnHeaderHeight: params.columnHeaderHeight,
  };

  return renderComponent(InfiniteTableColumnHeaderFilter, {
    inputs: { filterProps },
  });
}
