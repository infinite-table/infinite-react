# Two builds of Infinite Table, compared

`build-comparison.bench.ts` measures two production builds of Infinite Table
in the same run: every scenario runs `BENCH_WARMUP` + `BENCH_RUNS` times per
build, swapping which build goes first every run, each run in a fresh browser
context. So both builds see the same machine, the same load and the same
browser - unlike two separate benchmark runs, which can't be compared.

It reuses the grid benchmark (`../benchmark`): the same pages
(`/benchmark/infinite-300k`, `/benchmark/infinite-1m`), the same in-page
harness (`window.__bench`), the same gestures and trace parsing, and the
browser setup of `playwright.benchmark.config.ts`. Nothing in `../benchmark`
is changed - those files are kept identical in the datagrid-performance-comparison
repository.

## Run

Each build comes from its own checkout - e.g. a worktree
(`node scripts/worktree.mjs create <branch>`) with the change you want to
compare against. In each checkout:

```sh
cd examples
npm run benchmark:build                                  # into .next-benchmark
GRID_BENCHMARK=1 npx --no-install next start -p <port>   # serve it
```

Then, from either checkout (first build = baseline, second = candidate):

```sh
cd examples
BENCH_BUILDS=fixed=http://localhost:5571/,absolute=http://localhost:5572/ \
BENCH_EXPECT_DIFFERENT_STYLE=.InfiniteVirtualScrollContainer:position \
npm run benchmark:builds
```

The report goes to
`examples/benchmark-results/builds-<baseline>-vs-<candidate>-<run id>/report.md`,
the raw samples to `results.json` next to it.

The setup test checks, before any timing, that both are production builds
of the same page that render the same rows - and, with
`BENCH_EXPECT_DIFFERENT_STYLE=<selector>:<property>`, that the two builds
really differ in that computed style (so a wrong build is caught right away).
It also refuses to start when the machine is busy (see `BENCH_MAX_LOAD`).

## Scenarios

| id | what is measured |
|---|---|
| `scroll-vertical`, `scroll-horizontal` | the wheel gestures of the grid benchmark, with light tracing: frame outcomes (compositor `PipelineReporter`: fully presented / without the main thread's update / dropped), rAF intervals, Long Animation Frames, main-thread time (CDP) |
| `scroll-vertical-cost`, `scroll-horizontal-cost` | the same gestures, traced in detail in their own pass: busy time of every thread of the frame pipeline (renderer main, compositor, renderer workers, GPU process main, viz - top-level tasks, overlaps counted once), Paint / PrePaint, Layerize / Commit, raster (renderer raster tasks, and the raster itself on the GPU process main thread - out-of-process raster) |

## Options (env vars)

| Variable | Default | |
|---|---|---|
| `BENCH_BUILDS` | - (required) | `<baseline id>=<url>,<candidate id>=<url>` |
| `BENCH_EXPECT_DIFFERENT_STYLE` | - | `<selector>:<property>` the builds must differ in |
| `BENCH_RUNS` / `BENCH_WARMUP` | `15` / `1` | measured / discarded runs per build per scenario |
| `BENCH_SCENARIOS` | all | comma separated scenario ids |
| `BENCH_SIZE` | `300k` | `300k` or `1m` |
| `BENCH_VIEWPORT` | `1400x1000` | e.g. `2560x1440` - more cells on screen |
| `BENCH_CPU_THROTTLE` | `1` | CDP CPU throttling (main thread only - not raster / GPU) |
| `BENCH_SCROLL_SPEED` / `BENCH_SCROLL_DISTANCE` | `8000` / `24000` | the wheel gesture (px/s, px) |
| `BENCH_MAX_LOAD` | 30% of the cores (min 2) | the 1-minute load average must be at most this; `0` = don't check |
| `BENCH_HEADLESS` | off | `1` = Chromium's new headless mode (headed by default - real GPU, real vsync) |
| `BENCH_SAVE_TRACES` | off | `1` = keep every trace in the results folder |
| `BENCH_RUN_ID` | ISO date | results folder suffix |
| `BENCH_ALLOW_DEV` | off | `1` = allow dev builds (numbers meaningless) |

## Reading the report

Medians ± standard deviation per build; `×` is the ratio of the medians,
candidate / baseline, with its 95% bootstrap interval (the difference of
medians when the baseline median is 0). A build is named better only when
the interval excludes "no change". With fewer than ~10 runs the intervals
are not worth much.
