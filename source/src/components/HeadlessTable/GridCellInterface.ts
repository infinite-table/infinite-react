import { ElementRefCallback } from '../types/DOMTypes';
import { Renderable } from '../types/Renderable';

export interface GridCellInterface<T_ADDITIONAL_CELL_INFO = any> {
  debugId: string;
  update(content: Renderable, additionalInfo?: T_ADDITIONAL_CELL_INFO): void;
  getElement(): HTMLElement | null;
  getNode(): Renderable;
  destroy(): void;
  onMount(
    callback: (cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>) => void,
  ): void;
  getAdditionalInfo(): T_ADDITIONAL_CELL_INFO | undefined;
  isMounted(): boolean;
  ref: ElementRefCallback;
  setPendingAfterCommitWork(fn: (() => void) | null): void;
  flushPendingAfterCommitWork(): void;
}

/**
 * The framework-neutral contract for a pool of grid cells.
 *
 * A pool owns cell instances (attached ones render an x,y position in the
 * grid; detached ones wait to be reused) but is not aware of cell positions —
 * that's the GridCellManager's job. Each framework provides its own
 * implementation (React: GridCellPoolForReact); the composition point that
 * picks the implementation is createRenderer.
 */
export interface GridCellPool<T_ADDITIONAL_CELL_INFO = any> {
  poolSize: number;

  attachCell(
    cell?: GridCellInterface<T_ADDITIONAL_CELL_INFO>,
  ): GridCellInterface<T_ADDITIONAL_CELL_INFO>;
  detachCell(cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>): boolean;
  getDetachedCell(): GridCellInterface<T_ADDITIONAL_CELL_INFO>;

  getAttachedCells(): Set<GridCellInterface<T_ADDITIONAL_CELL_INFO>>;
  getDetachedCells(): Set<GridCellInterface<T_ADDITIONAL_CELL_INFO>>;
  getAllCells(): Set<GridCellInterface<T_ADDITIONAL_CELL_INFO>>;

  onRemoveCell(
    callback: (cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>) => void,
  ): VoidFunction;
  onCellAttachmentChange(
    callback: (
      cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>,
      attached: boolean,
    ) => void,
  ): VoidFunction;

  reset(): void;
  destroy(): void;
  flushPendingAfterCommitWork(): void;
}
