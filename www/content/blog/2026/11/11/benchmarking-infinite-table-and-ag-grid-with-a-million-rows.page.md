---
title: Benchmarking Infinite Table and AG Grid with a million rows
description: An open, reproducible benchmark of Infinite Table and AG Grid Community at 300,000 and 1,000,000 rows - mount time, memory, sorting and scrolling smoothness - with the exact steps to run it yourself.
date: 2026-11-11
author: radu
draft: true
tags: performance, benchmark, ag-grid
---

With our latest release [10.1.4](/docs/releases#10-1-4) we improved Infinite Table rendering to make it possible to render huge amounts of data in your favorite React DataGrid. Previously, we were capped at about 400k records, but now you can go much higher, so we wanted to test 1 million records and see if performance stays sharp with this many records. So we decided to put it to work and compare it against the [AG Grid React DataGrid](https://www.ag-grid.com/react-data-grid).

In this benchmark we compare those two very powerful React DataGrids: Infinite Table and AG Grid React Community. We build Infinite Table, so you should read any benchmark we publish with healthy suspicion. That's exactly why we made this one open: the code, the raw numbers, and the exact commands are public, and you can [run the whole thing on your own machine](#run-it-yourself) in under half an hour.

We compared Infinite Table with [AG Grid](https://www.ag-grid.com/) Community - the most widely used data grid on the web, and a genuinely impressive piece of engineering. The goal was not to declare a winner. It was to measure where each grid spends its time.

The short version: **Infinite Table is faster to mount, uses about half the memory, and sorts large datasets 2.2-2.5× faster. Scrolling is equally smooth in both, at a steady 60 fps.**

<BenchmarkChart
  title="At a glance - 1,000,000 rows"
  subtitle="median of 7 runs"
  unit="ms"
  rows={[
    { label: 'Mount: first rows painted', ag: 498, infinite: 352 },
    { label: 'Sort a string column', ag: 3384, infinite: 1395 },
    { label: 'Sort a number column', ag: 3061, infinite: 1205 },
  ]}
/>

## The setup

Both grids render the same data, in the same browser, with the same interactions. We kept each grid on its defaults and only set what was needed to make the two layouts identical.

- **Data:** 300,000 and 1,000,000 rows × 20 columns, generated deterministically. Both grids import the same module, and the harness verifies a checksum before every run.
- **Configuration:** same row height, header height, and column widths. AG Grid uses the Quartz theme with `animateRows={false}` (Infinite Table doesn't animate rows on sort, and the animation would make "sorted rows visible" ambiguous) and a `getRowId` (Infinite Table always has a primary key). No other tuning on either side.
- **Versions:** both grids are React components, installed from npm: AG Grid React Community 36.3.0 (`ag-grid-react` and `ag-grid-community`) and Infinite Table 10.1.4 (`@infinite-table/infinite-react`). Each page loads only its own grid.
- **License keys:** none. AG Grid Community doesn't need one. Infinite Table works the same without one, but shows a "Powered by Infinite Table" footer, so the benchmark makes its box taller until both grids scroll a body of exactly the same height, and render the same number of rows.
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
    { label: 'First rows painted, 300k rows', ag: 198, infinite: 140 },
    { label: 'Settled (no more DOM changes), 300k rows', ag: 302, infinite: 140 },
    { label: 'First rows painted, 1M rows', ag: 498, infinite: 352 },
    { label: 'Settled, 1M rows', ag: 602, infinite: 352 },
  ]}
/>

Infinite Table paints the first rows about 30% sooner, and is done 40-55% sooner.

<BenchmarkChart
  title="Memory: JavaScript heap retained by the grid"
  subtitle="after garbage collection, median of 7 runs"
  unit="MB"
  rows={[
    { label: '300k rows', ag: 67.5, infinite: 36.6 },
    { label: '1M rows', ag: 213, infinite: 90.7 },
  ]}
/>

Infinite Table retains roughly half the memory - 46% less at 300k rows and 57% less at 1M. Both grids render a similar number of DOM elements (637 vs 609), so the difference is in the data structures each one builds over the rows, not in what ends up on screen.

## Sorting

Click a column header, measured until every visible row shows sorted, consistent data. We sorted a string column and a number column, ascending (the first, cold sort) and then descending.

<BenchmarkChart
  title="Sorting 300,000 rows: click to sorted rows painted"
  subtitle="median of 7 runs"
  unit="ms"
  rows={[
    { label: 'String column, ascending', ag: 774, infinite: 348 },
    { label: 'String column, descending', ag: 810, infinite: 360 },
    { label: 'Number column, ascending', ag: 707, infinite: 306 },
    { label: 'Number column, descending', ag: 714, infinite: 314 },
  ]}
/>

<BenchmarkChart
  title="Sorting 1,000,000 rows: click to sorted rows painted"
  subtitle="median of 7 runs"
  unit="ms"
  rows={[
    { label: 'String column, ascending', ag: 3384, infinite: 1395 },
    { label: 'String column, descending', ag: 3279, infinite: 1380 },
    { label: 'Number column, ascending', ag: 3061, infinite: 1205 },
    { label: 'Number column, descending', ag: 3096, infinite: 1289 },
  ]}
/>

Infinite Table sorts 2.2-2.5× faster in every combination we measured. Almost all of this time is JavaScript on the main thread for both grids, so this is a measure of the sorting pipeline, not of rendering.

## Jumping around the dataset

Ten programmatic jumps to far-away scroll positions, similar to dragging the scrollbar thumb.

This one is close to a tie: both grids show the right rows 21-27 ms after the jump. At 300k rows the difference is within noise. At 1M rows AG Grid's median jump is about 3 ms faster (20.9 ms vs 23.6 ms), while Infinite Table's slowest jump is faster (28 ms vs 36 ms).

Both grids also handle a problem you only hit at this scale: 1,000,000 rows × 40 px is 40 million pixels, taller than browsers allow an element to be (about 33.5 million px in Chrome on a standard-density display, and half of that on a 2× display). Both map the scrollbar onto the rows the same way - 1.25 content pixels per scrollbar pixel in this run - and the last row is reachable in both.

## Scrolling smoothness

A wheel gesture scrolling 24,000 px down at 8,000 px/s, and horizontal sweeps across all columns at 4,000 px/s.

At 300k rows the two grids are equally smooth: both hold 60 fps on the main thread, and the slowest frame of a typical run is 17.7 ms for both. Neither is spotless: one run in seven of AG Grid and two in seven of Infinite Table had a longer frame or two. At 1M rows both stay at 59-60 fps with no significant difference.

At 1M rows Infinite Table gets a few more frames fully presented when scrolling vertically - frames that include the grid's latest update, instead of the compositor scrolling what it already had. At 300k rows the difference is within noise:

<BenchmarkChart
  title="Vertical scrolling: frames fully presented"
  subtitle="share of frames that include the grid's latest update"
  unit="%"
  better="higher"
  rows={[
    { label: '300k rows', ag: 52.3, infinite: 56.0, note: 'no significant difference' },
    { label: '1M rows', ag: 52.3, infinite: 58.5 },
  ]}
/>

Where the grids differ more is in *how much work* the main thread does to keep up - which matters on slower machines and when your own cell renderers add to it.

<BenchmarkChart
  title="Vertical scrolling, 300k rows: main-thread work"
  subtitle="total over a 3-second gesture, median of 7 runs"
  unit="ms"
  rows={[
    { label: 'Scripting', ag: 398, infinite: 474 },
    { label: 'Layout', ag: 78.3, infinite: 53.7 },
    { label: 'Style recalculation', ag: 172, infinite: 122 },
    { label: 'All tasks', ag: 1020, infinite: 1029, note: 'no significant difference' },
  ]}
/>

Scrolling vertically, AG Grid runs about 16% less JavaScript, while Infinite Table does about 30% less layout and style recalculation. The totals are a tie at 300k rows, and within 4% of each other at 1M rows.

<BenchmarkChart
  title="Horizontal scrolling, 300k rows: main-thread work"
  subtitle="total over 4 sweeps across all columns, median of 7 runs"
  unit="ms"
  rows={[
    { label: 'Scripting', ag: 171, infinite: 108 },
    { label: 'Layout', ag: 48.8, infinite: 8.2 },
    { label: 'Style recalculation', ag: 30.6, infinite: 34.1 },
    { label: 'All tasks', ag: 414, infinite: 317 },
  ]}
/>

Scrolling horizontally, Infinite Table does about 23% less main-thread work in total: 37% less scripting and 6× less layout, with AG Grid slightly ahead on style recalculation. The 1M-row numbers follow the same pattern, with a smaller gap in the total (12%).

## What you see during a very fast scroll

This is where the two grids make genuinely different design choices.

When you flick the wheel faster than any grid can re-render, it has to show *something* for the rows it hasn't caught up with. There are two reasonable options:

- **Show empty space** until the right content is rendered. Nothing on screen is ever wrong, but you can see gaps at the edge of the viewport.
- **Move the existing rows into place immediately** and update their content on the next render. The viewport is always full, but for a frame or two some rows can show the content they held before.

AG Grid takes the first approach. Infinite Table takes the second for vertical scrolling: it repositions rows as soon as the scroll happens, without waiting for React to commit the new content, so that strong inertial scrolling never reveals blank areas. For horizontal scrolling it waits for the commit.

The benchmark measures both effects during a 20,000 px/s flick; those numbers are in the [full report](#the-full-report).

## What we take away from this

Where **Infinite Table** came out ahead:

- Faster mount: about 30% less time to first paint, 40-55% less time to settle
- Roughly half the memory for the same rows
- 2.2-2.5× faster sorting at 300k and 1M rows
- Less layout and style recalculation work while scrolling vertically, and about 23% less main-thread work while scrolling horizontally

Where **AG Grid** came out ahead:

- Less JavaScript work during vertical scrolling (about 16% less scripting)
- Slightly less style recalculation while scrolling horizontally
- A slightly faster median jump at 1M rows (about 3 ms)

And where they were **even**: frame rate and frame pacing while scrolling, the total main-thread work of a vertical scroll, jumping across 300k rows, and reaching the last of a million rows.

For us, the clear to-do is the scripting cost per scrolled frame when scrolling vertically. We're glad to see where we're ahead, and just as glad to have a precise, repeatable measure of where we're not.

## Limitations

A benchmark is a model of reality, not reality. Please keep these in mind:

- **One machine, one browser.** An Apple M1 Pro without CPU throttling is fast; mid-range Windows laptops will look different in absolute terms. Compare the ratios between the grids, not the absolute numbers.
- **Headless Chrome.** These numbers come from Chrome's new headless mode, which runs the same rendering code as headed Chrome. Frame-pacing numbers can still differ in a headed browser with a real display.
- **Defaults only.** Both grids have options that could change these results. We deliberately didn't tune either one, because tuning one grid well and the other badly is the easiest way to make a benchmark unfair.
- **One dataset shape.** 20 columns of plain text and numbers, no custom cell renderers, no grouping, no filtering, no live updates. Real apps do more.
- **We have an interest.** We make Infinite Table. We've tried to design the harness so that it measures both grids the same way, and to report every metric - including the ones where AG Grid is ahead - but you shouldn't have to trust us. That's what the next section is for.

## Run it yourself

The benchmark has its own repository: [infinite-table/infinite-ag-grid-performance-comparison](https://github.com/infinite-table/infinite-ag-grid-performance-comparison). Both grids are installed from npm, so there is nothing to build but the benchmark pages. Its README also has the results for the latest versions of the two grids: the benchmark runs again on GitHub Actions whenever either of them publishes a new version. You need git and Node.js 20 or newer (we used 22); it runs on macOS and Linux. Playwright downloads its own Chromium, so it doesn't matter which browser you have installed.

### 1. Get the code and install

```sh
git clone https://github.com/infinite-table/infinite-ag-grid-performance-comparison.git
cd infinite-ag-grid-performance-comparison
npm install
npx playwright install chromium
```

### 2. Run it

```sh
# production build, then every scenario at 300k and 1M rows
BENCH_HEADLESS=1 npm run benchmark
```

A full run takes about 25 minutes on the machine we used: 9 scenarios × 2 sizes × 2 grids × 8 runs. Without `BENCH_HEADLESS=1` it opens real browser windows - closer to what users see, but you have to leave the machine alone while they come and go.

For numbers you can trust, close other apps, keep a laptop plugged in, and don't use the machine during the run.

To try it first, this takes about a minute:

```sh
npm run benchmark:build
# mount and string sorting, 300k rows only, 3 runs per grid
BENCH_HEADLESS=1 BENCH_SIZES=300k BENCH_SCENARIOS=mount,sort-string BENCH_RUNS=3 npm run benchmark:run
```

### 3. Read the results

Every run writes two files to `benchmark-results/<run id>/`:

- `report.md` - one table per scenario, with the median and standard deviation for each grid, the ratio between them, its 95% confidence interval, and which grid is better when the difference is significant
- `results.json` - every raw sample of every run

The most recent report is also copied to `benchmark-results/latest.md`.

### Compare other versions

The versions that are measured are the ones installed in `node_modules`, and the report records them. To compare other releases of either grid, install them and run the benchmark again:

```sh
npm install @infinite-table/infinite-react@<version>
npm install ag-grid-community@<version> ag-grid-react@<version>

BENCH_HEADLESS=1 npm run benchmark
```

Infinite Table reaches the last of a million rows starting with version 10.1.4, so use `BENCH_SIZES=300k` for older versions.

### Options

| Variable | Default | |
|---|---|---|
| `BENCH_SIZES` | `300k,1m` | dataset sizes to run |
| `BENCH_SCENARIOS` | all | `mount`, `sort-string`, `sort-number`, `scroll-jump`, `scroll-vertical`, `scroll-horizontal`, `correctness-vertical`, `correctness-horizontal`, `visual-blank-vertical` |
| `BENCH_RUNS` | `7` | measured runs per grid per scenario |
| `BENCH_HEADLESS` | off | `1` runs without opening browser windows |
| `BENCH_CPU_THROTTLE` | `1` | `4` slows the CPU 4×, closer to a mid-range laptop |

The [README](https://github.com/infinite-table/infinite-ag-grid-performance-comparison#readme) documents the rest, along with the methodology of every scenario.

### See the two grids side by side

The pages the benchmark measures are ordinary pages you can open and scroll yourself. After a build:

```sh
npm run benchmark:serve
```

Then open [localhost:3000/benchmark/infinite-1m](http://localhost:3000/benchmark/infinite-1m) and [localhost:3000/benchmark/ag-grid-1m](http://localhost:3000/benchmark/ag-grid-1m) (or `-300k`). If port 3000 is taken, pick another one with `npm run benchmark:serve -- -p 4000`.

### In the Infinite Table repository

The same benchmark also lives in the Infinite Table repository, under [`examples/src/benchmark`](https://github.com/infinite-table/infinite-react/tree/master/examples/src/benchmark). There it runs against the grid's source instead of the npm package - that's the one we use while working on the grid.

### The full report

The report and raw data behind this post:

- [Full report (Markdown)](/benchmarks/2026-11-11-ag-grid-vs-infinite-table/report.md)
- [Raw results (JSON)](/benchmarks/2026-11-11-ag-grid-vs-infinite-table/results.json)

Both are also in the benchmark repository, under [`results/blog-post-2026-11-11`](https://github.com/infinite-table/infinite-ag-grid-performance-comparison/tree/master/results/blog-post-2026-11-11).

## Help us make it fairer

If you find a flaw in the methodology, a setting that unfairly favors one grid, or a scenario that's missing, please [open an issue](https://github.com/infinite-table/infinite-ag-grid-performance-comparison/issues) or send a pull request. That goes double for the AG Grid team: if there's a configuration you'd recommend for a fair comparison, we'll gladly add it, re-run the numbers, and update this post. You can also reach us at [admin@infinite-table.com](mailto:admin@infinite-table.com).
