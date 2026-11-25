/**
 * Framework-neutral types of the drag and drop between drag lists.
 *
 * The DragDropProvider of each framework (DragDropProvider.tsx,
 * DragDropProvider.vue.ts, ...) re-exports them, and shared modules import
 * them from here so they never reach a framework's provider component.
 */
export type DragDropSourceAndTarget = {
  dragSourceListId: string | null;
  dropTargetListId: string | null;
  dragItemId: string;
  status: 'accepted' | 'rejected';
};

export type DragDropProviderContextValue = DragDropSourceAndTarget & {
  updateDragOperationSourceAndTarget: (params: DragDropSourceAndTarget) => void;
  getCurrentDragSourceAndTarget: () => DragDropSourceAndTarget;
};
