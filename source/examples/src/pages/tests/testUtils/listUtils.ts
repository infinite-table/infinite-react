import { VirtualBrain } from '@src/components/VirtualBrain';
import { ElementHandle } from 'puppeteer';
// import { wait } from '.';

export const withBrain = async (fn: (brain: VirtualBrain) => void) => {
  const handle = await page.evaluateHandle(() => {
    return (window as any).brain;
  }, fn as any);

  return await (await page.evaluateHandle(fn, handle)).jsonValue();
};

export const sortElements = async (elements: ElementHandle[]) => {
  let indexes: number[] = await Promise.all(
    elements.map(
      (el: ElementHandle) =>
        el.evaluate((el) => Number(el.getAttribute('data-item-index'))),
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

export const getElements = async (root?: ElementHandle | string | null) => {
  if (typeof root === 'string') {
    root = await page.$(root);
  }
  const source = root || page;
  let els = await source.$$('[data-item-index]');

  return sortElements(els);
};

export const mapElements = async (
  fn: (el: HTMLElement) => any,
  root?: ElementHandle | string,
) => {
  const els = await getElements(root);

  return Promise.all(
    els.map(
      async (el: ElementHandle) =>
        await (await page.evaluateHandle(fn, el)).jsonValue(),
    ),
  );
};
