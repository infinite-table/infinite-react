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

// 30 items of 40px in a list of 200px: the list scrolls by 1000px
const scrollListStyle =
  'width: 200px; height: 200px; overflow-y: auto; background: #eee';

const ACCEPT_DROPS_FROM = ['long', 'short'];

@Component({
  selector: 'test-page',
  imports: [DragDropProvider, DragList, DragItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="padding: 20px" [attr.data-ready]="ready()">
      <div infiniteDragDropProvider>
        <div style="display: flex; gap: 50px">
          <div
            infiniteDragList="long"
            orientation="vertical"
            [acceptDropsFrom]="acceptDropsFrom"
            [onDrop]="onLongDrop"
            [onAcceptDrop]="onLongAcceptDrop"
            data-name="long"
            [style]="scrollListStyle"
          >
            @for (id of long(); track id) {
            <div [infiniteDragItem]="id" [style]="itemStyle">{{ id }}</div>
            }
          </div>

          <div
            infiniteDragList="short"
            orientation="vertical"
            [onDrop]="onShortDrop"
            [onRemove]="onShortRemove"
            data-name="short"
            style="width: 200px; height: 200px; background: #eee"
          >
            @for (id of short(); track id) {
            <div [infiniteDragItem]="id" [style]="itemStyle">{{ id }}</div>
            }
          </div>
        </div>
      </div>

      <pre data-name="log">{{ logText() }}</pre>
    </div>
  `,
})
export default class AutoScrollPage {
  protected readonly itemStyle = itemStyle;
  protected readonly scrollListStyle = scrollListStyle;
  protected readonly acceptDropsFrom = ACCEPT_DROPS_FROM;

  protected readonly long = signal(
    Array.from({ length: 30 }, (_, index) => `item-${index}`),
  );
  protected readonly short = signal(['new-1', 'new-2']);
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

  protected readonly onLongDrop: DragListProps['onDrop'] = (
    sortedIndexes,
    options,
  ) => {
    this.log({
      name: 'long.onDrop',
      dragIndex: options.dragIndex,
      dropIndex: options.dropIndex,
    });
    this.long.update((items) => sortedIndexes.map((index) => items[index]));
  };

  protected readonly onLongAcceptDrop: DragListProps['onAcceptDrop'] = (
    options,
  ) => {
    this.log({ name: 'long.onAcceptDrop', ...options });

    this.long.update((items) => {
      const newItems = [...items];
      newItems.splice(options.dropIndex, 0, options.dragItemId);
      return newItems;
    });
  };

  protected readonly onShortDrop: DragListProps['onDrop'] = () => {};

  protected readonly onShortRemove: DragListProps['onRemove'] = (
    sortedIndexes,
    options,
  ) => {
    this.log({ name: 'short.onRemove', dragItemId: options.dragItemId });
    this.short.update((items) => sortedIndexes.map((index) => items[index]));
  };
}
