import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  signal,
} from '@angular/core';

import {
  DragDropProvider,
  DragHandle,
  DragItem,
  DragList,
} from '@infinite-table/infinite-angular';

type LoggedCall = { name: string; [key: string]: any };

const itemStyle =
  'height: 40px; box-sizing: border-box; border: 1px solid gray; background: white; color: black';

@Component({
  selector: 'test-page',
  imports: [DragDropProvider, DragList, DragItem, DragHandle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="padding: 20px" [attr.data-ready]="ready()">
      <div infiniteDragDropProvider>
        <div
          infiniteDragList="vertical"
          orientation="vertical"
          (dropped)="onVerticalDrop($event.sortedIndexes, $event)"
          data-name="vertical"
          style="width: 200px"
        >
          @for (id of vertical(); track id) {
          <div [infiniteDragItem]="id" [style]="itemStyle">{{ id }}</div>
          }
        </div>

        <div
          infiniteDragList="horizontal"
          orientation="horizontal"
          dragStrategy="inline"
          (dropped)="onHorizontalDrop($event.sortedIndexes, $event)"
          data-name="horizontal"
          style="display: flex; width: 320px; margin-top: 40px"
        >
          @for (id of horizontal(); track id) {
          <div [infiniteDragItem]="id" [style]="itemStyle + '; width: 80px'">
            {{ id }}
          </div>
          }
        </div>

        <div
          infiniteDragList="with-handle"
          orientation="vertical"
          (dropped)="onWithHandleDrop($event.sortedIndexes, $event)"
          data-name="with-handle"
          style="width: 200px; margin-top: 40px"
        >
          @for (id of withHandle(); track id) {
          <!-- only the handle starts a drag -->
          <div
            [infiniteDragItem]="id"
            [style]="itemStyle + '; display: flex; gap: 10px'"
          >
            <span
              infiniteDragHandle
              data-name="handle"
              style="width: 30px; background: silver"
            ></span>
            <span data-name="label">item {{ id }}</span>
          </div>
          }
        </div>
      </div>

      <pre data-name="log">{{ logText() }}</pre>
    </div>
  `,
})
export default class ReorderPage {
  protected readonly itemStyle = itemStyle;
  protected readonly vertical = signal(['one', 'two', 'three', 'four', 'five']);
  protected readonly horizontal = signal(['a', 'b', 'c', 'd']);
  protected readonly withHandle = signal([1, 2, 3]);
  private readonly log = signal<LoggedCall[]>([]);
  protected readonly logText = computed(() => JSON.stringify(this.log()));

  // the specs wait for this before they drag
  protected readonly ready = signal(false);

  constructor() {
    afterNextRender(() => this.ready.set(true));
  }

  protected readonly onVerticalDrop = (
    sortedIndexes: number[],
    options: object,
  ) => {
    this.log.update((log) => [
      ...log,
      { name: 'vertical.onDrop', sortedIndexes, ...options },
    ]);
    this.vertical.update((items) => sortedIndexes.map((index) => items[index]));
  };

  protected readonly onHorizontalDrop = (
    sortedIndexes: number[],
    options: object,
  ) => {
    this.log.update((log) => [
      ...log,
      { name: 'horizontal.onDrop', sortedIndexes, ...options },
    ]);
    this.horizontal.update((items) =>
      sortedIndexes.map((index) => items[index]),
    );
  };

  protected readonly onWithHandleDrop = (
    sortedIndexes: number[],
    options: object,
  ) => {
    this.log.update((log) => [
      ...log,
      { name: 'with-handle.onDrop', sortedIndexes, ...options },
    ]);
    this.withHandle.update((items) =>
      sortedIndexes.map((index) => items[index]),
    );
  };
}
