---
title: Benchmarking Infinite Table and AG Grid with a million rows
description: An open, reproducible benchmark of Infinite Table and AG Grid Community at 300,000 and 1,000,000 rows - mount time, memory, sorting and scrolling smoothness - with the exact steps to run it yourself.
date: 2026-11-11
author: radu
draft: true
tags: performance, benchmark, ag-grid
---

<!-- TODO before publishing:
  1. merge the benchmark (PR #325, branch large-content-scroll-and-grid-benchmark) into master
  2. release the large-content scrolling change, re-run the benchmark against that tag, update the numbers + the commit/tag below
     (the numbers here are run 2026-11-11-final: sandboxed Chromium, display scale pinned to 1)
  3. "Run it yourself" checks out the benchmark branch until it is merged - switch it to the release tag
  4. consider a headed re-run (the README recommends headed for frame metrics)
-->

We build Infinite Table, so you should read any benchmark we publish with healthy suspicion. That's exactly why we made this one open: the code, the raw numbers, and the exact commands are public, and you can [run the whole thing on your own machine](#run-it-yourself) in under half an hour.

We compared Infinite Table with [AG Grid](https://www.ag-grid.com/) Community - the most widely used data grid on the web, and a genuinely impressive piece of engineering. The goal was not to declare a winner. It was to measure where each grid spends its time.

The short version: **Infinite Table is faster to mount, uses about half the memory, and sorts large datasets roughly 2.5× faster. Scrolling is equally smooth in both, at a steady 60 fps.**

<BenchmarkChart
  title="At a glance - 1,000,000 rows"
  subtitle="median of 7 runs"
  unit="ms"
  rows={[
    { label: 'Mount: first rows painted', ag: 476, infinite: 329 },
    { label: 'Sort a string column', ag: 3771, infinite: 1410 },
    { label: 'Sort a number column', ag: 3594, infinite: 1359 },
  ]}
/>

## The setup

Both grids render the same data, in the same browser, with the same interactions. We kept each grid on its defaults and only set what was needed to make the two layouts identical.

- **Data:** 300,000 and 1,000,000 rows × 20 columns, generated deterministically. Both grids import the same module, and the harness verifies a checksum before every run.
- **Configuration:** same row height, header height, and column widths. AG Grid uses the Quartz theme with `animateRows={false}` (Infinite Table doesn't animate rows on sort, and the animation would make "sorted rows visible" ambiguous) and a `getRowId` (Infinite Table always has a primary key). No other tuning on either side.
- **Versions:** AG Grid Community 36.3.0. Infinite Table built from source at version 10.1.3 <!-- TODO: replace with the release tag + commit SHA -->.
- **Builds:** production builds only - the benchmark refuses to run against a dev server.
- **Browser:** Chrome 136, headless, sandboxed like the Chrome your users run, no CPU throttling, 1400×1000 viewport.
- **Machine:** Apple M1 Pro (10 cores), macOS.
- **Runs:** 7 measured runs per grid per scenario, plus 1 discarded warmup. The two grids are interleaved (A/B, alternating which goes first), and every run uses a fresh browser context.

### How we measure

Latency is read from Chrome performance traces, the same way [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) does it: from the input event (`pointerdown`, `setState`, or setting `scrollTop`) to the end of the first frame Chrome commits where the DOM shows the expected content - the right first and last visible rows and columns, at the right place.

Scrolling uses Chrome's real input pipeline (`Input.synthesizeScrollGesture`), so both grids get exactly the same wheel gesture, with threaded scrolling enabled. Frame outcomes come from Chrome's compositor: a frame is either *fully presented* (it includes the grid's latest main-thread update), *presented without the main-thread update* (the compositor scrolled what it already had), or *dropped*.

For every metric we report medians and a 95% bootstrap confidence interval of the difference between the two grids. We only call a difference when that interval excludes "no difference"; everything else is reported as a tie.

Every chart below has a "View as table" link with its exact numbers, and the [full report](#the-full-report) has every metric of every scenario.

## Mounting the grid

Time from `setState` with all rows already in memory to the first frame showing the full viewport, and until the grid stops changing the DOM.

<BenchmarkChart
  title="Mount time"
  subtitle="median of 7 runs"
  unit="ms"
  rows={[
    { label: 'First rows painted, 300k rows', ag: 210, infinite: 134 },
    { label: 'Settled (no more DOM changes), 300k rows', ag: 313, infinite: 141 },
    { label: 'First rows painted, 1M rows', ag: 476, infinite: 329 },
    { label: 'Settled, 1M rows', ag: 580, infinite: 345 },
  ]}
/>

Infinite Table paints the first rows about a third sooner, and is done 40-55% sooner.

<BenchmarkChart
  title="Memory: JavaScript heap retained by the grid"
  subtitle="after garbage collection, median of 7 runs"
  unit="MB"
  rows={[
    { label: '300k rows', ag: 67.5, infinite: 36.2 },
    { label: '1M rows', ag: 213, infinite: 89.4 },
  ]}
/>

Infinite Table retains roughly half the memory - 46% less at 300k rows and 58% less at 1M. Both grids render a similar number of DOM elements (637 vs 607), so the difference is in the data structures each one builds over the rows, not in what ends up on screen.

## Sorting

Click a column header, measured until every visible row shows sorted, consistent data. We sorted a string column and a number column, ascending (the first, cold sort) and then descending.

<BenchmarkChart
  title="Sorting 300,000 rows: click to sorted rows painted"
  subtitle="median of 7 runs"
  unit="ms"
  rows={[
    { label: 'String column, ascending', ag: 743, infinite: 324 },
    { label: 'String column, descending', ag: 780, infinite: 336 },
    { label: 'Number column, ascending', ag: 810, infinite: 330 },
    { label: 'Number column, descending', ag: 786, infinite: 322 },
  ]}
/>

<BenchmarkChart
  title="Sorting 1,000,000 rows: click to sorted rows painted"
  subtitle="median of 7 runs"
  unit="ms"
  rows={[
    { label: 'String column, ascending', ag: 3771, infinite: 1410 },
    { label: 'String column, descending', ag: 3760, infinite: 1618 },
    { label: 'Number column, ascending', ag: 3594, infinite: 1359 },
    { label: 'Number column, descending', ag: 3496, infinite: 1305 },
  ]}
/>

Infinite Table sorts 2.3-2.7× faster in every combination we measured. Almost all of this time is JavaScript on the main thread for both grids, so this is a measure of the sorting pipeline, not of rendering.

## Jumping around the dataset

Ten programmatic jumps to far-away scroll positions, similar to dragging the scrollbar thumb.

This one is a tie. Both grids show the right rows about 25 ms after the jump, at both 300k and 1M rows. (At 300k rows Infinite Table's slowest jump was faster - 29 ms vs 41 ms - but at 1M rows that difference disappears.)

Both grids also handle a problem you only hit at this scale: 1,000,000 rows × 40 px is 40 million pixels, taller than browsers allow an element to be (about 33.5 million px in Chrome on a standard-density display, and half of that on a 2× display). Both map the scrollbar onto the rows the same way - 1.25 content pixels per scrollbar pixel in this run - and the last row is reachable in both.

## Scrolling smoothness

A wheel gesture scrolling 24,000 px down at 8,000 px/s, and horizontal sweeps across all columns at 4,000 px/s.

At 300k rows the two grids are equally smooth: both hold 60 fps on the main thread, the slowest frame is 17.6-17.7 ms for both, and neither has a single long animation frame or dropped frame in any run. At 1M rows both stay at 59-60 fps with no significant difference.

Infinite Table gets a few more frames fully presented when scrolling vertically - frames that include the grid's latest update, instead of the compositor scrolling what it already had:

<BenchmarkChart
  title="Vertical scrolling: frames fully presented"
  subtitle="share of frames that include the grid's latest update"
  unit="%"
  better="higher"
  rows={[
    { label: '300k rows', ag: 52.3, infinite: 56.7 },
    { label: '1M rows', ag: 55.8, infinite: 62.0 },
  ]}
/>

Where the grids differ more is in *how much work* the main thread does to keep up - which matters on slower machines and when your own cell renderers add to it.

<BenchmarkChart
  title="Vertical scrolling, 300k rows: main-thread work"
  subtitle="total over a 3-second gesture, median of 7 runs"
  unit="ms"
  rows={[
    { label: 'Scripting', ag: 393, infinite: 478 },
    { label: 'Layout', ag: 75.8, infinite: 54.8 },
    { label: 'Style recalculation', ag: 176, infinite: 124 },
    { label: 'All tasks', ag: 992, infinite: 1052 },
  ]}
/>

Scrolling vertically, AG Grid runs about 18% less JavaScript, while Infinite Table does about 30% less layout and style recalculation. In total AG Grid does 6% less main-thread work at 300k rows; at 1M rows the totals are a tie.

<BenchmarkChart
  title="Horizontal scrolling, 300k rows: main-thread work"
  subtitle="total over 4 sweeps across all columns, median of 7 runs"
  unit="ms"
  rows={[
    { label: 'Scripting', ag: 170, infinite: 106 },
    { label: 'Layout', ag: 51.7, infinite: 8.33 },
    { label: 'Style recalculation', ag: 30.3, infinite: 34.3 },
    { label: 'All tasks', ag: 432, infinite: 325 },
  ]}
/>

Scrolling horizontally, Infinite Table does about 25% less main-thread work in total: 38% less scripting and 6× less layout, with AG Grid slightly ahead on style recalculation. The 1M-row numbers follow the same pattern.

## What you see during a very fast scroll

This is where the two grids make genuinely different design choices.

When you flick the wheel faster than any grid can re-render, it has to show *something* for the rows it hasn't caught up with. There are two reasonable options:

- **Show empty space** until the right content is rendered. Nothing on screen is ever wrong, but you can see gaps at the edge of the viewport.
- **Move the existing rows into place immediately** and update their content on the next render. The viewport is always full, but for a frame or two some rows can show the content they held before.

AG Grid takes the first approach. Infinite Table takes the second for vertical scrolling: it repositions rows as soon as the scroll happens, without waiting for React to commit the new content, so that strong inertial scrolling never reveals blank areas. For horizontal scrolling it waits for the commit.

The benchmark measures both effects during a 20,000 px/s flick; those numbers are in the [full report](#the-full-report).

## What we take away from this

Where **Infinite Table** came out ahead:

- Faster mount: about a third less time to first paint, 40-55% less time to settle
- Roughly half the memory for the same rows
- About 2.5× faster sorting at 300k and 1M rows
- Less layout and style recalculation work while scrolling vertically, and about 25% less main-thread work while scrolling horizontally

Where **AG Grid** came out ahead:

- Less JavaScript work during vertical scrolling at 300k rows (about 18% less scripting, 6% less main-thread work in total)
- Slightly less style recalculation while scrolling horizontally

And where they were **even**: frame rate and frame pacing while scrolling, jumping across the dataset, and reaching the last of a million rows.

For us, the clear to-do is the scripting cost per scrolled frame when scrolling vertically. We're glad to see where we're ahead, and just as glad to have a precise, repeatable measure of where we're not.

## Limitations

A benchmark is a model of reality, not reality. Please keep these in mind:

- **One machine, one browser.** An Apple M1 Pro without CPU throttling is fast; mid-range Windows laptops will look different in absolute terms. Compare the ratios between the grids, not the absolute numbers.
- **Headless Chrome.** These numbers come from Chrome's new headless mode, which runs the same rendering code as headed Chrome. Frame-pacing numbers can still differ in a headed browser with a real display.
- **Defaults only.** Both grids have options that could change these results. We deliberately didn't tune either one, because tuning one grid well and the other badly is the easiest way to make a benchmark unfair.
- **One dataset shape.** 20 columns of plain text and numbers, no custom cell renderers, no grouping, no filtering, no live updates. Real apps do more.
- **We have an interest.** We make Infinite Table. We've tried to design the harness so that it measures both grids the same way, and to report every metric - including the ones where AG Grid is ahead - but you shouldn't have to trust us. That's what the next section is for.

## Run it yourself

The benchmark lives in the Infinite Table repository, under [`examples/src/benchmark`](https://github.com/infinite-table/infinite-react/tree/master/examples/src/benchmark). You need git, a recent Node.js (we used 22) and about 2.5 GB of disk space; it runs on macOS and Linux. Playwright downloads its own Chromium, so it doesn't matter which browser you have installed.

### 1. Get the code and install

```sh
git clone https://github.com/infinite-table/infinite-react.git
cd infinite-react
# TODO: git checkout <tag or commit used for the numbers in this post>

# three installs: shared tooling, the grid's source, and the examples app
# (which contains the benchmark)
npm ci
npm ci --prefix source
npm ci --prefix examples

cd examples
npx playwright install chromium
```

Infinite Table is built from the source you checked out, so that commit decides which version you measure. The AG Grid version is the one in `examples/package.json`; to measure another one, install it before building: `npm install ag-grid-community@<version> ag-grid-react@<version>`.

### 2. Run it

```sh
# from the examples folder: production build, then every scenario at 300k and 1M rows
BENCH_HEADLESS=1 npm run benchmark
```

A full run takes about 25 minutes on the machine we used: 9 scenarios × 2 sizes × 2 grids × 8 runs. Without `BENCH_HEADLESS=1` it opens real browser windows - closer to what users see, but you have to leave the machine alone while they come and go.

For numbers you can trust, close other apps, keep a laptop plugged in, and don't use the machine during the run.

To try it first, this takes about a minute:

```sh
# mount and string sorting, 300k rows only, 3 runs per grid - reuses the build
BENCH_HEADLESS=1 BENCH_SIZES=300k BENCH_SCENARIOS=mount,sort-string BENCH_RUNS=3 npm run benchmark:run
```

### 3. Read the results

Every run writes two files to `examples/benchmark-results/<run id>/`:

- `report.md` - one table per scenario, with the median and standard deviation for each grid, the ratio between them, its 95% confidence interval, and which grid is better when the difference is significant
- `results.json` - every raw sample of every run

The most recent report is also copied to `examples/benchmark-results/latest.md`.

### Options

| Variable | Default | |
|---|---|---|
| `BENCH_SIZES` | `300k,1m` | dataset sizes to run |
| `BENCH_SCENARIOS` | all | `mount`, `sort-string`, `sort-number`, `scroll-jump`, `scroll-vertical`, `scroll-horizontal`, `correctness-vertical`, `correctness-horizontal`, `visual-blank-vertical` |
| `BENCH_RUNS` | `7` | measured runs per grid per scenario |
| `BENCH_HEADLESS` | off | `1` runs without opening browser windows |
| `BENCH_CPU_THROTTLE` | `1` | `4` slows the CPU 4×, closer to a mid-range laptop |

The [README](https://github.com/infinite-table/infinite-react/tree/master/examples/src/benchmark) documents the rest, along with the methodology of every scenario.

### See the two grids side by side

The pages the benchmark measures are ordinary pages you can open and scroll yourself. After a build:

```sh
npm run benchmark:serve
```

Then open [localhost:3000/benchmark/infinite-1m](http://localhost:3000/benchmark/infinite-1m) and [localhost:3000/benchmark/ag-grid-1m](http://localhost:3000/benchmark/ag-grid-1m) (or `-300k`). If port 3000 is taken, pick another one with `npm run benchmark:serve -- -p 4000`.

### The full report

The report and raw data behind this post:

- [Full report (Markdown)](/benchmarks/2026-11-11-ag-grid-vs-infinite-table/report.md)
- [Raw results (JSON)](/benchmarks/2026-11-11-ag-grid-vs-infinite-table/results.json)

## Help us make it fairer

If you find a flaw in the methodology, a setting that unfairly favors one grid, or a scenario that's missing, please [open an issue](https://github.com/infinite-table/infinite-react/issues) or send a pull request. That goes double for the AG Grid team: if there's a configuration you'd recommend for a fair comparison, we'll gladly add it, re-run the numbers, and update this post. You can also reach us at [admin@infinite-table.com](mailto:admin@infinite-table.com).
