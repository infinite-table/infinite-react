---
title: Changing one line of CSS to save a quarter of the paint work
description: Infinite Table 10.2.1 positions its scroll container with position absolute instead of fixed. While scrolling vertically, Chrome now paints about 6 times less often and spends a quarter of the time painting. Here is why, and how we measured it - two production builds, compared in the same benchmark run.
date: 2026-11-24
author: radu
tags: performance, benchmark, css
---

[Infinite Table 10.2.1](/docs/releases#10-2-1) changes one line of CSS. The element that scrolls the body of the grid used to have `position: fixed`; now it has `position: absolute`. It sits in exactly the same place on the screen, and nothing about how the grid looks or behaves changes.

What changes is the work the browser does while you scroll. With `fixed`, Chrome re-recorded the paint of almost every visible cell on every frame. With `absolute`, it paints only the cells whose content changed.

The short version, measured in Chrome while scrolling 300,000 rows vertically:

- **Paint events:** 36,572 → 5,957, about **6 times fewer**.
- **Time spent painting:** 336 ms → 81 ms, **a quarter** of what it was.
- **Main thread:** 8% less work overall during the scroll.
- **What you see:** on a fast machine, nothing. Frames were already on time with both. With the CPU slowed down 4 times, **12% fewer frames take longer than 25 ms**, and 3.5% more frames show new rows instead of the previous ones, scrolled.

## What `fixed` did to painting

Infinite Table virtualizes rows and columns: it only renders the cells you can see, and as you scroll, it reuses the cells that leave the viewport for the rows that enter it. A reused cell is moved to its new place and gets the new row's content.

Moving a cell is cheap: it has its own compositing layer, so the browser only needs to put it somewhere else. Changing its content means painting that cell again. That part is expected.

What we didn't expect: in Chrome's traces, every frame in which a reused cell got new content also repainted all the other cells - including the ones whose content didn't change. We narrowed it down by changing one thing at a time:

- with the content updates switched off (cells only moved), the full repaints were gone, apart from the few Chrome always does when you scroll far enough;
- changing a cell's text by hand brought them back, while changing a `data-` attribute or a class name didn't;
- switching the scroll container from `fixed` to `absolute` made them go away, with everything else as it was.

## How we measured it

A benchmark that compares Infinite Table to itself has an obvious trap: if you measure version A today and version B tomorrow, the machine, its load and the browser are all slightly different, and the difference between the two runs can easily be bigger than the difference you're looking for.

So we built two production builds of Infinite Table, identical except for that one line, served them side by side, and measured them **in the same run**:

- every scenario ran 1 warmup and 15 measured runs per build, and the build that goes first swaps on every run;
- each run gets a fresh browser context;
- before any timing, the benchmark checks that both are production builds of the same page, that they render the same rows, and that the scroll container's computed `position` really is `fixed` in one and `absolute` in the other.

The pages and the gestures are the ones from our [grid benchmark](/blog/2026/11/11/benchmarking-infinite-table-mui-x-ag-grid-and-tanstack-table-with-a-million-rows): 300,000 rows of 20 columns, a 1400×1000 viewport, Chromium 136 in a real window (not headless, so real GPU and real vsync), on an Apple M1 Pro. The vertical scroll is a wheel gesture of 24,000 px at 8,000 px/s; the horizontal one sweeps across all the columns 4 times at 4,000 px/s.

Each scenario runs twice:

- with light tracing, for what the user sees - which frames Chrome presented with the main thread's update, which ones without it (scrolled by the compositor, showing the previous rows' content) and which ones it dropped, plus the intervals between animation frames;
- with detailed tracing, for what it costs - how long every thread in the frame pipeline was busy (renderer main thread, compositor, raster workers, GPU process, viz), and the paint and raster work within it.

The tables show medians, and a ratio of the two medians with its 95% bootstrap confidence interval. We call a difference real only when that interval excludes "no change".

## The results

### Vertical scroll

