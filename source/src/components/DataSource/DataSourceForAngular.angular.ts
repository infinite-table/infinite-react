import {
  DestroyRef,
  Directive,
  ElementRef,
  InjectionToken,
  Injector,
  OnInit,
  Signal,
  computed,
  inject,
  signal,
} from '@angular/core';

import { buildManagedAngularComponent } from '../hooks/useComponentState/useManagedComponent.angular';
import { runControllerEffectsForAngular } from '../hooks/runControllerEffectsForAngular.angular';
import type { Scrollbars } from '../InfiniteTable/types/InfiniteTableProps';

import {
  cleanupDataSource,
  deriveStateFromProps,
  forwardProps,
  getInterceptActions,
  getMappedCallbacks,
  initSetupState,
  onPropChange,
} from './state/getInitialState';
import { concludeReducer } from './state/reducer';
import { getDataSourceApi } from './getDataSourceApi';
import { createDataSourceEffects } from './dataSourceEffects';
import {
  DATA_SOURCE_PROPS_META,
  DataSourceInputs,
} from './DataSourceInputs.generated.angular';
import { injectGetMasterDetailContext } from './DataSourceMasterDetailContextForAngular.angular';

import type {
  DataSourceApi,
  DataSourceComponentActions,
  DataSourceProps,
  DataSourceState,
} from './types';

/**
 * What a DataSource gives the components inside it (the InfiniteTable,
 * `injectDataSource()`).
 */
export type DataSourceContextValueForAngular<T = any> = {
  /** tracked: computeds/effects/templates reading it re-run on every state change */
  state: Signal<DataSourceState<T>>;
  /** untracked */
  getDataSourceState: () => DataSourceState<T>;
  dataSourceActions: DataSourceComponentActions<T>;
  dataSourceApi: DataSourceApi<T>;
  assignState: (state: Partial<DataSourceState<T>>) => void;
};

export const INFINITE_DATA_SOURCE = new InjectionToken<
  DataSourceContextValueForAngular<any>
>('INFINITE_DATA_SOURCE');

/**
 * In an injection context inside a DataSource: its state, actions and api.
 */
export function injectDataSource<T = any>(): DataSourceContextValueForAngular<T> {
  return inject(INFINITE_DATA_SOURCE) as DataSourceContextValueForAngular<T>;
}

/**
 * In an injection context inside a DataSource: a signal with a value
 * selected from its state, which changes only when the selected value does.
 */
export function injectDataSourceState<R, T = any>(
  selector: (state: DataSourceState<T>) => R,
  options?: { equal?: (a: R, b: R) => boolean },
): Signal<R> {
  const { state } = injectDataSource<T>();
  return computed(() => selector(state()), options);
}

const injectManagedDataSource = buildManagedAngularComponent({
  debugName: 'DataSource',
  //@ts-ignore
  initSetupState,
  //@ts-ignore
  forwardProps,
  //@ts-ignore
  concludeReducer,
  //@ts-ignore
  mapPropsToState: deriveStateFromProps,
  //@ts-ignore
  onPropChange,
  //@ts-ignore
  cleanup: cleanupDataSource,
  //@ts-ignore
  interceptActions: getInterceptActions(),
  //@ts-ignore
  mappedCallbacks: getMappedCallbacks(),
});

/**
 * The data of the components inside it: loads, sorts, filters, groups and
 * pivots it.
 *
 * ```html
 * <infinite-data-source primaryKey="id" [data]="data" [(sortInfo)]="sortInfo">
 *   <infinite-table [columns]="columns" />
 * </infinite-data-source>
 * ```
 *
 * It renders no element of its own (the host is `display: contents`; use
 * `<ng-container infiniteDataSource>` for no element at all). Its state and
 * api are reachable from the template with `#ds="infiniteDataSource"`.
 */
@Directive({
  selector: 'infinite-data-source, [infiniteDataSource]',
  exportAs: 'infiniteDataSource',
  providers: [
    {
      provide: INFINITE_DATA_SOURCE,
      useFactory: () => inject(DataSource).context,
    },
  ],
})
export class DataSource<T = any> extends DataSourceInputs<T> implements OnInit {
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly getMasterDetailContext = injectGetMasterDetailContext();
  private readonly managed = injectManagedDataSource(
    this,
    DATA_SOURCE_PROPS_META,
    () => this.presetProps() as any,
  );

