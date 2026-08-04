import { ElementRefCallback } from '../types/DOMTypes';
import { Renderable } from '../types/Renderable';

/**
 * This is only used for rendering Detail rows in a master-detail DataGrid
 */
export interface ListRowInterface {
  debugId: string;
  update(content: Renderable): void;
  getElement(): HTMLElement | null;
  getNode(): Renderable;
  destroy(): void;
  onMount(callback: (row: ListRowInterface) => void): void;
  isMounted(): boolean;
  ref: ElementRefCallback;
}

/**
 * The framework-neutral contract for a pool of list rows (used for
 * master-detail rows). Same pooling model as GridCellPool; each framework
 * provides its own implementation (React: ListRowPoolForReact).
 */
export interface ListRowPool {
  poolSize: number;

  attachRow(row?: ListRowInterface): ListRowInterface;
  detachRow(row: ListRowInterface): boolean;
  getDetachedRow(): ListRowInterface;

  getAttachedRows(): Set<ListRowInterface>;
  getDetachedRows(): Set<ListRowInterface>;
  getAllRows(): Set<ListRowInterface>;

  onRemoveRow(callback: (row: ListRowInterface) => void): VoidFunction;
  onRowAttachmentChange(
    callback: (row: ListRowInterface, attached: boolean) => void,
  ): VoidFunction;

  reset(): void;
  destroy(): void;
}
