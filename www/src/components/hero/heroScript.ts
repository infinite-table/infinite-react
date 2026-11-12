/**
 * The Infinite Table hero show. Each step drives the LIVE grid through its
 * real UI (header clicks, the column menu, header drag, the control bar), with
 * an API fallback if a dispatched event doesn't land, and is skipped if its
 * element isn't there. The grid keeps ticking the whole time.
 */
import {
  assertActive,
  fling,
  sleep,
  tween,
  waitFor,
  type ShowcaseScriptContext,
} from '@thedatagrid/docs-kit/showcase';
import type { HeroView } from './ControlBar';
import type { HeroFeed } from './data/feed';
import type { Instrument } from './data/instruments';
import type { HeroGridApis } from './HeroGrid';
import {
  DEFAULT_DENSITY_ID,
  DEFAULT_THEME_ID,
  SHOW_THEME_SEQUENCE,
} from './themes';

export type HeroController = {
  feed: HeroFeed;
  getApis: () => HeroGridApis | null;
  getState: () => {
    rowCount: number;
    themeId: string;
    view: HeroView;
    building: string | null;
    rows: Instrument[] | null;
    densityId: string;
  };
  setView: (view: HeroView) => void;
  setRowCount: (count: number) => void;
  setThemeId: (id: string) => void;
  setDensityId: (id: string) => void;
  setTicksPerSecond: (rate: number) => void;
  select: (id: number) => void;
};

export type HeroScriptContext = ShowcaseScriptContext & {
  hero: HeroController;
};

const SHOW_ROWS = 10_000;
const BIG_ROWS = 1_000_000;

const q = <E extends HTMLElement = HTMLElement>(
  root: HTMLElement,
  selector: string,
) => root.querySelector<E>(selector);

const headerCell = (root: HTMLElement, columnId: string) =>
  q(root, `.InfiniteHeaderCell[data-column-id="${columnId}"]`);

const control = (root: HTMLElement, name: string, value: string) =>
  q<HTMLButtonElement>(root, `[data-hero-${name}="${value}"]`);

/** Click a control-bar button (real click) with an API fallback. */
async function clickControl(
  ctx: HeroScriptContext,
  name: string,
  value: string,
  fallback: () => void,
  isDone: () => boolean,
) {
  const { root, cursor, signal } = ctx;
  const button = control(root, name, value);
  if (button && !button.disabled) {
    await cursor.moveToElement(button, signal);
    await cursor.click(signal, button);
  }
  const done = await waitFor(isDone, signal, { timeout: 600, interval: 60 });
  if (!done) fallback();
}

async function waitForRows(
  ctx: HeroScriptContext,
  count: number,
  timeout = 20000,
) {
  return waitFor(
    () => {
      const state = ctx.hero.getState();
      return !state.building && state.rows?.length === count;
    },
    ctx.signal,
    { timeout, interval: 100 },
  );
}

// ---------------------------------------------------------------------------
// steps
// ---------------------------------------------------------------------------

/** 1 — sort by change %, twice (asc → desc), rows reorder while ticking. */
async function sortWhileTicking(ctx: HeroScriptContext) {
  const { root, cursor, signal, hero } = ctx;
  const apis = hero.getApis();
  const header = headerCell(root, 'changePct');
  if (!apis || !header) return;
  await cursor.moveToElement(header, signal, { x: -12 });
  for (const dir of [1, -1] as const) {
    await cursor.click(signal, header);
    const sorted = await waitFor(
      () => apis.api.getSortingForColumn('changePct') === dir,
      signal,
      { timeout: 500, interval: 50 },
    );
    if (!sorted) apis.api.setSortingForColumn('changePct', dir);
    await sleep(dir === 1 ? 1300 : 600, signal);
  }
  cursor.setLabel('sorted — and still ticking');
  await sleep(2400, signal);
  cursor.setLabel(null);
}

