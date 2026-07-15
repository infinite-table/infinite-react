/**
 * Framework-neutral DOM utilities for the Menu component (shared by the
 * React Menu.tsx and the Vue MenuForVue.vue.ts).
 */
import { Rectangle } from '../../utils/pageGeometry/Rectangle';
import { selectParent } from '../../utils/selectParent';

/**
 * @param menuId The menu id
 * @param itemKey the item key
 * @returns Rectangle
 */
export function getMenuItemRect(menuId: string, itemKey: string) {
  const cells = getMenuItemNodes(menuId, itemKey);
  if (!cells.length) {
    return null;
  }
  const first = Rectangle.from(cells[0]?.getBoundingClientRect());
  const last = Rectangle.from(cells[cells.length - 1].getBoundingClientRect());

  const rect = first;
  rect.width = last.left + last.width - first.left;

  return rect;
}

export function getMenuItemNodes(
  menuId: string,
  itemKey: string,
): HTMLDivElement[] {
  const menuNode = selectParent(
    document.querySelector(
      `[data-menu-id="${menuId}"] [data-menu-item-key="${itemKey}"]`,
    ) as HTMLElement,
    `[data-menu-id="${menuId}"]`,
  );

  if (!menuNode) {
    return [];
  }

  const cells = menuNode.querySelectorAll(`[data-menu-item-key="${itemKey}"]`);

  return Array.from(cells) as HTMLDivElement[];
}

export function getFirstCheckBoxInsideMenuItem(
  menuId: string,
  itemKey: string,
) {
  const cells = getMenuItemNodes(menuId, itemKey);
  if (!cells.length) {
    return null;
  }

  for (const cell of cells) {
    const input = cell.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement | null;
    if (input) {
      return input;
    }
  }
  return null;
}
