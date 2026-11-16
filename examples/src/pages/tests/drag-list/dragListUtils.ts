import { Locator, Page } from '@testing';

/**
 * Helpers for the specs of the standalone DragList.
 *
 * The test pages give every list a `data-name` and write the calls of the
 * DragList callbacks, as JSON, in an element with `data-name="log"`.
 */

export const getList = (page: Page, name: string) =>
  page.locator(`[data-name="${name}"]`);

export const getItem = (page: Page, listName: string, itemId: string) =>
  getList(page, listName).locator(`[data-drag-item-id="${itemId}"]`);

/** The ids of the items of a list, in DOM order. */
export const getOrder = (page: Page, listName: string) =>
  getList(page, listName)
    .locator('[data-drag-item-id]')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-drag-item-id')),
    );

export type LoggedCall = { name: string; [key: string]: any };

/** The calls of the DragList callbacks so far. */
export const getLog = async (page: Page): Promise<LoggedCall[]> =>
  JSON.parse(await page.locator('[data-name="log"]').innerText());

/** The inline transform the drag list has set on an item. */
export const getInlineTransform = (item: Locator) =>
  item.evaluate((node) => (node as HTMLElement).style.transform);

/** The default drag proxy: a clone of the dragged item, in document.body. */
export const getDefaultProxy = (page: Page) =>
  page.locator('body > .DraggableItem');

/**
 * Presses on the center of `from`, moves the pointer by `by` and releases.
 *
 * `whileDragging` runs before the release, with the pointer still down.
 */
export async function dragBy(
  page: Page,
  from: Locator,
  by: { x: number; y: number },
  whileDragging?: () => Promise<void>,
) {
  const box = (await from.boundingBox())!;
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + by.x, start.y + by.y, { steps: 5 });

  if (whileDragging) {
    await whileDragging();
  }

  await page.mouse.up();
}
