import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  input,
  signal,
} from '@angular/core';

import {
  DragDropProvider,
  DragItem,
  DragList,
  injectDragDropProvider,
  type DragListProps,
  type DragListRemoveEvent,
} from '@infinite-table/infinite-angular';

type LoggedCall = { name: string; [key: string]: any };

const itemStyle =
  'height: 40px; box-sizing: border-box; border: 1px solid gray; background: white; color: black';

const listStyle = 'width: 200px; height: 240px; background: #eee';

const ACCEPT_DROPS_FROM_SOURCE = ['source'];

// the target takes every item but the one called "locked"
const shouldAcceptDrop: DragListProps['shouldAcceptDrop'] = (event) =>
  event.dragItem.id !== 'locked';

/**
 * The two lists, in a component inside the provider (it injects it).
 */
@Component({
  selector: 'drag-lists',
  imports: [DragList, DragItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="display: flex; gap: 50px">
      <div
        infiniteDragList="source"
        orientation="vertical"
        (dropped)="onSourceDrop($event.sortedIndexes)"
        (removed)="onRemove($event)"
        data-name="source"
        [style]="listStyle"
      >
        @for (id of source(); track id) {
        <div [infiniteDragItem]="id" [style]="itemStyle">{{ id }}</div>
        }
      </div>
      <div
        infiniteDragList="target"
        orientation="vertical"
        [acceptDropsFrom]="acceptDropsFrom"
        [shouldAcceptDrop]="shouldAcceptDrop"
        (dropped)="onTargetDrop($event.sortedIndexes)"
        (dropAccepted)="onAcceptDrop($event)"
        data-name="target"
        [style]="listStyle"
      >
        @for (id of target(); track id) {
        <div [infiniteDragItem]="id" [style]="itemStyle">{{ id }}</div>
        }
      </div>
    </div>
  `,
})
class DragLists {
  readonly log = input.required<(call: LoggedCall) => void>();

  protected readonly itemStyle = itemStyle;
  protected readonly listStyle = listStyle;
  protected readonly acceptDropsFrom = ACCEPT_DROPS_FROM_SOURCE;
  protected readonly shouldAcceptDrop = shouldAcceptDrop;

  protected readonly source = signal(['free', 'locked', 'other']);
  protected readonly target = signal(['t1', 't2']);

  private readonly dragDropProvider = injectDragDropProvider();

  protected readonly onRemove = ({
    sortedIndexes,
    ...options
  }: DragListRemoveEvent) => {
    // the provider still has the state of the drag when the callbacks run
    const { status, dropTargetListId } =
      this.dragDropProvider().getCurrentDragSourceAndTarget();

    this.log()({
      name: 'source.onRemove',
      ...options,
      status,
      dropTargetListId,
    });

    if (status === 'rejected') {
      return;
    }
    this.source.update((items) => sortedIndexes.map((index) => items[index]));
  };

  protected readonly onAcceptDrop: NonNullable<DragListProps['onAcceptDrop']> = (
    options,
  ) => {
    this.log()({ name: 'target.onAcceptDrop', ...options });

    this.target.update((items) => {
      const newItems = [...items];
      newItems.splice(options.dropIndex, 0, options.dragItemId);
      return newItems;
    });
  };

  protected readonly onSourceDrop = (sortedIndexes: number[]) => {
    this.log()({ name: 'source.onDrop', sortedIndexes });
    this.source.update((items) => sortedIndexes.map((index) => items[index]));
  };

  protected readonly onTargetDrop = (sortedIndexes: number[]) => {
    this.log()({ name: 'target.onDrop', sortedIndexes });
  };
}

@Component({
  selector: 'test-page',
  imports: [DragDropProvider, DragLists],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="padding: 20px" [attr.data-ready]="ready()">
      <div infiniteDragDropProvider #dnd="infiniteDragDropProvider">
        <drag-lists [log]="log" />
        <pre data-name="provider-state">{{ providerState(dnd.context()) }}</pre>
      </div>

      <pre data-name="log">{{ logText() }}</pre>
    </div>
  `,
})
export default class RejectedDropPage {
  private readonly calls = signal<LoggedCall[]>([]);
  protected readonly logText = computed(() => JSON.stringify(this.calls()));

  // the specs wait for this before they drag
  protected readonly ready = signal(false);

  constructor() {
    afterNextRender(() => this.ready.set(true));
  }

  protected readonly log = (call: LoggedCall) => {
    this.calls.update((calls) => [...calls, call]);
  };

  protected providerState(context: {
    dragSourceListId: string | null;
    dropTargetListId: string | null;
    dragItemId: string;
    status: string;
  }) {
    const { dragSourceListId, dropTargetListId, dragItemId, status } = context;
    return JSON.stringify({
      dragSourceListId,
      dropTargetListId,
      dragItemId,
      status,
    });
  }
}
