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
  injectDragDropProvider,
  injectDragList,
  type DragListProps,
} from '@infinite-table/infinite-angular';

type LoggedCall = { name: string; [key: string]: any };
type ListName = 'left' | 'right';

const itemStyle =
  'height: 40px; box-sizing: border-box; border: 1px solid gray; background: white; color: black';

const ACCEPT_DROPS_FROM = ['left', 'right'];
const LIST_NAMES: ListName[] = ['left', 'right'];

/**
 * Shows what injectDragDropProvider gives.
 */
@Component({
  selector: 'provider-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<pre data-name="provider-state">{{ text() }}</pre>`,
})
class ProviderState {
  private readonly dragDropProvider = injectDragDropProvider();

  protected readonly text = computed(() => {
    const { dragSourceListId, dropTargetListId, dragItemId, status } =
      this.dragDropProvider();

    return JSON.stringify({
      dragSourceListId,
      dropTargetListId,
      dragItemId,
      status,
    });
  });
}

/**
 * Shows what injectDragList gives, inside a list.
 */
@Component({
  selector: 'list-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<pre [attr.data-name]="'list-state-' + dragList().dragListId">{{
    text()
  }}</pre>`,
})
class ListState {
  protected readonly dragList = injectDragList();

  protected readonly text = computed(() => {
    const {
      dragListId,
      draggingInProgress,
      dragSourceListId,
      dropTargetListId,
    } = this.dragList();

    return JSON.stringify({
      dragListId,
      draggingInProgress,
      dragSourceListId,
      dropTargetListId,
    });
  });
}

type ListCallbacks = {
  onDrop: DragListProps['onDrop'];
  onRemove: NonNullable<DragListProps['onRemove']>;
  onAcceptDrop: NonNullable<DragListProps['onAcceptDrop']>;
};

@Component({
  selector: 'test-page',
  imports: [DragDropProvider, DragList, DragItem, ProviderState, ListState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="padding: 20px" [attr.data-ready]="ready()">
      <div infiniteDragDropProvider>
        <div style="display: flex; gap: 50px">
          @for (name of listNames; track name) {
          <div style="width: 200px">
            <!-- injectDragList() works inside the list element: the
                   list state is rendered in it, after the items -->
            <div
              [infiniteDragList]="name"
              orientation="vertical"
              [acceptDropsFrom]="acceptDropsFrom"
              [onDrop]="callbacks[name].onDrop"
              [onRemove]="callbacks[name].onRemove"
              [onAcceptDrop]="callbacks[name].onAcceptDrop"
              [attr.data-name]="name"
              style="height: 240px; background: #eee"
            >
              @for (id of lists()[name]; track id) {
              <div [infiniteDragItem]="id" [style]="itemStyle">
                {{ id }}
              </div>
              }
              <list-state />
            </div>
          </div>
          }
        </div>
        <provider-state />
      </div>

      <pre data-name="log">{{ logText() }}</pre>
    </div>
  `,
})
export default class TwoListsPage {
  protected readonly itemStyle = itemStyle;
  protected readonly listNames = LIST_NAMES;
  protected readonly acceptDropsFrom = ACCEPT_DROPS_FROM;

  protected readonly lists = signal<Record<ListName, string[]>>({
    left: ['a', 'b', 'c'],
    right: ['x', 'y', 'z'],
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
          this.log({ name: `${name}.onDrop`, sortedIndexes, ...options });
          this.setItems(name, (items) =>
            sortedIndexes.map((index) => items[index]),
          );
        },
        onRemove: (sortedIndexes, options) => {
          this.log({ name: `${name}.onRemove`, sortedIndexes, ...options });
          this.setItems(name, (items) =>
            sortedIndexes.map((index) => items[index]),
          );
        },
        onAcceptDrop: (options) => {
          this.log({ name: `${name}.onAcceptDrop`, ...options });
          this.setItems(name, (items) => {
            const newItems = [...items];
            newItems.splice(options.dropIndex, 0, options.dragItemId);
            return newItems;
          });
        },
      },
    ]),
  ) as Record<ListName, ListCallbacks>;
}