| | `fixed` | `absolute` | `absolute` / `fixed` (95% CI) |
|---|---:|---:|---:|
| Paint events | 36,572 | 5,957 | **×0.16** [0.16, 0.16] |
| Paint + PrePaint | 336 ms | 81 ms | **×0.24** [0.24, 0.24] |
| Renderer main thread, busy | 1,015 ms | 935 ms | **×0.92** [0.92, 0.93] |
| All frame pipeline threads, busy | 2,107 ms | 2,036 ms | **×0.97** [0.96, 0.98] |
| Raster on the renderer side | 100 ms | 100 ms | ×1.00 [0.99, 1.03] |
| Raster in the GPU process | 190 ms | 189 ms | ×1.00 [0.99, 1.02] |
| Frames fully presented | 50.8% | 50.8% | ×1.00 [0.99, 1.00] |
| Frames dropped | 0% | 0% | - |

The raster numbers are worth a second look. With `fixed`, Chrome re-recorded the paint of every cell, but it didn't rasterize them again: the pixels were the same, so the expensive part was skipped. All of the saving is on the main thread.

On this machine, the grid presents every frame on time with both builds. About half the frames are scrolled by the compositor before the main thread catches up - also with both. The 255 ms saved over a 3 second gesture are about 1.4 ms per frame, not enough to change that.

There is a small cost on the other side: scripting during the scroll is 2% higher with `absolute` (386 → 394 ms), and layout and style about 1%. Those are real (their intervals exclude no change) but tiny next to the paint saving.

### Horizontal scroll

Horizontally, the grid paints far less to begin with - columns change content less often than rows do. Paint events are halved (1,731 → 891, ×0.51) and paint time drops by a quarter (33.6 → 25.5 ms, ×0.76). The total busy time and the frames don't change measurably.

### With a slower CPU

A fast laptop hides a main-thread saving: there is enough room in every frame either way. So we ran everything again with Chrome's CPU throttling at 4× - it slows down the main thread only, which is where the saving is.

| Vertical scroll, CPU 4× slower | `fixed` | `absolute` | `absolute` / `fixed` (95% CI) |
|---|---:|---:|---:|
| Frames fully presented | 66.4% | 69.9% | **×1.05** [1.04, 1.07] |
| Animation frames longer than 25 ms | 89.7% | 77.7% | **×0.87** [0.83, 0.90] |
| Paint + PrePaint | 659 ms | 233 ms | **×0.35** [0.34, 0.36] |
| Renderer main thread, busy | 2,648 ms | 2,526 ms | **×0.95** [0.95, 0.96] |
| Frames dropped | 0% | 0% | - |

Here the saving shows: more frames carry new rows, and fewer animation frames run long. Raster takes 4% longer with `absolute` in this run - which fits, as more frames with new content means more to rasterize.

Horizontally, with the slower CPU, frames fully presented went from 81.5% to 85.0%, but with a confidence interval of [1.00, 1.10] that is borderline.

## Raw numbers & conclusion

The reports and raw data behind this post:

- without throttling: [report](/benchmarks/2026-11-24-scroller-position-fixed-vs-absolute/no-throttle/report.md), [raw results](/benchmarks/2026-11-24-scroller-position-fixed-vs-absolute/no-throttle/results.json)
- CPU 4× slower: [report](/benchmarks/2026-11-24-scroller-position-fixed-vs-absolute/cpu-throttle-4/report.md), [raw results](/benchmarks/2026-11-24-scroller-position-fixed-vs-absolute/cpu-throttle-4/results.json)

This doesn't seem like a big win, but such small wins over multiple areas of the product is what makes it better. We're striving to keep Infinite Table the fastest React DataGrid across a variety of machines - laptops and smartphones included. 

We hope you'll enjoy a faster DataGrid experience with Infinite Table.

If you see something we got wrong, [open an issue](https://github.com/infinite-table/infinite-react/issues) or write to us at [admin@infinite-table.com](mailto:admin@infinite-table.com).
