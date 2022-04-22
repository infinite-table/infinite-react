import { ElementHandle, Page } from '@playwright/test';
import type { VirtualBrain } from '@src/components/VirtualBrain';
// import { ElementHandle } from 'puppeteer';
// import { wait } from '.';

export const withBrain = async (
  fn: (brain: VirtualBrain) => void,
  { page }: { page: Page },
) => {
  const handle = await page.evaluateHandle(() => {
    return (window as any).brain;
  });
  // return 1;

  return await (await page.evaluateHandle(fn, handle)).jsonValue();
};

export const sortElements = async (
  elements: ElementHandle<HTMLElement | SVGElement>[],
  type: 'row' | 'col' | string = 'row',
) => {
  const indexes: number[] = await Promise.all(
    elements.map(
      (el: ElementHandle<HTMLElement | SVGElement>) =>
        el.evaluate(
          (el, type) => Number(el.getAttribute(`data-${type}-index`)),
          type,
        ),
      // el.evaluate((el) => el.outerHTML),
    ),
  );

  const map = new Map<ElementHandle, number>();

  elements.forEach(async (_el: ElementHandle, i: number) => {
    map.set(_el, indexes[i]);
  });

  const result = [...elements].sort((e1: ElementHandle, e2: ElementHandle) => {
    const i1 = map.get(e1) ?? 0;
    const i2 = map.get(e2) ?? 0;

    return i1 - i2;
  });

  return result;
};

export const getElements = async (
  root: ElementHandle<HTMLElement> | string | null | undefined,
  type: 'row' | 'col' | string,
  { page }: { page: Page },
) => {
  if (typeof root === 'string') {
    //@ts-ignore
    root = await page.$(root);
  }
  const source = (root || page) as ElementHandle<HTMLElement>;
  const els = await source.$$(`[data-${type}-index]`);

  return sortElements(els, type);
};

/**
 * @deprecated
 */
export const mapElements = async (
  fn: (el: HTMLElement) => any,
  root: ElementHandle<HTMLElement> | string | null | undefined,
  { page }: { page: Page },
) => {
  const els = await getElements(root, 'row', { page });

  return Promise.all(
    els.map(async (el: ElementHandle) => {
      //@ts-ignore
      return await (await page.evaluateHandle(fn, el)).jsonValue();
    }),
  );
};

export const mapRowElements = async (
  fn: (el: HTMLElement) => any,
  root: ElementHandle<HTMLElement> | string | null | undefined,
  { page }: { page: Page },
) => {
  const els = await getElements(root, 'row', { page });

  return Promise.all(
    els.map(async (el: ElementHandle) => {
      //@ts-ignore
      return await (await page.evaluateHandle(fn, el)).jsonValue();
    }),
  );
};

export const mapListElements = async (
  fn: (el: HTMLElement) => any,
  root: ElementHandle<HTMLElement> | string | null | undefined,
  { page }: { page: Page },
) => {
  const els = await getElements(root, 'item', { page });

  return Promise.all(
    els.map(async (el: ElementHandle) => {
      //@ts-ignore
      return await (await page.evaluateHandle(fn, el)).jsonValue();
    }),
  );
};
