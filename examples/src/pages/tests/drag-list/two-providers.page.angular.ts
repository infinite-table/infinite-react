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
type ListName = 'first' | 'second';

const itemStyle =
  'height: 40px; box-sizing: border-box; border: 1px solid gray; background: white; color: black';

const LIST_NAMES: ListName[] = ['first', 'second'];

type ListCallbacks = {
  onDrop: DragListProps['onDrop'];
  onRemove: NonNullable<DragListProps['onRemove']>;
  onAcceptDrop: NonNullable<DragListProps['onAcceptDrop']>;
};

// A provider with one list in it, twice. Both lists have items with the
// same ids, the lists themselves have different ids.
@Component({
  selector: 'test-page',
  imports: [DragDropProvider, DragList, DragItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="padding: 20px" [attr.data-ready]="ready()">
      <div style="display: flex; gap: 50px">
        @for (name of listNames; track name) {
        <ng-container infiniteDragDropProvider>
          <div
            [infiniteDragList]="name"
            orientation="vertical"
            (dropped)="callbacks[name].onDrop($event.sortedIndexes, $event)"
            (removed)="callbacks[name].onRemove($event.sortedIndexes, $event)"
            (dropAccepted)="callbacks[name].onAcceptDrop($event)"
            [attr.data-name]="name"
            style="width: 200px; height: 240px; background: #eee"
          >
            @for (id of lists()[name]; track id) {
            <div [infiniteDragItem]="id" [style]="itemStyle">{{ id }}</div>
            }
          </div>
        </ng-container>
        }
      </div>

      <pre data-name="log">{{ logText() }}</pre>
    </div>
  `,
})
export default class TwoProvidersPage {
  protected readonly itemStyle = itemStyle;
  protected readonly listNames = LIST_NAMES;
  protected readonly lists = signal<Record<ListName, string[]>>({
    first: ['a', 'b', 'c'],
    second: ['a', 'b', 'c'],
  });
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

  private setItems(name: ListName, update: (items: string[]) => string[]) {
    this.lists.update((lists) => ({ ...lists, [name]: update(lists[name]) }));
  }

  protected readonly callbacks = Object.fromEntries(
    LIST_NAMES.map((name): [ListName, ListCallbacks] => [
      name,
      {
        onDrop: (sortedIndexes, options) => {
          this.log({ name: `${name}.onDrop`, dragItemId: options.dragItemId });
          this.setItems(name, (items) =>
            sortedIndexes.map((index) => items[index]),
          );
        },
        onRemove: (sortedIndexes, options) => {
          this.log({
            name: `${name}.onRemove`,
            dragItemId: options.dragItemId,
          });
          this.setItems(name, (items) =>
            sortedIndexes.map((index) => items[index]),
          );
        },
        onAcceptDrop: (options) => {
          this.log({
            name: `${name}.onAcceptDrop`,
            dragItemId: options.dragItemId,
          });
        },
      },
    ]),
  ) as Record<ListName, ListCallbacks>;
}
