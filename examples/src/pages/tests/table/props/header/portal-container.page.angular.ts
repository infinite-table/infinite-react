import {
  Component,
  EmbeddedViewRef,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  inject,
  viewChild,
} from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  alignNode,
  injectHeaderCell,
  injectInfinitePortalContainer,
  renderComponent,
} from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Item = {
  id: number;
  name: string;
};

const data: Item[] = Array.from({ length: 20 }, (_, id) => ({
  id,
  name: `Item ${id}`,
}));

// the popup is rendered into the grid's portal element (Vue: <Teleport>):
// an embedded view whose nodes are moved there
@Component({
  selector: 'header-with-popup',
  template: `
    <div>
      <button data-name="toggle-popup" (click)="toggle()">
        {{ headerCell().column.id }}
      </button>
    </div>

    <ng-template #popup>
      <div
        data-name="popup"
        style="position: absolute; top: 0; left: 0; width: 150px; height: 50px; background: tomato"
      >
        popup
      </div>
    </ng-template>
  `,
})
class HeaderWithPopup implements OnDestroy {
  protected readonly headerCell = injectHeaderCell<Item>();
  private readonly portalContainer = injectInfinitePortalContainer();
  private readonly vcr = inject(ViewContainerRef);
  private readonly popupTpl = viewChild.required<TemplateRef<unknown>>('popup');

  private popup: EmbeddedViewRef<unknown> | null = null;

  protected toggle() {
    if (this.popup) {
      this.popup.destroy();
      this.popup = null;
      return;
    }
    const container = this.portalContainer();
    if (!container) {
      return;
    }
    const popup = this.vcr.createEmbeddedView(this.popupTpl());
    popup.detectChanges();
    const [node] = popup.rootNodes as HTMLDivElement[];
    container.appendChild(node);
    this.popup = popup;

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

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table [domProps]="domProps" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class PortalContainerPage {
  protected readonly data = data;

  protected readonly columns: InfiniteTablePropColumns<Item> = {
    id: { field: 'id' },
    name: {
      field: 'name',
      defaultWidth: 300,
      renderHeader: () => renderComponent(HeaderWithPopup),
    },
  };

  protected readonly domProps = {
    style: {
      height: '60vh',
      margin: '40px',
    },
  };
}
