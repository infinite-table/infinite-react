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
  ref: React.RefCallback<HTMLElement | undefined>;
}
