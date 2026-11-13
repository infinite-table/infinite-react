---
title: Benchmarking Infinite Table and AG Grid with a million rows
description: An open, reproducible benchmark of Infinite Table, MUI X Data Grid, AG Grid Community and TanStack Table at 300,000 and 1,000,000 rows - mount time, memory, sorting and scrolling smoothness - with the exact steps to run it yourself.
date: 2026-11-11
author: radu
tags: performance, benchmark, mui-x-data-grid, ag-grid, tanstack-table
---

With release [10.1.4](/docs/releases#10-1-4) we improved Infinite Table rendering to make it possible to render huge amounts of data in your favorite React DataGrid. Previously, we were capped at about 400k records, but now you can go much higher, so we wanted to test 1 million records and see if performance stays sharp with this many records. So we put it to work and compared it against three other React DataGrids: [MUI X Data Grid](https://mui.com/x/react-data-grid/), [AG Grid](https://www.ag-grid.com/react-data-grid) and [TanStack Table](https://tanstack.com/table).

We build Infinite Table, so you should read any benchmark we publish with healthy suspicion. That's exactly why we made this one open: the code, the raw numbers, and the exact commands are in the [datagrid-performance-comparison](https://github.com/infinite-table/datagrid-performance-comparison) repository, and you can [run the whole thing on your own machine](#run-it-yourself) in about an hour.

The goal was not to declare a winner. It was to measure where each grid spends its time - and Infinite Table is not ahead everywhere.

The short version:

- **Sorting:** Infinite Table is the fastest of the four in every case we measured, by 1.6× to 3.3×.
- **Memory:** Infinite Table keeps the least - 91 MB for a million rows, against 150 MB for MUI X Data Grid, 213 MB for AG Grid and 287 MB for TanStack Table.
- **Mounting:** with a million rows Infinite Table is the first to show them. With 300k rows TanStack Table is 6% faster than Infinite Table, which is faster than the other two.
- **Scrolling:** TanStack Table, rendered with TanStack Virtual, does the least work while scrolling vertically and is the fastest to jump to a far-away row - with a much simpler page than a full grid. Infinite Table does the least work scrolling horizontally at 300k rows, and never shows blank rows; it also had the longest single frame while scrolling vertically.
- **A million rows:** only Infinite Table and AG Grid can scroll to the last one. MUI X Data Grid and TanStack Table stop at row 838,860.

<BenchmarkChart
  title="At a glance - 1,000,000 rows"
  subtitle="median of 7 runs"
  unit="ms"
  rows={[
    { label: 'Mount: first rows painted', mui: 745, ag: 808, tanstack: 659, infinite: 565 },
    { label: 'Sort a string column', mui: 5466, ag: 4067, tanstack: 6083, infinite: 2120 },
    { label: 'Sort a number column', mui: 2596, ag: 3306, tanstack: 4510, infinite: 1374 },
  ]}
/>

## The four grids

Infinite Table and AG Grid are full data grids that show all the rows in one scrollable view. The other two need a few words.

### MUI X Data Grid: all the rows on one page

We used the free, MIT-licensed `DataGrid`. It always paginates, and by default a page has 100 rows. To make it show what the other grids show, we gave it a page size of `-1`, the value its [documentation](https://mui.com/x/react-data-grid/pagination/) gives for "all results". Every row is then on one page, which the grid virtualizes and scrolls through like the others do. Its pagination footer stays, and reads "1–1,000,000 of 1,000,000".

### TanStack Table: headless, with our markup

TanStack Table has the row model and the sorting, and renders nothing. What we measured is what its documentation recommends for large tables: TanStack Table, [TanStack Virtual](https://tanstack.com/virtual) for the rows and the columns, and plain `<table>` markup. The page follows the official [virtualized-columns example](https://github.com/TanStack/table/tree/main/examples/react/virtualized-columns), with the same overscan.

That page is much less than a grid. It has no keyboard navigation, focus, cell or row selection, column menus, resizing, reordering or pinned columns, and it renders 352 DOM elements where the other three render 529 to 637. Doing less on every frame is the point of a headless library, and it shows in the scrolling numbers.

## The setup

Every grid renders the same data, in the same browser, with the same interactions. We kept each grid on its defaults and only set what was needed to make the layouts identical.

- **Data:** 300,000 and 1,000,000 rows × 20 columns, generated deterministically. Every grid imports the same module, and the harness verifies a checksum, and that all the grids show the same text, before every run.
- **Configuration:** same row height, header height, and column widths, and all the rows in one scrollable view. No other tuning, except:
  - MUI X Data Grid has the page size of `-1` described above, and shows numbers as they are - by default it formats them for the locale ("100,000.13").
  - AG Grid uses the Quartz theme with `animateRows={false}` (the other grids don't animate rows on sort, and the animation would make "sorted rows visible" ambiguous) and a `getRowId` (the other grids have a row id too).
  - TanStack Table has `sortDescFirst: false`: by default its first click on a number column sorts descending, and in the other grids it sorts ascending. Its rows have a fixed height, so nothing is measured while scrolling.
- **Versions:** all four are installed from npm: Infinite Table 10.1.5 (`@infinite-table/infinite-react`), MUI X Data Grid 9.17.0 (`@mui/x-data-grid`), AG Grid React Community 36.3.0 (`ag-grid-react` and `ag-grid-community`) and TanStack Table 9.3.1 (`@tanstack/react-table`) with TanStack Virtual 3.14.26. Each page loads only its own grid.
- **License keys:** none. Infinite Table works the same without one, but shows a "Powered by Infinite Table" footer, and MUI X Data Grid has its pagination footer. The benchmark makes the boxes taller until every grid scrolls a body of the same height, and renders the same number of rows.
- **Builds:** production builds only - the benchmark refuses to run against a dev server.
- **Browser:** Chrome 136, headless, sandboxed like the Chrome your users run, `en-US` locale, no CPU throttling, 1400×1000 viewport.
- **Machine:** a GitHub Actions hosted runner (Ubuntu 24.04, 4 cores of an AMD EPYC 9V74, no GPU). It is slower than a recent laptop, and anyone can start the same run on the same kind of machine.
- **Runs:** 7 measured runs per grid per scenario, plus 1 discarded warmup. The grids are interleaved - each run goes through all of them, in an order that changes from one run to the next - and every run uses a fresh browser context.

### How we measure

Latency is read from Chrome performance traces, the same way [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) does it: from the input event (`pointerdown`, `setState`, or setting `scrollTop`) to the end of the first frame Chrome commits where the DOM shows the expected content - the right first and last visible rows and columns, at the right place.

Scrolling uses Chrome's real input pipeline (`Input.synthesizeScrollGesture`), so every grid gets exactly the same wheel gesture, with threaded scrolling enabled. Frame outcomes come from Chrome's compositor: a frame is either *fully presented* (it includes the grid's latest main-thread update), *presented without the main-thread update* (the compositor scrolled what it already had), or *dropped*.

For every metric we report medians. Infinite Table is compared with each of the other grids, with a 95% bootstrap confidence interval of the difference; we only call a difference when that interval excludes "no difference".

Every chart below has a "View as table" link with its exact numbers, and the [full report](#the-full-report) has every metric of every scenario.

## Mounting the grid

Time from `setState` with all rows already in memory to the first frame showing the full viewport, and until the grid stops changing the DOM.

<BenchmarkChart
  title="Mount time"
  subtitle="median of 7 runs"
  unit="ms"
  rows={[
    { label: 'First rows painted, 300k rows', mui: 275, ag: 323, tanstack: 232, infinite: 246 },
    { label: 'Settled (no more DOM changes), 300k rows', mui: 275, ag: 425, tanstack: 232, infinite: 246 },
    { label: 'First rows painted, 1M rows', mui: 745, ag: 808, tanstack: 659, infinite: 565 },
    { label: 'Settled, 1M rows', mui: 745, ag: 911, tanstack: 659, infinite: 567 },
  ]}
/>

With a million rows Infinite Table paints the first rows sooner than the other three: 14% sooner than TanStack Table, 24% sooner than MUI X Data Grid and 30% sooner than AG Grid. With 300k rows TanStack Table is the fastest, 6% ahead of Infinite Table, which is 11% ahead of MUI X Data Grid and 24% ahead of AG Grid. AG Grid keeps changing the DOM for another 100 ms after its first paint; the other three are done when the rows are painted.

<BenchmarkChart
  title="Memory: JavaScript heap retained by the grid"
  subtitle="after garbage collection, median of 7 runs"
  unit="MB"
  rows={[
    { label: '300k rows', mui: 53.9, ag: 67.4, tanstack: 86.6, infinite: 36.6 },
    { label: '1M rows', mui: 150, ag: 213, tanstack: 287, infinite: 90.7 },
  ]}
/>

Infinite Table retains the least memory at both sizes. At 1M rows it keeps 40% less than MUI X Data Grid, 57% less than AG Grid and 68% less than TanStack Table, which creates a row object for every one of the million rows. The DOM is not where the difference comes from - the grids render a few hundred elements each - it is in the data structures each one builds over the rows.

## Sorting

Click a column header, measured until every visible row shows sorted, consistent data. We sorted a string column and a number column, ascending (the first, cold sort) and then descending.

<BenchmarkChart
  title="Sorting 300,000 rows: click to sorted rows painted"
  subtitle="median of 7 runs"
  unit="ms"
  rows={[
    { label: 'String column, ascending', mui: 1275, ag: 969, tanstack: 1354, infinite: 487 },
    { label: 'String column, descending', mui: 1205, ag: 1008, tanstack: 1354, infinite: 571 },
    { label: 'Number column, ascending', mui: 649, ag: 879, tanstack: 1083, infinite: 398 },
    { label: 'Number column, descending', mui: 886, ag: 861, tanstack: 1019, infinite: 389 },
  ]}
/>

<BenchmarkChart
  title="Sorting 1,000,000 rows: click to sorted rows painted"
  subtitle="median of 7 runs"
  unit="ms"
  rows={[
    { label: 'String column, ascending', mui: 5466, ag: 4067, tanstack: 6083, infinite: 2120 },
    { label: 'String column, descending', mui: 5478, ag: 4141, tanstack: 5848, infinite: 2431 },
    { label: 'Number column, ascending', mui: 2596, ag: 3306, tanstack: 4510, infinite: 1374 },
    { label: 'Number column, descending', mui: 3760, ag: 3379, tanstack: 4527, infinite: 1479 },
  ]}
/>

Infinite Table is the fastest in all sixteen combinations: 1.6-2.6× faster than MUI X Data Grid, 1.7-2.4× faster than AG Grid and 2.4-3.3× faster than TanStack Table. Almost all of this time is JavaScript on the main thread for every grid, so this is a measure of the sorting pipeline, not of rendering.

The browser ran with the `en-US` locale, which matters when comparing strings. In that locale, sorting 1M rows by the string column (ascending) took 2120 ms in Infinite Table, 4067 ms in AG Grid, 5466 ms in MUI X Data Grid and 6083 ms in TanStack Table.

## Jumping around the dataset

Ten programmatic jumps to far-away scroll positions, similar to dragging the scrollbar thumb.

<BenchmarkChart
  title="Jumping to a far-away scroll position"
  subtitle="jump to rows painted, median of 10 jumps"
  unit="ms"
  rows={[
    { label: '300k rows', mui: 23.6, ag: 34.9, tanstack: 12.2, infinite: 35.3 },
    { label: '1M rows', mui: 21.8, ag: 34.9, tanstack: 12.5, infinite: 40 },
  ]}
/>

TanStack Table is the clear winner here: the rows are on screen 12 ms after the jump. MUI X Data Grid needs 22-24 ms, and AG Grid and Infinite Table about 35 ms - level with each other at 300k rows, while at 1M rows AG Grid is 5 ms faster than Infinite Table.

Then there is a problem you only hit at this scale: 1,000,000 rows × 40 px is 40 million pixels, taller than browsers allow an element to be (about 33.5 million px in Chrome on a standard-density display, and half of that on a 2× display).

- **Infinite Table and AG Grid** map the scrollbar onto the rows - 1.25 content pixels per scrollbar pixel in this run - and the last row is reachable in both.
- **MUI X Data Grid and TanStack Virtual** don't: the element is cut at the browser's limit, and the last row you can scroll to is 838,860. The 161,140 rows after it are loaded and sorted, but can't be seen. Their 1M scrolling numbers are for the part that can be reached.

## Scrolling smoothness

A wheel gesture scrolling 24,000 px down at 8,000 px/s, and horizontal sweeps across all columns at 4,000 px/s.

Scrolling horizontally, all four grids hold 60 fps at both sizes, and the slowest frame of a typical run is one refresh interval (17 ms).

Scrolling vertically, MUI X Data Grid, AG Grid and TanStack Table hold 59-60 fps. Infinite Table is at 59 fps with 300k rows and at 55.5 fps with a million, and it has the longest single frame of the four: 50 ms at 300k rows and 117 ms at 1M, where the others stay at 17 ms (AG Grid: 33 ms at 1M). That is one hitch in a three-second gesture, on a machine without a GPU; it is the first thing we will look at.

Infinite Table does get more of its frames fully presented while scrolling vertically - frames that include the grid's latest update, instead of the compositor scrolling what it already had:

<BenchmarkChart
  title="Vertical scrolling: frames fully presented"
  subtitle="share of frames that include the grid's latest update"
  unit="%"
  better="higher"
  rows={[
    { label: '300k rows', mui: 50.3, ag: 51.1, tanstack: 50.3, infinite: 59.1 },
    { label: '1M rows', mui: 50.3, ag: 49.9, tanstack: 50.3, infinite: 65.2 },
  ]}
/>

The other difference is in *how much work* the main thread does to keep up - which matters on slower machines and when your own cell renderers add to it.

<BenchmarkChart
  title="Vertical scrolling, 300k rows: main-thread work"
  subtitle="total over a 3-second gesture, median of 7 runs"
  unit="ms"
  rows={[
    { label: 'Scripting', mui: 677, ag: 660, tanstack: 428, infinite: 771 },
    { label: 'Layout', mui: 72, ag: 111, tanstack: 92.1, infinite: 87.8 },
    { label: 'Style recalculation', mui: 100, ag: 296, tanstack: 49.5, infinite: 202 },
    { label: 'All tasks', mui: 1625, ag: 1630, tanstack: 1013, infinite: 1739 },
  ]}
/>

Scrolling vertically, TanStack Table does about 40% less work than the three full grids. Among those, Infinite Table does the most at 300k rows - 7% more than MUI X Data Grid and AG Grid, because it runs more JavaScript per frame, even though it does less layout and style recalculation than AG Grid. At 1M rows MUI X Data Grid does the least of the three, and Infinite Table 3% less than AG Grid.

<BenchmarkChart
  title="Horizontal scrolling, 300k rows: main-thread work"
  subtitle="total over 4 sweeps across all columns, median of 7 runs"
  unit="ms"
  rows={[
    { label: 'Scripting', mui: 401, ag: 270, tanstack: 177, infinite: 165 },
    { label: 'Layout', mui: 49.1, ag: 78.9, tanstack: 54.6, infinite: 11.9 },
    { label: 'Style recalculation', mui: 24.5, ag: 46.7, tanstack: 15.7, infinite: 53.4 },
    { label: 'All tasks', mui: 749, ag: 721, tanstack: 538, infinite: 495 },
  ]}
/>

Scrolling horizontally at 300k rows, Infinite Table does the least work: 8% less than TanStack Table and about a third less than AG Grid and MUI X Data Grid, with 4-7× less layout than any of them. At 1M rows TanStack Table does the least, 17% less than Infinite Table, which stays ahead of AG Grid (by 14%) and MUI X Data Grid (by 29%).

## What you see during a very fast scroll

This is where the grids make genuinely different design choices.

When you flick the wheel faster than a grid can re-render, it has to show *something* for the rows it hasn't caught up with. There are two reasonable options:

- **Show empty space** until the right content is rendered. Nothing on screen is ever wrong, but you can see gaps at the edge of the viewport.
- **Move the existing rows into place immediately** and update their content on the next render. The viewport is always full, but for a frame or two some rows can show the content they held before.

AG Grid and TanStack Table take the first approach. Infinite Table takes the second for vertical scrolling: it repositions rows as soon as the scroll happens, without waiting for React to commit the new content, so that strong inertial scrolling never reveals blank areas. For horizontal scrolling it waits for the commit.

The benchmark measures both effects during a 20,000 px/s flick. At 1M rows, 53% of the frames captured from AG Grid and 10% of those from TanStack Table had blank rows, and none of those from Infinite Table or MUI X Data Grid. In Infinite Table, most of the points sampled in its rows during the flick showed a row's earlier content; MUI X Data Grid kept up with neither blank nor stale rows. All of those numbers are in the [full report](#the-full-report).

## What we take away from this

Where **Infinite Table** came out ahead of all three:

- Sorting: 1.6-2.6× faster than MUI X Data Grid, 1.7-2.4× faster than AG Grid, 2.4-3.3× faster than TanStack Table (strings sorted in an `en-US` browser)
- Memory: 32-40% less than MUI X Data Grid, 46-57% less than AG Grid, 58-68% less than TanStack Table
- Mounting a million rows: 14-30% sooner
- Main-thread work while scrolling horizontally at 300k rows
- More frames fully presented while scrolling vertically
- Reaching the last of a million rows, which only AG Grid also does

Where **MUI X Data Grid** came out ahead of Infinite Table:

- Jumping to a far-away row: 22-24 ms against 35-40 ms
- Vertical scrolling: 7-19% less main-thread work, a steady 60 fps, and no long frame
- A very fast scroll with neither blank nor stale rows

Where **AG Grid** came out ahead of Infinite Table:

- Vertical scrolling: 59-60 fps and a shorter longest frame
- A faster median jump at 1M rows (by 5 ms)
- 6% less main-thread work scrolling vertically at 300k rows

Where **TanStack Table** (with TanStack Virtual) came out ahead of Infinite Table:

- Jumping to a far-away row: 12 ms against 35-40 ms
- Vertical scrolling: about 45% less main-thread work, and a steady 60 fps
- Mounting 300k rows 6% faster, and less work scrolling horizontally at 1M rows

It does that with a page that is not a full grid.

For us, there are two clear to-dos, both in vertical scrolling: the long frame, and the JavaScript we run per scrolled frame. We're glad to see where we're ahead, and just as glad to have a precise, repeatable measure of where we're not.

## Limitations

A benchmark is a model of reality, not reality. Please keep these in mind:

- **One machine, one browser.** A shared cloud machine with 4 cores and no GPU. A laptop will be faster in absolute terms, and its frame pacing will be different. Compare the ratios between the grids, not the absolute numbers.
- **Headless Chrome.** These numbers come from Chrome's new headless mode, which runs the same rendering code as headed Chrome. Frame-pacing numbers can still differ in a headed browser with a real display.
- **Defaults only.** Every grid has options that could change these results. We deliberately didn't tune any of them, because tuning one grid well and another badly is the easiest way to make a benchmark unfair.
- **Not four of the same thing.** The TanStack Table page is an example with our markup, not a full grid; a different way of rendering TanStack Table would give different numbers. MUI X Data Grid is on one page that holds every row, which is not its default.
- **One dataset shape.** 20 columns of plain text and numbers, no custom cell renderers, no grouping, no filtering, no live updates. Real apps do more.
- **One browser locale.** The string sorting result is for an `en-US` browser.
- **We have an interest.** We make Infinite Table. We've tried to design the harness so that it measures every grid the same way, and to report every metric - including the ones where another grid is ahead - but you shouldn't have to trust us. That's what the next section is for.

## Run it yourself

The benchmark has its own repository: [infinite-table/datagrid-performance-comparison](https://github.com/infinite-table/datagrid-performance-comparison). All four grids are installed from npm, so there is nothing to build but the benchmark pages. Its README also has the results for the latest versions: the benchmark runs again on GitHub Actions whenever Infinite Table or AG Grid publishes a new version. You need git and Node.js 20 or newer (we used 22); it runs on macOS and Linux. Playwright downloads its own Chromium, so it doesn't matter which browser you have installed.

### 1. Get the code and install

```sh
git clone https://github.com/infinite-table/datagrid-performance-comparison.git
cd datagrid-performance-comparison
npm install
npx playwright install chromium
```

### 2. Run it

```sh
# production build, then every scenario at 300k and 1M rows
BENCH_HEADLESS=1 npm run benchmark
```

A full run takes about an hour: 9 scenarios × 2 sizes × 4 grids × 8 runs. Without `BENCH_HEADLESS=1` it opens real browser windows - closer to what users see, but you have to leave the machine alone while they come and go.

For numbers you can trust, close other apps, keep a laptop plugged in, and don't use the machine during the run.

To try it first, this takes about a minute:

```sh
npm run benchmark:build
# mount and string sorting, 300k rows only, 3 runs per grid
BENCH_HEADLESS=1 BENCH_SIZES=300k BENCH_SCENARIOS=mount,sort-string BENCH_RUNS=3 npm run benchmark:run
```

### 3. Read the results

Every run writes two files to `benchmark-results/<run id>/`:

- `report.md` - one table per scenario, with the median and standard deviation for each grid and, for Infinite Table against each of the others, the ratio, its 95% confidence interval, and which grid is better when the difference is significant
- `results.json` - every raw sample of every run

The most recent report is also copied to `benchmark-results/latest.md`.

### Compare other versions

The versions that are measured are the ones installed in `node_modules`, and the report records them. To compare other releases of any of the grids, install them and run the benchmark again:

```sh
npm install @infinite-table/infinite-react@<version>
npm install @mui/x-data-grid@<version>
npm install ag-grid-community@<version> ag-grid-react@<version>
npm install @tanstack/react-table@<version> @tanstack/react-virtual@<version>

BENCH_HEADLESS=1 npm run benchmark
```

Infinite Table reaches the last of a million rows starting with version 10.1.4. To measure only some of the grids, name them: `BENCH_GRIDS=ag-grid,infinite`.

### Options

| Variable | Default | |
|---|---|---|
| `BENCH_SIZES` | `300k,1m` | dataset sizes to run |
| `BENCH_SCENARIOS` | all | `mount`, `sort-string`, `sort-number`, `scroll-jump`, `scroll-vertical`, `scroll-horizontal`, `correctness-vertical`, `correctness-horizontal`, `visual-blank-vertical` |
| `BENCH_GRIDS` | all | `mui`, `ag-grid`, `tanstack`, `infinite` - at least two |
| `BENCH_RUNS` | `7` | measured runs per grid per scenario |
| `BENCH_HEADLESS` | off | `1` runs without opening browser windows |
| `BENCH_CPU_THROTTLE` | `1` | `4` slows the CPU 4×, closer to a mid-range laptop |

The [README](https://github.com/infinite-table/datagrid-performance-comparison#readme) documents the rest, along with the methodology of every scenario.

### See the grids yourself

The pages the benchmark measures are ordinary pages you can open and scroll yourself. After a build:

```sh
npm run benchmark:serve
```

Then open [localhost:3000](http://localhost:3000) for the list of pages: `/benchmark/infinite-1m`, `/benchmark/mui-1m`, `/benchmark/ag-grid-1m` and `/benchmark/tanstack-1m` (or `-300k`). If port 3000 is taken, pick another one with `npm run benchmark:serve -- -p 4000`.

### In the Infinite Table repository

The same harness also lives in the Infinite Table repository, under [`examples/src/benchmark`](https://github.com/infinite-table/infinite-react/tree/master/examples/src/benchmark). There it measures Infinite Table's source, instead of the npm package, against AG Grid - that's the one we use while working on the grid.

### The full report

The report and raw data behind this post:

- [Full report (Markdown)](/benchmarks/2026-11-12-infinite-table-mui-x-ag-grid-tanstack-table/report.md)
- [Raw results (JSON)](/benchmarks/2026-11-12-infinite-table-mui-x-ag-grid-tanstack-table/results.json)

Both are also in the benchmark repository, under [`results/blog-post-2026-11-12`](https://github.com/infinite-table/datagrid-performance-comparison/tree/master/results/blog-post-2026-11-12).

## Help us make it fairer

If you find a flaw in the methodology, a setting that unfairly favors one grid, or a scenario that's missing, please [open an issue](https://github.com/infinite-table/datagrid-performance-comparison/issues) or send a pull request. That goes double for the MUI X, AG Grid and TanStack teams: if there's a configuration you'd recommend for a fair comparison - or a better way to render TanStack Table - we'll gladly add it, re-run the numbers, and update this post. You can also reach us at [admin@infinite-table.com](mailto:admin@infinite-table.com).
