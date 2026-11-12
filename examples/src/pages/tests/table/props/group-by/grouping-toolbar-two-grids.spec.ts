import { test, expect, Page } from '@testing';

type GridName = 'first' | 'second';

const grid = (page: Page, name: GridName) =>
  page.locator(`[data-name="${name}"]`);

async function getGroupBy(page: Page) {
  const groupByOf = (name: GridName) =>
    grid(page, name).locator('[data-name="group-by"]').innerText();

  return {
    first: await groupByOf('first'),
    second: await groupByOf('second'),
  };
}

/**
 * Drags the header of a column to the grouping toolbar of a grid
 * (which can be another grid than the one the column is in).
 */
async function dragColumnToGroupingToolbar(
  page: Page,
  params: { from: GridName; columnId: string; to: GridName },
) {
  const header = grid(page, params.from).locator(
    `.InfiniteHeader [data-column-id="${params.columnId}"]`,
  );
  const toolbar = grid(page, params.to).locator(
    '[data-drag-list-id^="grouping-toolbar"]',
  );

  const from = (await header.boundingBox())!;
  const to = (await toolbar.boundingBox())!;

  const start = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
  const end = { x: to.x + 60, y: to.y + to.height / 2 };

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x, start.y - 5);
  await page.mouse.move(end.x, end.y, { steps: 4 });
  await page.mouse.up();
}

export default test.describe('Two grids with grouping toolbars on a page', () => {
  test('dragging a column header to the toolbar groups the grid of that column', async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'warning' || message.type() === 'error') {
        warnings.push(message.text());
      }
    });

    await page.waitForInfinite();

    expect(await getGroupBy(page)).toEqual({ first: 'none', second: 'none' });

    await dragColumnToGroupingToolbar(page, {
      from: 'first',
      columnId: 'country',
      to: 'first',
    });

    await expect
      .poll(() => getGroupBy(page))
      .toEqual({ first: 'country', second: 'none' });

    // `stack` is a column of the second grid only
    await dragColumnToGroupingToolbar(page, {
      from: 'second',
      columnId: 'stack',
      to: 'second',
    });

    await expect
      .poll(() => getGroupBy(page))
      .toEqual({ first: 'country', second: 'stack' });

    expect(
      warnings.filter((text) => text.includes('DragInteractionTarget')),
    ).toEqual([]);
  });

  test('a column header cannot be dropped on the toolbar of the other grid', async ({
    page,
  }) => {
    await page.waitForInfinite();

    // both grids have this column
    await dragColumnToGroupingToolbar(page, {
      from: 'second',
      columnId: 'country',
      to: 'first',
    });

    await page.waitForTimeout(50);

    expect(await getGroupBy(page)).toEqual({ first: 'none', second: 'none' });

    // and the grids still work after that
    await dragColumnToGroupingToolbar(page, {
      from: 'second',
      columnId: 'stack',
      to: 'second',
    });

    await expect
      .poll(() => getGroupBy(page))
      .toEqual({ first: 'none', second: 'stack' });
  });

  test('a pointer down and up in the same task leave no drag target registered', async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'warning') {
        warnings.push(message.text());
      }
    });

    await page.waitForInfinite();

    // events dispatched from a script - the pointer up comes
    // before the grid had the chance to re-render
    const registeredTargets = await page.evaluate(() => {
      const cell = document.querySelector(
        '[data-name="first"] .InfiniteHeader [data-column-id="age"]',
      ) as HTMLElement;
      const rect = cell.getBoundingClientRect();

      // a made-up pointer cannot be captured
      cell.setPointerCapture = () => {};
      cell.releasePointerCapture = () => {};

      const eventInit: PointerEventInit = {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        isPrimary: true,
        button: 0,
        clientX: rect.left + 10,
        clientY: rect.top + 10,
      };
      const getRegisteredCount = () =>
        (globalThis as any).DragManager.dragInteractionTargetsMap.size;

      const click = () => {
        cell.dispatchEvent(new PointerEvent('pointerdown', eventInit));
        const whileDown = getRegisteredCount();
        cell.dispatchEvent(new PointerEvent('pointerup', eventInit));

        return { whileDown, afterUp: getRegisteredCount() };
      };

      return [click(), click()];
    });

    // while the pointer is down: the header of the first grid
    // and its grouping toolbar, which takes drops from that header
    expect(registeredTargets).toEqual([
      { whileDown: 2, afterUp: 0 },
      { whileDown: 2, afterUp: 0 },
    ]);

    expect(
      warnings.filter((text) => text.includes('DragInteractionTarget')),
    ).toEqual([]);
  });
});