/** 2 — group by sector through the real column menu → "Group by" → Sector. */
async function groupThroughColumnMenu(ctx: HeroScriptContext) {
  const { root, cursor, signal, hero } = ctx;
  const apis = hero.getApis();
  const header = headerCell(root, 'name');
  if (!apis || !header) return;
  const rect = header.getBoundingClientRect();
  // aim at the right edge of the header, where the menu icon lives
  await cursor.moveToElement(header, signal, { x: rect.width / 2 - 16 });
  await cursor.click(signal);
  // the icon only shows on (real) hover, so open the menu the way it would
  apis.api.getColumnApi('name')?.showContextMenu(header);

  const groupItem = await waitFor(
    () =>
      q(root, '[data-menu-item-key="group-by"][data-menu-col-name="label"]'),
    signal,
    { timeout: 2000 },
  );
  if (groupItem) {
    await sleep(300, signal);
    await cursor.hover(groupItem, signal);
    const sectorCheck = await waitFor(
      () =>
        q(
          root,
          '[data-menu-item-key="sector"][data-menu-col-name="check"] input',
        ) ??
        q(root, '[data-menu-item-key="sector"][data-menu-col-name="check"]'),
      signal,
      { timeout: 1500 },
    );
    if (sectorCheck) {
      await sleep(250, signal);
      await cursor.moveToElement(sectorCheck, signal);
      await cursor.click(signal, sectorCheck);
    }
  }
  const grouped = await waitFor(() => hero.getState().view !== 'flat', signal, {
    timeout: 900,
    interval: 60,
  });
  await sleep(500, signal);
  apis.api.getColumnApi('name')?.hideContextMenu();
  apis.api.hideContextMenu();
  if (!grouped) hero.setView('grouped');
  await sleep(300, signal);
  // drift over a group row to point at the live aggregates
  const groupRow = q(root, '.InfiniteColumnCell[data-column-id="dayPnl"]');
  if (groupRow) await cursor.moveToElement(groupRow, signal);
  cursor.setLabel('live aggregations per sector');
  await sleep(2600, signal);
  cursor.setLabel(null);
}

/** 3 — pivot by asset class (sector rows × asset-class columns), then back. */
async function pivot(ctx: HeroScriptContext) {
  const { hero, signal } = ctx;
  await clickControl(
    ctx,
    'view',
    'pivot',
    () => hero.setView('pivot'),
    () => hero.getState().view === 'pivot',
  );
  ctx.cursor.setLabel('pivot: sector × asset class');
  await sleep(3200, signal);
  ctx.cursor.setLabel(null);
  await clickControl(
    ctx,
    'view',
    'flat',
    () => hero.setView('flat'),
    () => hero.getState().view === 'flat',
  );
  await sleep(900, signal);
}

/** 4 — drag the Day P&L header next to Symbol. */
async function dragReorder(ctx: HeroScriptContext) {
  const { root, cursor, signal, hero } = ctx;
  const apis = hero.getApis();
  if (!apis) return;
  const source = await waitFor(() => headerCell(root, 'dayPnl'), signal, {
    timeout: 1500,
  });
  const anchor = headerCell(root, 'name');
  if (!source || !anchor) return;
  const anchorRect = anchor.getBoundingClientRect();
  const to = cursor.centerOf(anchor, { x: -anchorRect.width / 2 + 14 });
  await cursor.drag(source, to, signal, { duration: 1200 });
  await sleep(250, signal);
  const order = apis.api.getColumnOrder();
  if (order.indexOf('dayPnl') > order.indexOf('name')) {
    const next = order.filter((id) => id !== 'dayPnl');
    next.splice(next.indexOf('name'), 0, 'dayPnl');
    apis.api.setColumnOrder(next);
  }
  await sleep(1200, signal);
}

/** 5 — a hard horizontal trackpad fling: header and body move as one. */
async function horizontalFling(ctx: HeroScriptContext) {
  const { root, cursor, signal, hero } = ctx;
  const apis = hero.getApis();
  const body = q(root, '.InfiniteBody') ?? q(root, '.InfiniteColumnCell');
  if (!apis || !body) return;
  await cursor.moveToElement(body, signal, { y: -40 });
  cursor.setLabel('⇢ fast horizontal scroll — the header never lags');
  const api = apis.api;
  const right = (delta: number) => {
    const max = api.scrollLeftMax;
    api.scrollLeft = Math.max(0, Math.min(max, api.scrollLeft + delta));
    return api.scrollLeft > 0 && api.scrollLeft < max;
  };
  await fling(right, { velocity: 4.2, friction: 0.962 }, signal);
  await sleep(600, signal);
  await fling(right, { velocity: -4.6, friction: 0.962 }, signal);
  cursor.setLabel(null);
  await sleep(600, signal);
}

