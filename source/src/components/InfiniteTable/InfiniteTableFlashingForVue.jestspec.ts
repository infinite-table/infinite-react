/**
 * @jest-environment jsdom
 *
 * Phase 3d validation: cell flashing for the Vue table.
 *
 * - FlashingColumnCellForVue (column.components.ColumnCell) flashes the
 *   cell when the value changes (via dataSourceApi.updateData)
 * - direction-aware classes (up/down) + flash-duration CSS var, removed
 *   after the flash duration
 */
import { createApp, defineComponent, h, nextTick } from 'vue';
import type { App } from 'vue';

import { DataSource } from '../DataSource/DataSourceForVue.vue';
import { InfiniteTable } from './InfiniteTableForVue.vue';
import { createFlashingColumnCellComponent } from './components/InfiniteTableRow/FlashingColumnCellForVue.vue';
import { FlashingColumnCellRecipe } from './components/cell.css';

type Person = {
  id: number;
  name: string;
  age: number;
};

const people: Person[] = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  name: `person-${i}`,
  age: 20 + i,
}));

const VIEWPORT = { width: 400, height: 300 };
const FLASH_DURATION = 60;

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = ResizeObserverMock;

async function flush(ms = 30) {
  await nextTick();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, ms));
  await nextTick();
}

const allUp = FlashingColumnCellRecipe({ direction: 'up' }).split(' ');
const allDown = FlashingColumnCellRecipe({ direction: 'down' }).split(' ');

// the recipe shares a base class between directions - only compare the
// direction-specific classes
const FLASH_UP_CLASSES = allUp.filter((cls) => !allDown.includes(cls));
const FLASH_DOWN_CLASSES = allDown.filter((cls) => !allUp.includes(cls));

describe('Vue InfiniteTable cell flashing', () => {
  let container: HTMLElement;
  let app: App | null = null;

  const mount = async (flashClassName?: string) => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const FlashingCell = createFlashingColumnCellComponent({
      flashDuration: FLASH_DURATION,
      flashClassName,
    });

    const Root = defineComponent({
      setup() {
        return () =>
          h(DataSource, { primaryKey: 'id', data: people } as any, {
            default: () =>
              h(InfiniteTable, {
                columns: {
                  name: { field: 'name', header: 'Name' },
                  age: {
                    field: 'age',
                    header: 'Age',
                    components: { ColumnCell: FlashingCell },
                  },
                },
              } as any),
          });
      },
    });

    app = createApp(Root);
    app.mount(container);
    await flush();

    const getState = (globalThis as any).getState;
    const actions = (globalThis as any).componentActions;
    actions.bodySize = { ...VIEWPORT };
    getState().brain.update(VIEWPORT);
    await flush();
  };

  afterEach(async () => {
    app?.unmount();
    app = null;
    container.remove();
    await flush(10);
  });

  const ageCell = (rowId: number) =>
    container.querySelector(
      `[data-column-id="age"][data-row-id="${rowId}"]`,
    ) as HTMLElement | null;

  const updateAge = async (id: number, age: number) => {
    await (globalThis as any).dataSourceApi.updateData({ id, age });
    await flush(10);
  };

  const hasAnyClass = (el: HTMLElement, classes: string[]) =>
    classes.some((cls) => el.classList.contains(cls));

  test('no flash initially, flashes up on increase, clears after duration', async () => {
    await mount();

    const cell = ageCell(3)!;
    expect(cell).not.toBeNull();
    expect(hasAnyClass(cell, FLASH_UP_CLASSES)).toBe(false);

    await updateAge(3, 100);

    expect(hasAnyClass(ageCell(3)!, FLASH_UP_CLASSES)).toBe(true);
    expect(hasAnyClass(ageCell(3)!, FLASH_DOWN_CLASSES)).toBe(false);

    // other rows don't flash
    expect(hasAnyClass(ageCell(4)!, FLASH_UP_CLASSES)).toBe(false);

    await flush(FLASH_DURATION + 30);

    expect(hasAnyClass(ageCell(3)!, FLASH_UP_CLASSES)).toBe(false);
  });

  test('flashes down on decrease', async () => {
    await mount();

    await updateAge(5, 1);

    expect(hasAnyClass(ageCell(5)!, FLASH_DOWN_CLASSES)).toBe(true);
    expect(hasAnyClass(ageCell(5)!, FLASH_UP_CLASSES)).toBe(false);
  });

  test('custom flashClassName is applied too', async () => {
    await mount('my-flash');

    await updateAge(2, 100);

    expect(ageCell(2)!.classList.contains('my-flash')).toBe(true);

    await flush(FLASH_DURATION + 30);
    expect(ageCell(2)!.classList.contains('my-flash')).toBe(false);
  });
});
