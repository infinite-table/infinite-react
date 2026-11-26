import {
  Component,
  EmbeddedViewRef,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
  alignNode,
  injectHeaderCell,
  injectInfinitePortalContainer,
  renderComponent,
} from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  DataSourcePropFilterValue,
  DataSourcePropShouldReloadDataObject,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

const data: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

@Component({
  selector: 'column-filter-menu-icon',
  imports: [InfiniteRender],
  host: {
    '(mousedown)': 'markInsideMenu($event)',
    '(pointerdown)': 'toggle($event)',
  },
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>

    <!-- #highlight the popup with the filter editor, moved into the grid's portal container -->
    <ng-template #popup>
      <!-- not inside this component's element, so its events don't reach the host listeners: it gets the same ones -->
      <div
        (mousedown)="markInsideMenu($event)"
        (pointerdown)="toggle($event)"
        style="position: absolute; color: white; top: 0; left: 0; overflow: visible; background: var(--infinite-background); border: var(--infinite-cell-border); padding: 10px"
        [style.width.px]="headerCell().column.computedWidth"
        [style.display]="visible() ? 'block' : 'none'"
      >
        <ng-container [infiniteRender]="headerCell().renderBag.filterEditor" />
      </div>
    </ng-template>
    <!-- #endhighlight -->
  `,
})
class ColumnFilterMenuIcon implements OnDestroy {
  protected readonly headerCell = injectHeaderCell();
  private readonly portalContainer = injectInfinitePortalContainer();
  private readonly vcr = inject(ViewContainerRef);
  private readonly popupTemplate =
    viewChild.required<TemplateRef<unknown>>('popup');

  protected readonly visible = signal(false);

  private popup: EmbeddedViewRef<unknown> | null = null;

  protected markInsideMenu(event: MouseEvent) {
    // @ts-ignore
    event.__insideMenu = this.headerCell().column.id;
  }

  protected toggle(event: PointerEvent) {
    const { column } = this.headerCell();

    event.stopPropagation();

    if (this.visible()) {
      this.visible.set(false);
      return;
    }

    this.show();

    const handleMouseDown = (event: MouseEvent) => {
      // @ts-ignore
      if (event.__insideMenu !== column.id) {
        this.visible.set(false);
        document.documentElement.removeEventListener(
          'mousedown',
          handleMouseDown,
        );
      }
    };
    document.documentElement.addEventListener('mousedown', handleMouseDown);
  }

  private show() {
    const container = this.portalContainer();
    if (!container) {
      return;
    }
    if (!this.popup) {
      this.popup = this.vcr.createEmbeddedView(this.popupTemplate());
    }
    this.visible.set(true);
    this.popup.detectChanges();

    const [node] = this.popup.rootNodes as HTMLDivElement[];
    container.appendChild(node);

    const alignTo = this.headerCell().htmlElementRef.current;
    if (alignTo) {
      alignNode(node, {
        alignTo,
        alignPosition: [['TopRight', 'BottomRight']],
      });
    }
  }

  ngOnDestroy() {
    this.popup?.destroy();
  }
}

// what React renders as a fragment: the host is `display: contents`, so its
// children are laid out by the header
@Component({
  selector: 'custom-header-with-filter-menu',
  imports: [InfiniteRender, ColumnFilterMenuIcon],
  host: { style: 'display: contents' },
  template: `
    <ng-container [infiniteRender]="headerCell().renderBag.header" />
    <div style="flex: 1"></div>

    <ng-container [infiniteRender]="headerCell().renderBag.filterIcon" />

    <ng-container [infiniteRender]="headerCell().renderBag.menuIcon" />
    <column-filter-menu-icon />
  `,
})
class CustomHeaderWithFilterMenu {
  protected readonly headerCell = injectHeaderCell();
}

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
    renderHeader: () => renderComponent(CustomHeaderWithFilterMenu),
  },
  salary: {
    field: 'salary',
    type: 'number',
    renderHeader: () => renderComponent(CustomHeaderWithFilterMenu),
  },

  firstName: {
    field: 'firstName',
    renderHeader: () => renderComponent(CustomHeaderWithFilterMenu),
  },
  stack: { field: 'stack', renderHeader: () => renderComponent(CustomHeaderWithFilterMenu) },
  currency: { field: 'currency', renderHeader: () => renderComponent(CustomHeaderWithFilterMenu) },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="data"
      primaryKey="id"
      [defaultFilterValue]="defaultFilterValue"
      [shouldReloadData]="shouldReloadData"
    >
      <infinite-table
        debugId="custom-column-filter-display-example"
        [showColumnFilters]="false"
        [columnDefaultWidth]="150"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly defaultFilterValue: DataSourcePropFilterValue<Developer> =
    [];
  protected readonly shouldReloadData: DataSourcePropShouldReloadDataObject<Developer> =
    {
      filterValue: false,
      sortInfo: false,
      groupBy: false,
      pivotBy: false,
    };
}
