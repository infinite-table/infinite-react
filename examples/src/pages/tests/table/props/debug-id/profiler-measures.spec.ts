import { test, expect, Page } from '@testing';

const UPDATES = 25;

const TRACK_GROUP = 'Infinite Table (profiled)';

const USER_MEASURE_NAME = 'Sort';

/**
 * Counts the measures that are still in the performance timeline of the page:
 * the ones made by the grid, for its profiler tracks, and the one made by the
 * page itself (it has the name of one of the grid entries).
 */
async function getRetainedMeasures(page: Page) {
  return await page.evaluate(
    ({ trackGroup, userMeasureName }) => {
      const measures = performance.getEntriesByType(
        'measure',
      ) as PerformanceMeasure[];

      return {
        fromGrid: measures.filter(
          (measure) => measure.detail?.devtools?.trackGroup === trackGroup,
        ).length,
        fromPage: performance.getEntriesByName(userMeasureName, 'measure')
          .length,
      };
    },
    { trackGroup: TRACK_GROUP, userMeasureName: USER_MEASURE_NAME },
  );
}

async function update(page: Page, times: number) {
  await page.evaluate(async (times) => {
    const button = document.querySelector('button')!;

    for (let i = 0; i < times; i++) {
      button.click();
      // every update should be its own commit
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }, times);

  await expect(page.locator('[data-name="updates"]')).toHaveText(`${times}`);
  await page.waitForTimeout(50);
}

/**
 * The names of the entries the grid sent to the profiler tracks.
 */
function getProfilerEntryNames(traceBuffer: Buffer) {
  const { traceEvents } = JSON.parse(traceBuffer.toString()) as {
    traceEvents: {
      cat: string;
      name: string;
      ph: string;
      args?: { detail?: string };
    }[];
  };

  return traceEvents
    .filter((event) => {
      if (!event.cat.includes('blink.user_timing')) {
        return false;
      }
      const detail = event.args?.detail;

      return typeof detail === 'string' && detail.includes(TRACK_GROUP);
    })
    .map((event) => event.name.trim().replace(/​/g, ''));
}

export default test.describe('debugId - entries for the profiler tracks', () => {
  test('are not retained in the performance timeline of the page', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await update(page, UPDATES);

    expect(await getRetainedMeasures(page)).toEqual({
      fromGrid: 0,
      // the grid must not remove measures it did not make
      fromPage: 1,
    });
  });

  test('still reach the profiler', async ({ page, browser }) => {
    await page.waitForInfinite();

    await browser.startTracing(page, {
      categories: ['blink.user_timing'],
    });

    await update(page, 3);

    const names = getProfilerEntryNames(await browser.stopTracing());

    expect(names).toContain('Sort');
    expect(names).toContain('Preparing data');
  });
});
