# AG Grid vs Infinite Table benchmark

A Playwright benchmark that compares AG Grid (Community) and Infinite Table on
the same data, in the same browser, with the same interactions - at 300k and
1M rows.

```sh
cd examples
npm run benchmark            # production build + all scenarios, both sizes
npm run benchmark:run        # reuse the last build
```

The report goes to `examples/benchmark-results/<run id>/report.md` (also
copied to `benchmark-results/latest.md`); the raw samples are in
`results.json` next to it. `benchmark-results/` is git-ignored.

## Files

| File                                           |                                                                                                                                               |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/benchmark/<grid>-<size>.page.tsx`   | the demo pages (`ag-grid-300k`, `infinite-1m`, ...) - also in the regular examples app, e.g. http://localhost:5555/benchmark/infinite-1m      |
| `src/pages/benchmark/*.bench.tsx`              | the same pages, as entries of the production benchmark build                                                                                  |
| `data.ts`                                      | the deterministic dataset (20 columns) - both grids import it, the spec checks the checksum                                                   |
| `AgGridBenchmark.tsx`, `InfiniteBenchmark.tsx` | each grid with its defaults (only row/header height and column widths are set) + its DOM adapter                                              |
| `BenchmarkPage.tsx`, `harness.ts`              | identical page shell; `window.__bench` - what the spec calls in the page (mount, jumps, probes, ...)                                          |
| `grid-comparison.bench.ts`                     | the Playwright spec: scenarios, runs, report                                                                                                  |
| `benchUtils.ts`                                | trace parsing, statistics, report                                                                                                             |
| `../../playwright.benchmark.config.ts`         | separate config: 1 worker, no retries, long timeouts, `next start` on port 5560                                                               |
| `../../scripts/grid-benchmark-build.js`        | `GRID_BENCHMARK=1 next build` into `.next-benchmark` (only the `*.bench.tsx` pages, `__DEV__` off), so it can run while `next dev` is running |

## Methodology

- **Production builds only.** The spec refuses dev builds (`BENCH_ALLOW_DEV=1`
  to try it against `next dev` anyway).
- **Fresh browser context per run**, A/B interleaved: every scenario runs
  `BENCH_WARMUP` + `BENCH_RUNS` times per grid, alternating which grid goes
  first; warmup runs are discarded.
- **Latency from traces**, as in
  [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark):
  from the input (pointerdown, `setState`, setting `scrollTop`) to the end of
  the first `Commit` after the DOM shows the expected content.
  - _visible_ - the first and last visible rows/columns show the right
    content, at the right place
  - _settled_ - the first frame committed after the grid's last DOM mutation
    (aria-live regions ignored). We don't use js-framework-benchmark's "last
    rAF/timer" rule, because grids schedule debounce timers that do no visible
    work.
- **Scrolling uses real input**: `Input.synthesizeScrollGesture` (Chrome's
  input pipeline, threaded scrolling), the same gesture for both grids.
  - frame outcomes from the compositor's `PipelineReporter` trace events:
    presented with the main-thread update, presented without it ("partial" -
    the compositor scrolled what it had), or dropped
  - rAF intervals and Long Animation Frames from the page
- **Correctness probe** (`correctness-*`): after every frame, samples points
  across the body and checks that the cell there is the one that should be
  there for the current scroll position - "blank" (no cell) or "wrong"
  (another row's content, or a cell lagging the scroll). It reads layout, so
  it runs in its own pass, never together with timing.
- **Screencast** (`visual-blank-vertical`): records what the compositor
  actually displays during a fast scroll and counts blank rows - this also
  catches the compositor scrolling ahead of the main thread.
- **Scroll range** (setup): browsers cap element sizes (16.7M-33.5M px in
  Chrome, depending on the version), and 1M rows x 40px is more than that.
  The setup scrolls each grid to the middle and to the end, to report whether
  the last row is reachable and how the scrollbar maps onto the rows. The
  probes and jumps use that mapping, so they measure rendering - not mapping
  differences.
- **Sandboxed Chromium**: the benchmark turns Chromium's sandbox on
  (Playwright turns it off by default), as in real Chrome. Without it, on
  macOS, the first hover recompute after a layout change under the mouse
  blocks the main thread for 30-80ms, once per page (`GetCurrentKeyModifiers`
  connecting to the WindowServer). It showed up as one long frame at the
  start of the first scroll - only for the grid that updates rows under the
  mouse first - and does not happen in a sandboxed renderer.
- **Fixed display scale**: Chromium runs with `--force-device-scale-factor=1`.
  The largest element a page can have depends on the scale factor of the
  display the window is on (about 33.5M px at 1x, 16.7M px at 2x), whatever
  the emulated `deviceScaleFactor`. Pinning it gives both grids the same
  limit on every machine; the setup fails if their scroll ranges differ.
- **Statistics**: medians, with a 95% bootstrap confidence interval of the
  ratio of medians (Infinite / AG Grid). A winner is only named when the
  interval excludes 1. When AG Grid has zeros among its values (0% blank
  samples, no long frames...), a ratio means nothing - the difference of
  medians (Infinite − AG Grid) is used instead, and its interval has to
  exclude 0.

## Options (env vars)

| Variable                                       | Default          |                                                                                              |
| ---------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------- |
| `BENCH_SIZES`                                  | `300k,1m`        | dataset sizes to run                                                                         |
| `BENCH_SCENARIOS`                              | all              | comma separated scenario ids, e.g. `mount,scroll-jump`                                       |
| `BENCH_RUNS` / `BENCH_WARMUP`                  | `7` / `1`        | measured / discarded runs per grid per scenario                                              |
| `BENCH_CPU_THROTTLE`                           | `1`              | CDP CPU throttling rate during measurements                                                  |
| `BENCH_HEADLESS`                               | off              | `1` = Chromium's new headless mode (headed by default - closest to real vsync and GPU)       |
| `BENCH_NO_SANDBOX`                             | off              | `1` = run Chromium without its sandbox (where the sandbox can't start, e.g. some containers) |
| `BENCH_SCROLL_SPEED` / `BENCH_SCROLL_DISTANCE` | `8000` / `24000` | wheel gesture (px/s, px) for the smoothness scenarios                                        |
| `BENCH_FAST_SCROLL_SPEED`                      | `20000`          | the fast gesture of the correctness / screencast scenarios                                   |
| `BENCH_SAVE_TRACES`                            | off              | `1` = save every trace to `benchmark-results/<run id>/traces`                                |
| `BENCH_VERBOSE`                                | off              | `1` = log the last DOM mutations ("settled") and the first wrong samples of the probes       |
| `BENCH_RUN_ID`                                 | ISO date         | results folder name                                                                          |
| `BENCH_PORT` / `BENCH_BASE_URL`                | `5560` / -       | port of the server the config starts, or an already running server to use instead            |

## Reading the report

Every scenario has a table with the median (and standard deviation) of each
grid, the ratio Infinite / AG Grid, its 95% CI and the "better" grid when the
difference is significant. Compare the grids, not the absolute numbers - they
depend on the machine, and the screencast in particular adds overhead.