/** 6 — 1M rows, then fling down through them. */
async function millionRows(ctx: HeroScriptContext) {
  const { root, cursor, signal, hero } = ctx;
  if (!control(root, 'rows', String(BIG_ROWS))) return;
  let apis = hero.getApis();
  if (!apis) return;
  // unsort first (third click on the header): re-sorting 1M rows on every
  // commit is not what this step is about
  if (apis.api.getSortingForColumn('changePct') != null) {
    const header = headerCell(root, 'changePct');
    if (header) {
      await cursor.moveToElement(header, signal, { x: -12 });
      await cursor.click(signal, header);
    }
    const unsorted = await waitFor(
      () => apis!.api.getSortingForColumn('changePct') == null,
      signal,
      {
        timeout: 500,
      },
    );
    if (!unsorted) apis.dataSourceApi.setSortInfo(null);
    await sleep(400, signal);
  }
  await clickControl(
    ctx,
    'rows',
    String(BIG_ROWS),
    () => hero.setRowCount(BIG_ROWS),
    () => hero.getState().rowCount === BIG_ROWS,
  );
  cursor.setLabel('building 1,000,000 rows…');
  const ready = await waitForRows(ctx, BIG_ROWS, 25000);
  if (!ready) {
    cursor.setLabel(null);
    return;
  }
  await sleep(900, signal);
  apis = hero.getApis();
  const body = q(root, '.InfiniteBody') ?? q(root, '.InfiniteColumnCell');
  if (!apis || !body) return;
  await cursor.moveToElement(body, signal);
  cursor.setLabel('1,000,000 rows · fling ⇣');
  const api = apis.api;
  const down = (delta: number) => {
    const max = api.scrollTopMax;
    api.scrollTop = Math.max(0, Math.min(max, api.scrollTop + delta));
    return api.scrollTop < max;
  };
  await fling(down, { velocity: 6, friction: 0.965 }, signal);
  await sleep(500, signal);
  await fling(
    down,
    { velocity: 40, friction: 0.972, maxDuration: 2600 },
    signal,
  );
  await sleep(1200, signal);
  // and back to the top
  const from = api.scrollTop;
  await tween((t) => (api.scrollTop = from * (1 - t)), 900, signal);
  cursor.setLabel(null);
  await sleep(400, signal);
  await clickControl(
    ctx,
    'rows',
    String(SHOW_ROWS),
    () => hero.setRowCount(SHOW_ROWS),
    () => hero.getState().rowCount === SHOW_ROWS,
  );
  await waitForRows(ctx, SHOW_ROWS);
  await sleep(600, signal);
}

/** 7 — walk through the themes, ending back on the default. */
async function cycleThemes(ctx: HeroScriptContext) {
  const { hero, signal } = ctx;
  for (const id of SHOW_THEME_SEQUENCE) {
    await clickControl(
      ctx,
      'theme',
      id,
      () => hero.setThemeId(id),
      () => hero.getState().themeId === id,
    );
    await sleep(id === DEFAULT_THEME_ID ? 600 : 1500, signal);
  }
}

// ---------------------------------------------------------------------------

/** One full pass of the show. */
export async function runHeroScript(ctx: HeroScriptContext) {
  const { root, cursor, signal } = ctx;
  cursor.show();
  await sleep(400, signal);

  await sortWhileTicking(ctx);
  await groupThroughColumnMenu(ctx);
  await pivot(ctx);
  await dragReorder(ctx);
  await horizontalFling(ctx);
  await millionRows(ctx);
  await cycleThemes(ctx);

  assertActive(signal);
  // wander off and admire the result
  await cursor.moveTo(
    { x: root.clientWidth * 0.62, y: root.clientHeight * 0.86 },
    signal,
  );
  await sleep(800, signal);
  cursor.hide();
}

/** Put the hero back to its initial state so the show can loop. */
export async function resetHeroState(ctx: HeroScriptContext) {
  const { hero } = ctx;
  const apis = hero.getApis();
  apis?.api.getColumnApi('name')?.hideContextMenu();
  apis?.api.hideContextMenu();
  hero.setView('flat');
  hero.setThemeId(DEFAULT_THEME_ID);
  hero.setDensityId(DEFAULT_DENSITY_ID);
  if (hero.getState().rowCount !== SHOW_ROWS) {
    hero.setRowCount(SHOW_ROWS);
    await waitForRows(ctx, SHOW_ROWS);
  }
  if (apis && !apis.api.isDestroyed()) {
    apis.dataSourceApi.setSortInfo(null);
    // `true` = the natural order of the columns object
    apis.api.setColumnOrder(true);
    apis.api.scrollTop = 0;
    apis.api.scrollLeft = 0;
  }
}
