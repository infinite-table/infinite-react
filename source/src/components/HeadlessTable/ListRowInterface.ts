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
  ref: (htmlElement: HTMLElement) => void;
}
