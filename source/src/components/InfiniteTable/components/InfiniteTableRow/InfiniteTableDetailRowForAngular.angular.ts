/**
 * Angular sibling of InfiniteTableDetailRow.tsx (Vue:
 * InfiniteTableDetailRowForVue.vue.ts) - renders the expanded row details
 * and provides the master-detail context, so a DataSource inside the
 * details registers itself with the master.
 *
 * It is the pooled component of a detail row: the renderer creates it once
 * per pooled row and gives it new props while scrolling. When the pooled
 * row is recycled for another master row (`rowInfo.id` changes), the detail
 * content is destroyed and created again, with a new master-detail context
 * - what React's `key` does. That's what keeps the detail state cache
 * working: the detail DataSource of row A saves its state when destroyed,
 * the one of row B restores B's state when created.
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  WritableSignal,
  inject,
  signal,
  untracked,
} from '@angular/core';

import type { RowDetailCache } from '../../../DataSource/RowDetailCache';
import type { DataSourceMasterDetailContextValue } from '../../../DataSource/types';
import { injectDataSource } from '../../../DataSource/DataSourceForAngular.angular';
import {
  INFINITE_MASTER_DETAIL_CONTEXT,
  INFINITE_MASTER_ROW_INFO,
} from '../../../DataSource/DataSourceMasterDetailContextForAngular.angular';
import { injectPooledProps } from '../../../HeadlessTable/AngularPooledViews.angular';
import {
  InfiniteRender,
  isComponentRenderable,
  isTemplateRenderable,
} from '../../../RawList/InfiniteRenderForAngular.angular';
import type { Renderable } from '../../../types/FrameworkTypes.angular';
import { join } from '../../../../utils/join';

import { internalProps } from '../../internalProps';
import { InternalVars } from '../../internalVars.css';
import type { InfiniteTableRowInfo } from '../../types';
import { RowDetailRecipe } from '../rowDetail.css';
import { visibility } from '../../utilities.css';
import { injectInfiniteTable } from '../../InfiniteTableContextForAngular.angular';

import {
  CurrentRowCache,
  createCurrentRowCache,
  createMasterDetailContextValue,
} from './registerDetailShared';

const { rootClassName } = internalProps;

export const InfiniteTableRowDetailsClassName = `${rootClassName}RowDetail`;

const DETAIL_ROW_CLASS_NAME = join(
  InfiniteTableRowDetailsClassName,
  RowDetailRecipe({}),
);

// TODO see #rowDetailWidth
const DETAIL_ROW_WIDTH = `calc(${InternalVars.bodyWidth} - ${InternalVars.scrollbarWidthVertical})`;

export type InfiniteTableDetailRowProps<T = any> = {
  rowInfo: InfiniteTableRowInfo<T>;
  rowIndex: number;
  rowDetailHeight: number;
  detailOffset: number;
  rowDetailRenderer: (
    rowInfo: InfiniteTableRowInfo<T>,
    cache: CurrentRowCache,
  ) => Renderable;
  rowDetailsCache: RowDetailCache;
};

/**
 * What the details of one master row are rendered with: created when the
 * row starts being rendered, and again whenever the pooled row is recycled
 * for another master row.
 */
type DetailForRow = {
  rowId: string | number;
  currentRowCache: CurrentRowCache;
  masterDetailContextValue: DataSourceMasterDetailContextValue;
  masterRowInfo: WritableSignal<InfiniteTableRowInfo<any>>;
  /**
   * Provides the master-detail context and the master row info to the
   * content. A new injector for each master row, so the outlet creates the
   * content views again (it keeps a view only for the same injector).
   */
  injector: Injector;
};

type DetailRowView = {
  content: Renderable;
  /**
   * The context templates get (and the inputs of components, by name):
   * `let-rowInfo` (also `$implicit`) and `let-cache="cache"`.
   */
  context: {
    $implicit: InfiniteTableRowInfo<any>;
    rowInfo: InfiniteTableRowInfo<any>;
    cache: CurrentRowCache;
  } | null;
  detailOffset: number;
  rowDetailHeight: number;
};

const EMPTY_VIEW: DetailRowView = {
  content: null,
  context: null,
  detailOffset: 0,
  rowDetailHeight: 0,
};

/**
 * Gives the content the injector of the detail it belongs to, unless it
 * comes with its own. A bare TemplateRef keeps the outlet context.
 */