  /**
   * The values a preset (TreeDataSource) gives props that are not
   * specified. Read in a reactive context.
   */
  protected presetProps(): Partial<DataSourceProps<T>> | null {
    return null;
  }

  private dataSourceApi: DataSourceApi<T> | null = null;

  /**
   * The context the components inside get - its members are only read
   * after this DataSource is initialized (they're initialized after it).
   */
  readonly context: DataSourceContextValueForAngular<T> = (() => {
    const self = this;
    return {
      get state() {
        return self.managed.context.state as Signal<DataSourceState<T>>;
      },
      getDataSourceState: () =>
        this.managed.context.getComponentState() as DataSourceState<T>,
      get dataSourceActions() {
        return self.managed.context
          .componentActions as unknown as DataSourceComponentActions<T>;
      },
      get dataSourceApi() {
        return self.dataSourceApi!;
      },
      assignState: (state: Partial<DataSourceState<T>>) =>
        this.managed.context.assignState(state as any),
    };
  })();

  /**
   * The DataSource api, once initialized.
   */
  get api(): DataSourceApi<T> | null {
    return this.dataSourceApi;
  }

  /**
   * The state of the DataSource (tracked).
   */
  readonly state: Signal<DataSourceState<T>> = computed(
    () => this.managed.context.state() as DataSourceState<T>,
  );

  /** the pivot columns, when pivoting - for the InfiniteTable `[pivotColumns]` */
  readonly pivotColumns = computed(() => this.state()?.pivotColumns);
  /** the pivot column groups - for the InfiniteTable `[pivotColumnGroups]` */
  readonly pivotColumnGroups = computed(() => this.state()?.pivotColumnGroups);
  /** the current rows */
  readonly dataArray = computed(() => this.state()?.dataArray);

  constructor() {
    super();
    const host = inject(ElementRef).nativeElement as Node;
    if (host instanceof HTMLElement) {
      // the components inside lay out as if it weren't there
      host.style.display = 'contents';
    }
  }

  ngOnInit() {
    this.managed.init();

    const context = this.managed.context;
    const getDataSourceState = context.getComponentState as () => DataSourceState<T>;
    const dataSourceActions =
      context.componentActions as unknown as DataSourceComponentActions<T>;
    const state = context.state as Signal<DataSourceState<T>>;

    getDataSourceState().getDataSourceMasterContextRef.current =
      this.getMasterDetailContext;

    const dataSourceApi = getDataSourceApi<T>({
      getState: getDataSourceState,
      actions: dataSourceActions,
    });
    this.dataSourceApi = dataSourceApi;

    const scrollbars = signal<Scrollbars>({ vertical: false, horizontal: false });

    const dataSourceEffects = createDataSourceEffects<T>({
      state: () => state(),
      getState: getDataSourceState,
      actions: dataSourceActions,
      api: dataSourceApi,
      assignState: this.context.assignState,
      getDataSourceMasterContext: this.getMasterDetailContext,
      scrollbars: {
        get: () => scrollbars(),
        set: (value) => scrollbars.set(value),
      },
    });

    runControllerEffectsForAngular(dataSourceEffects.effects, {
      injector: this.injector,
      before: dataSourceEffects.beforeEffectsMount,
      after: dataSourceEffects.afterEffectsMount,
    });

    this.destroyRef.onDestroy(() => {
      dataSourceEffects.destroy();
      const dataSourceState = getDataSourceState();
      dataSourceState.onCleanup(dataSourceState);
    });

    const isDetail = !!this.getMasterDetailContext();
    if (__DEV__ && !isDetail) {
      (globalThis as any).getDataSourceState = getDataSourceState;
      (globalThis as any).dataSourceActions = dataSourceActions;
      (globalThis as any).dataSourceApi = dataSourceApi;
    }
    if (__DEV__) {
      const { debugId } = getDataSourceState();
      if (debugId) {
        (globalThis as any).dataSources = (globalThis as any).dataSources || {};
        (globalThis as any).dataSources[debugId] = {
          getState: getDataSourceState,
          actions: dataSourceActions,
          api: dataSourceApi,
        };
      }
    }
  }
}
