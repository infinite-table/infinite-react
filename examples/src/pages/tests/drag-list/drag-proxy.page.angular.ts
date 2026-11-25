import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  signal,
} from '@angular/core';

import {
  DragDropProvider,
  DragItem,
  DragList,
  type DragListProps,
} from '@infinite-table/infinite-angular';

type LoggedCall = { name: string; [key: string]: any };

const itemStyle =
  'height: 40px; box-sizing: border-box; border: 1px solid gray; background: white; color: black';

const listStyle = 'width: 200px; height: 240px; background: #eee';

@Component({
  selector: 'test-page',
  imports: [DragDropProvider, DragList, DragItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="padding: 20px" [attr.data-ready]="ready()">
      <!-- the proxy is rendered by the list, in the body -->
      <ng-template #proxy let-proxy>
        <div
          data-name="rendered-proxy"
          style="position: fixed; background: yellow; pointer-events: none"
          [style.top.px]="proxy.initialRect.top + proxy.dy"
          [style.left.px]="proxy.initialRect.left + proxy.dx"
          [style.width.px]="proxy.initialRect.width"
          [style.height.px]="proxy.initialRect.height"
        >
          dragging {{ proxy.dragItemId }}
        </div>
      </ng-template>

      <div infiniteDragDropProvider>
        <div style="display: flex; gap: 50px">
          <div
            infiniteDragList="rendered"
            orientation="vertical"
            [renderDragProxy]="proxy"
            [onDrop]="onRenderedDrop"
            data-name="rendered"
            [style]="listStyle"
          >
            @for (id of rendered(); track id) {
            <div [infiniteDragItem]="id" [style]="itemStyle">{{ id }}</div>
            }
          </div>

          <div
            infiniteDragList="customized"
            orientation="vertical"
            preserveDragSpace
            [onDragProxySetup]="onDragProxySetup"
            [onDragProxyMove]="onDragProxyMove"
            [onDrop]="onCustomizedDrop"
            data-name="customized"
            [style]="listStyle"
          >
            @for (id of customized(); track id) {
            <div [infiniteDragItem]="id" [style]="itemStyle">{{ id }}</div>
            }
          </div>
        </div>
      </div>

      <pre data-name="log">{{ logText() }}</pre>
    </div>
  `,
})
export default class DragProxyPage {
  protected readonly itemStyle = itemStyle;
  protected readonly listStyle = listStyle;
  protected readonly rendered = signal(['a', 'b', 'c']);
  protected readonly customized = signal(['x', 'y', 'z']);
  private readonly calls = signal<LoggedCall[]>([]);
  protected readonly logText = computed(() => JSON.stringify(this.calls()));

  // the specs wait for this before they drag
  protected readonly ready = signal(false);

  constructor() {
    afterNextRender(() => this.ready.set(true));
  }

  private log(call: LoggedCall) {
    this.calls.update((calls) => [...calls, call]);
  }

  // the default proxy, changed by the page
  protected readonly onDragProxySetup: DragListProps['onDragProxySetup'] = (
    params,
  ) => {
    const { proxyElement, dragItemId } = params;

    this.log({ name: 'onDragProxySetup', dragItemId });
    proxyElement.setAttribute('data-name', 'customized-proxy');

    return {
      cleanup: ({ proxyElement }) => {
        this.log({ name: 'cleanup' });
        proxyElement.remove();
      },
    };
  };

  protected readonly onDragProxyMove: DragListProps['onDragProxyMove'] = ({
    proxyElement,
    dx,
    dy,
  }) => {
    // moved with margins, not with the default transform
    proxyElement.style.marginLeft = `${dx}px`;
    proxyElement.style.marginTop = `${dy}px`;
    proxyElement.setAttribute('data-moved-by', `${dx},${dy}`);
  };

  protected readonly onRenderedDrop = (sortedIndexes: number[]) => {
    this.log({ name: 'rendered.onDrop', sortedIndexes });
    this.rendered.update((items) => sortedIndexes.map((index) => items[index]));
  };

  protected readonly onCustomizedDrop = (sortedIndexes: number[]) => {
    this.log({ name: 'customized.onDrop', sortedIndexes });
    this.customized.update((items) =>
      sortedIndexes.map((index) => items[index]),
    );
  };
}