function bindToDetail(content: Renderable, injector: Injector): Renderable {
  if (content == null || typeof content !== 'object') {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map((item) => bindToDetail(item, injector));
  }
  if (content instanceof TemplateRef) {
    return { kind: 'template', template: content, injector };
  }
  if (isTemplateRenderable(content) || isComponentRenderable(content)) {
    return content.injector ? content : { ...content, injector };
  }
  return content;
}

/**
 * The detail row: the host is the `.InfiniteRowDetail` element the renderer
 * positions (as in React and Vue), the content is inside it.
 */
@Component({
  selector: 'div[infiniteDetailRow]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [InfiniteRender],
  host: {
    '[class]': 'className',
    '[style.position]': '"absolute"',
    '[style.top.px]': 'view.detailOffset',
    '[style.left.px]': '0',
    '[style.width]': 'width',
    '[style.height.px]': 'view.rowDetailHeight',
  },
  template: `<ng-container
    [infiniteRender]="view.content"
    [infiniteRenderContext]="view.context"
  />`,
})
export class InfiniteTableDetailRow implements DoCheck {
  protected readonly className = DETAIL_ROW_CLASS_NAME;
  protected readonly width = DETAIL_ROW_WIDTH;

  private readonly props = injectPooledProps<InfiniteTableDetailRowProps>();
  private readonly injector = inject(Injector);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly masterDataSource = injectDataSource();
  private readonly masterTable = injectInfiniteTable();

  private detail: DetailForRow | null = null;
  private builtFor: InfiniteTableDetailRowProps | null = null;

  protected view: DetailRowView = EMPTY_VIEW;

  /**
   * Like a React render: the view is built when the props changed. The
   * user's `rowDetailRenderer` runs here, not in a computed.
   */
  ngDoCheck() {
    const props = untracked(this.props);
    if (!props || props === this.builtFor) {
      return;
    }
    this.builtFor = props;

    const { rowInfo } = props;
    let detail = this.detail;
    if (!detail || detail.rowId !== rowInfo.id) {
      detail = this.detail = this.createDetail(props);
    }

    // keep the row info fresh on each render, as React and Vue do
    detail.masterDetailContextValue.masterRowInfo = rowInfo;
    detail.masterRowInfo.set(rowInfo);

    const content = props.rowDetailRenderer(rowInfo, detail.currentRowCache);

    this.view = {
      content: bindToDetail(content, detail.injector),
      context: { $implicit: rowInfo, rowInfo, cache: detail.currentRowCache },
      detailOffset: props.detailOffset,
      rowDetailHeight: props.rowDetailHeight,
    };
    this.cdr.markForCheck();
  }

  private createDetail(props: InfiniteTableDetailRowProps): DetailForRow {
    const { rowInfo } = props;

    const { currentRowCache, cacheCalledByRowDetailRenderer } =
      createCurrentRowCache(rowInfo.id, props.rowDetailsCache);

    const masterDataSource = this.masterDataSource;
    const masterDetailContextValue = createMasterDetailContextValue({
      rowInfo,
      currentRowCache,
      cacheCalledByRowDetailRenderer,
      getMasterDataSourceState: masterDataSource.getDataSourceState,
      masterActions: masterDataSource.dataSourceActions,
      getMasterState: this.masterTable.getState,
    });

    const masterRowInfo = signal<InfiniteTableRowInfo<any>>(rowInfo);
    const getContext = () => masterDetailContextValue;

    return {
      rowId: rowInfo.id,
      currentRowCache,
      masterDetailContextValue,
      masterRowInfo,
      injector: Injector.create({
        providers: [
          { provide: INFINITE_MASTER_DETAIL_CONTEXT, useValue: getContext },
          {
            provide: INFINITE_MASTER_ROW_INFO,
            useValue: masterRowInfo.asReadonly(),
          },
        ],
        parent: this.injector,
      }),
    };
  }
}

/**
 * What a detail row renders when its row has no details (collapsed, or not
 * rendered yet): React and Vue return a hidden div rather than nothing, so
 * the renderer keeps track of the element of the pooled row and can reuse
 * it when the row is scrolled to another index.
 */
@Component({
  selector: 'div[infiniteDetailRowPlaceholder]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'className',
  },
  template: ``,
})
export class InfiniteTableDetailRowPlaceholder {
  protected readonly className = visibility.hidden;
}
