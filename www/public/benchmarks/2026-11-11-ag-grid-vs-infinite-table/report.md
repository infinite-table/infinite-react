# AG Grid vs Infinite Table — benchmark report

- Run: `2026-11-11` · 2026-11-11T17:22:32.873Z
- AG Grid 36.3.0 · Infinite Table 10.1.4
- 300,000 rows (data checksum `300000:72377c6e`) · 1,000,000 rows (data checksum `1000000:19e5eebe`) × 20 columns, identical data for both grids
- Chrome 136.0.7103.25 · headless · CPU throttling 1× · viewport 1400×1000
- 7 measured runs per grid per scenario (+1 warmup, discarded), A/B interleaved, fresh browser context per run
- Darwin 24.1.0 arm64 · Apple M1 Pro × 10
- Served from http://localhost:5560/
- Grid body: 757 px high in both grids (to get there, the setup made the boxes taller: Infinite +21 px)

"Infinite / AG" < 1 means Infinite has the lower value. "Better" is only set when the 95% bootstrap CI of the ratio of medians excludes 1. When AG Grid has zeros among its values (e.g. 0% blank samples) a ratio means nothing, so the difference of medians (Infinite − AG) and its CI are shown instead, and "Better" needs that CI to exclude 0.

# 300,000 rows

Scroll range - browsers cap element sizes (Chrome ~16.7M-33.5M px, depending on the version), so grids map the scrollbar onto the rows when the content is taller than that.

| | AG Grid | Infinite |
|---|---:|---:|
| Last row reachable with the scrollbar | yes (300,000) | yes (300,000) |
| Native scroll range | 11,999,243 px | 11,999,243 px |
| Content px per scrollbar px | 1.000 | 1.000 |

## mount - 300,000 rows

Mount the grid with all the rows (data already in memory). "Visible" = from setState to the end of the first frame committed with the whole viewport (first/last visible row and column) showing the right content. "Settled" = until the first frame committed after the grid's last DOM mutation. Memory is the JS heap retained by the grid after GC (heap after mount - heap before mount).

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Time to first rows painted (lower is better) | 198 ms (±14.2) | 140 ms (±9.82) | 0.71 × | 0.64–0.78 | Infinite |
| Time until settled (lower is better) | 302 ms (±14.5) | 140 ms (±8.64) | 0.46 × | 0.43–0.51 | Infinite |
| Main thread: scripting (lower is better) | 180 ms (±13.1) | 126 ms (±9.66) | 0.70 × | 0.64–0.80 | Infinite |
| Main thread: layout (lower is better) | 7.64 ms (±0.55) | 2.33 ms (±0.14) | 0.31 × | 0.28–0.34 | Infinite |
| Main thread: style recalc (lower is better) | 7.76 ms (±0.45) | 3.82 ms (±0.27) | 0.49 × | 0.46–0.55 | Infinite |
| Main thread: all tasks (lower is better) | 205 ms (±14.3) | 145 ms (±8.09) | 0.71 × | 0.65–0.77 | Infinite |
| JS heap retained by grid (lower is better) | 67.5 MB (±0.00) | 36.6 MB (±0.35) | 0.54 × | 0.54–0.54 | Infinite |
| DOM elements in grid (lower is better) | 637 (±0.00) | 609 (±0.00) | 0.96 × | 0.96–0.96 | Infinite |

## sort-string - 300,000 rows

Click the "code" column header (string column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Ascending: click to sorted rows painted (lower is better) | 774 ms (±65.3) | 348 ms (±19.9) | 0.45 × | 0.38–0.46 | Infinite |
| Ascending: click to settled (lower is better) | 774 ms (±65.3) | 362 ms (±20.5) | 0.47 × | 0.39–0.48 | Infinite |
| Descending: click to sorted rows painted (lower is better) | 810 ms (±45.5) | 360 ms (±26.0) | 0.44 × | 0.40–0.49 | Infinite |
| Descending: click to settled (lower is better) | 810 ms (±45.5) | 360 ms (±26.0) | 0.44 × | 0.40–0.49 | Infinite |
| Ascending: main thread scripting (lower is better) | 762 ms (±64.5) | 335 ms (±20.6) | 0.44 × | 0.37–0.45 | Infinite |
| Descending: main thread scripting (lower is better) | 801 ms (±45.4) | 347 ms (±27.4) | 0.43 × | 0.39–0.48 | Infinite |

## sort-number - 300,000 rows

Click the "salary" column header (number column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Ascending: click to sorted rows painted (lower is better) | 707 ms (±83.4) | 306 ms (±29.0) | 0.43 × | 0.38–0.45 | Infinite |
| Ascending: click to settled (lower is better) | 707 ms (±83.4) | 312 ms (±25.8) | 0.44 × | 0.39–0.48 | Infinite |
| Descending: click to sorted rows painted (lower is better) | 714 ms (±77.7) | 314 ms (±22.1) | 0.44 × | 0.37–0.48 | Infinite |
| Descending: click to settled (lower is better) | 714 ms (±77.7) | 314 ms (±22.1) | 0.44 × | 0.37–0.48 | Infinite |
| Ascending: main thread scripting (lower is better) | 695 ms (±83.8) | 295 ms (±27.5) | 0.42 × | 0.37–0.45 | Infinite |
| Descending: main thread scripting (lower is better) | 705 ms (±77.7) | 305 ms (±21.9) | 0.43 × | 0.36–0.48 | Infinite |

## scroll-jump - 300,000 rows

Programmatic jumps to 10 far-away scroll positions (like dragging the scrollbar thumb). Measured from setting scrollTop to the end of the first frame committed with the first and last visible rows showing the right content, at the right position.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Jump to rows painted (median of jumps) (lower is better) | 21.0 ms (±5.19) | 27.1 ms (±3.54) | 1.29 × | 0.90–1.47 | ≈ |
| Jump to rows painted (worst jump) (lower is better) | 39.9 ms (±7.74) | 36.7 ms (±4.87) | 0.92 × | 0.72–1.18 | ≈ |
| Jump to settled (median of jumps) (lower is better) | 21.0 ms (±5.19) | 27.1 ms (±3.54) | 1.29 × | 0.90–1.47 | ≈ |
| Main thread scripting (all jumps) (lower is better) | 133 ms (±20.9) | 163 ms (±18.9) | 1.22 × | 0.96–1.36 | ≈ |

## scroll-vertical - 300,000 rows

Wheel-scroll down 24000px at 8000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for both grids). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Frames fully presented (higher is better) | 52.3 % (±1.62) | 56.0 % (±3.34) | 1.07 × | 0.99–1.14 | ≈ |
| Frames presented without main-thread update (lower is better) | 47.7 % (±1.68) | 44.0 % (±3.45) | 0.92 × | 0.84–1.02 | ≈ |
| Frames dropped (lower is better) | 0.00 % (±0.21) | 0.00 % (±0.21) | 0.00 % | 0.00 to 0.00 | ≈ |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.24) | 59.9 fps (±0.84) | 1.00 × | 0.99–1.00 | ≈ |
| p95 rAF frame interval (lower is better) | 17.5 ms (±0.10) | 17.5 ms (±0.14) | 1.00 × | 0.99–1.01 | ≈ |
| Worst rAF frame interval (lower is better) | 17.7 ms (±6.27) | 17.7 ms (±18.5) | 1.00 × | 1.00–1.90 | ≈ |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.41) | 0.00 % (±1.04) | 0.00 % | 0.00 to +0.54 | ≈ |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms | 0.00 to 0.00 | ≈ |
| Main thread: scripting (lower is better) | 398 ms (±21.4) | 474 ms (±22.6) | 1.19 × | 1.10–1.32 | AG Grid |
| Main thread: layout (lower is better) | 78.3 ms (±7.48) | 53.7 ms (±2.85) | 0.68 × | 0.60–0.78 | Infinite |
| Main thread: style recalc (lower is better) | 172 ms (±11.2) | 122 ms (±5.16) | 0.71 × | 0.65–0.76 | Infinite |
| Main thread: all tasks (lower is better) | 1020 ms (±80.2) | 1029 ms (±82.7) | 1.01 × | 0.89–1.11 | ≈ |

## scroll-horizontal - 300,000 rows

Wheel-scroll right/left over all columns, 4 sweeps at 4000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for both grids). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Frames fully presented (higher is better) | 88.9 % (±3.96) | 95.8 % (±5.49) | 1.08 × | 0.94–1.12 | ≈ |
| Frames presented without main-thread update (lower is better) | 11.1 % (±3.96) | 4.23 % (±5.49) | 0.38 × | 0.26–1.93 | ≈ |
| Frames dropped (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.02) | 60.0 fps (±0.02) | 1.00 × | 1.00–1.00 | ≈ |
| p95 rAF frame interval (lower is better) | 17.3 ms (±0.22) | 17.2 ms (±0.14) | 0.99 × | 0.98–1.01 | ≈ |
| Worst rAF frame interval (lower is better) | 17.7 ms (±0.13) | 17.6 ms (±0.07) | 0.99 × | 0.99–1.01 | ≈ |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms | 0.00 to 0.00 | ≈ |
| Main thread: scripting (lower is better) | 171 ms (±7.70) | 108 ms (±4.64) | 0.63 × | 0.60–0.70 | Infinite |
| Main thread: layout (lower is better) | 48.8 ms (±1.91) | 8.20 ms (±0.20) | 0.17 × | 0.16–0.18 | Infinite |
| Main thread: style recalc (lower is better) | 30.6 ms (±1.90) | 34.1 ms (±1.28) | 1.11 × | 1.00–1.17 | AG Grid |
| Main thread: all tasks (lower is better) | 414 ms (±16.7) | 317 ms (±9.94) | 0.77 × | 0.73–0.80 | Infinite |

## correctness-vertical - 300,000 rows

Same kind of vertical wheel gesture, faster (20000px/s). After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Blank samples (lower is better) | 2.03 % (±0.65) | 0.00 % (±0.00) | 0.00 × | 0.00–0.00 | Infinite |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 38.3 % (±0.95) | +38.3 % | +37.8 to +39.6 | AG Grid |
| Frames with any blank/wrong sample (lower is better) | 10.1 % (±3.24) | 90.7 % (±0.57) | 8.95 × | 6.43–10.3 | AG Grid |
| Worst frame: correct samples (higher is better) | 80.0 % (±0.00) | 9.47 % (±16.1) | 0.12 × | 0.08–0.13 | AG Grid |

## correctness-horizontal - 300,000 rows

Same kind of horizontal wheel gesture. After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Blank samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Frames with any blank/wrong sample (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Worst frame: correct samples (higher is better) | 100 % (±0.00) | 100 % (±0.00) | 1.00 × | 1.00–1.00 | ≈ |

## visual-blank-vertical - 300,000 rows

Fast vertical wheel gesture (20000px/s) while recording what the compositor actually displays (CDP screencast). Each frame is checked for blank areas: vertical runs of the body with no text where rows should be. Unlike the correctness probe, this also catches the compositor scrolling ahead of the main thread. Screencast capture skips frames under load and adds overhead - compare the two grids, not absolute numbers.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Captured frames with blank rows (lower is better) | 4.00 % (±5.76) | 0.00 % (±0.00) | 0.00 × | 0.00–0.00 | Infinite |
| Blank body area (avg over frames) (lower is better) | 0.29 % (±0.67) | 0.00 % (±0.00) | 0.00 × | 0.00–0.00 | Infinite |
| Worst frame: blank rows (lower is better) | 2.00 rows (±0.53) | 0.00 rows (±0.00) | 0.00 × | 0.00–0.00 | Infinite |
| Captured frames (higher is better) | 74.0 (±0.69) | 74.0 (±0.58) | 1.00 × | 0.99–1.00 | ≈ |

# 1,000,000 rows

Scroll range - browsers cap element sizes (Chrome ~16.7M-33.5M px, depending on the version), so grids map the scrollbar onto the rows when the content is taller than that.

| | AG Grid | Infinite |
|---|---:|---:|
| Last row reachable with the scrollbar | yes (1,000,000) | yes (1,000,000) |
| Native scroll range | 31,999,242 px | 31,999,243 px |
| Content px per scrollbar px | 1.250 | 1.250 |

## mount - 1,000,000 rows

Mount the grid with all the rows (data already in memory). "Visible" = from setState to the end of the first frame committed with the whole viewport (first/last visible row and column) showing the right content. "Settled" = until the first frame committed after the grid's last DOM mutation. Memory is the JS heap retained by the grid after GC (heap after mount - heap before mount).

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Time to first rows painted (lower is better) | 498 ms (±48.1) | 352 ms (±37.6) | 0.71 × | 0.57–0.79 | Infinite |
| Time until settled (lower is better) | 602 ms (±48.1) | 352 ms (±37.6) | 0.59 × | 0.48–0.65 | Infinite |
| Main thread: scripting (lower is better) | 480 ms (±47.4) | 342 ms (±37.3) | 0.71 × | 0.57–0.80 | Infinite |
| Main thread: layout (lower is better) | 7.13 ms (±0.32) | 2.13 ms (±0.05) | 0.30 × | 0.28–0.31 | Infinite |
| Main thread: style recalc (lower is better) | 7.84 ms (±0.42) | 3.62 ms (±0.18) | 0.46 × | 0.43–0.50 | Infinite |
| Main thread: all tasks (lower is better) | 510 ms (±47.7) | 355 ms (±37.7) | 0.70 × | 0.57–0.78 | Infinite |
| JS heap retained by grid (lower is better) | 213 MB (±0.00) | 90.7 MB (±0.00) | 0.42 × | 0.42–0.42 | Infinite |
| DOM elements in grid (lower is better) | 637 (±0.00) | 609 (±0.00) | 0.96 × | 0.96–0.96 | Infinite |

## sort-string - 1,000,000 rows

Click the "code" column header (string column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Ascending: click to sorted rows painted (lower is better) | 3384 ms (±198) | 1395 ms (±72.7) | 0.41 × | 0.37–0.44 | Infinite |
| Ascending: click to settled (lower is better) | 3384 ms (±198) | 1412 ms (±73.1) | 0.42 × | 0.38–0.44 | Infinite |
| Descending: click to sorted rows painted (lower is better) | 3279 ms (±99.6) | 1380 ms (±99.9) | 0.42 × | 0.38–0.45 | Infinite |
| Descending: click to settled (lower is better) | 3279 ms (±99.6) | 1380 ms (±99.9) | 0.42 × | 0.38–0.45 | Infinite |
| Ascending: main thread scripting (lower is better) | 3373 ms (±198) | 1383 ms (±72.5) | 0.41 × | 0.37–0.43 | Infinite |
| Descending: main thread scripting (lower is better) | 3271 ms (±99.6) | 1366 ms (±98.3) | 0.42 × | 0.38–0.45 | Infinite |

## sort-number - 1,000,000 rows

Click the "salary" column header (number column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Ascending: click to sorted rows painted (lower is better) | 3061 ms (±242) | 1205 ms (±107) | 0.39 × | 0.34–0.47 | Infinite |
| Ascending: click to settled (lower is better) | 3061 ms (±242) | 1213 ms (±105) | 0.40 × | 0.34–0.47 | Infinite |
| Descending: click to sorted rows painted (lower is better) | 3096 ms (±211) | 1289 ms (±107) | 0.42 × | 0.40–0.44 | Infinite |
| Descending: click to settled (lower is better) | 3096 ms (±211) | 1289 ms (±107) | 0.42 × | 0.40–0.44 | Infinite |
| Ascending: main thread scripting (lower is better) | 3049 ms (±242) | 1193 ms (±107) | 0.39 × | 0.34–0.46 | Infinite |
| Descending: main thread scripting (lower is better) | 3088 ms (±211) | 1275 ms (±107) | 0.41 × | 0.39–0.44 | Infinite |

## scroll-jump - 1,000,000 rows

Programmatic jumps to 10 far-away scroll positions (like dragging the scrollbar thumb). Measured from setting scrollTop to the end of the first frame committed with the first and last visible rows showing the right content, at the right position.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Jump to rows painted (median of jumps) (lower is better) | 20.9 ms (±1.84) | 23.6 ms (±2.13) | 1.13 × | 1.01–1.27 | AG Grid |
| Jump to rows painted (worst jump) (lower is better) | 35.6 ms (±2.62) | 28.3 ms (±1.64) | 0.79 × | 0.70–0.84 | Infinite |
| Jump to settled (median of jumps) (lower is better) | 20.9 ms (±1.84) | 23.6 ms (±2.13) | 1.13 × | 1.01–1.27 | AG Grid |
| Main thread scripting (all jumps) (lower is better) | 127 ms (±11.7) | 143 ms (±12.6) | 1.12 × | 0.98–1.17 | ≈ |

## scroll-vertical - 1,000,000 rows

Wheel-scroll down 24000px at 8000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for both grids). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Frames fully presented (higher is better) | 52.3 % (±0.52) | 58.5 % (±2.51) | 1.12 × | 1.03–1.14 | Infinite |
| Frames presented without main-thread update (lower is better) | 47.7 % (±0.30) | 41.4 % (±2.65) | 0.87 × | 0.86–0.96 | Infinite |
| Frames dropped (lower is better) | 0.00 % (±0.27) | 0.00 % (±0.27) | 0.00 % | -0.56 to +0.55 | ≈ |
| Main thread frame rate (rAF) (higher is better) | 59.9 fps (±0.47) | 59.7 fps (±0.34) | 1.00 × | 0.99–1.02 | ≈ |
| p95 rAF frame interval (lower is better) | 17.5 ms (±0.12) | 17.5 ms (±0.14) | 1.00 × | 1.00–1.02 | ≈ |
| Worst rAF frame interval (lower is better) | 17.7 ms (±23.0) | 33.5 ms (±8.63) | 1.89 × | 0.27–1.92 | ≈ |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.29) | 0.54 % (±0.54) | +0.54 % | -0.55 to +1.09 | ≈ |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms | 0.00 to 0.00 | ≈ |
| Main thread: scripting (lower is better) | 502 ms (±16.3) | 593 ms (±25.9) | 1.18 × | 1.11–1.26 | AG Grid |
| Main thread: layout (lower is better) | 86.6 ms (±4.56) | 69.6 ms (±4.67) | 0.80 × | 0.74–0.88 | Infinite |
| Main thread: style recalc (lower is better) | 274 ms (±10.1) | 153 ms (±7.26) | 0.56 × | 0.52–0.59 | Infinite |
| Main thread: all tasks (lower is better) | 1319 ms (±55.7) | 1269 ms (±70.0) | 0.96 × | 0.89–1.00 | Infinite |

## scroll-horizontal - 1,000,000 rows

Wheel-scroll right/left over all columns, 4 sweeps at 4000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for both grids). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Frames fully presented (higher is better) | 86.3 % (±4.02) | 89.0 % (±5.20) | 1.03 × | 0.94–1.04 | ≈ |
| Frames presented without main-thread update (lower is better) | 13.7 % (±4.02) | 11.0 % (±5.20) | 0.81 × | 0.75–1.64 | ≈ |
| Frames dropped (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.01) | 60.0 fps (±0.01) | 1.00 × | 1.00–1.00 | ≈ |
| p95 rAF frame interval (lower is better) | 17.4 ms (±0.08) | 17.4 ms (±0.11) | 1.00 × | 0.99–1.01 | ≈ |
| Worst rAF frame interval (lower is better) | 17.7 ms (±0.05) | 17.6 ms (±0.05) | 0.99 × | 0.99–1.01 | ≈ |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms | 0.00 to 0.00 | ≈ |
| Main thread: scripting (lower is better) | 165 ms (±8.32) | 111 ms (±7.34) | 0.67 × | 0.61–0.75 | Infinite |
| Main thread: layout (lower is better) | 51.5 ms (±2.59) | 8.79 ms (±0.43) | 0.17 × | 0.16–0.19 | Infinite |
| Main thread: style recalc (lower is better) | 30.3 ms (±2.52) | 35.4 ms (±1.92) | 1.17 × | 1.00–1.30 | ≈ |
| Main thread: all tasks (lower is better) | 402 ms (±48.9) | 353 ms (±25.5) | 0.88 × | 0.71–0.94 | Infinite |

## correctness-vertical - 1,000,000 rows

Same kind of vertical wheel gesture, faster (20000px/s). After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Blank samples (lower is better) | 2.54 % (±0.56) | 0.00 % (±0.00) | 0.00 × | 0.00–0.00 | Infinite |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 71.0 % (±10.1) | +71.0 % | +68.5 to +78.5 | AG Grid |
| Frames with any blank/wrong sample (lower is better) | 12.7 % (±2.79) | 87.5 % (±2.92) | 6.90 × | 5.94–8.37 | AG Grid |
| Worst frame: correct samples (higher is better) | 80.0 % (±0.00) | 0.00 % (±0.00) | 0.00 × | 0.00–0.00 | AG Grid |

## correctness-horizontal - 1,000,000 rows

Same kind of horizontal wheel gesture. After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Blank samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Frames with any blank/wrong sample (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Worst frame: correct samples (higher is better) | 100 % (±0.00) | 100 % (±0.00) | 1.00 × | 1.00–1.00 | ≈ |

## visual-blank-vertical - 1,000,000 rows

Fast vertical wheel gesture (20000px/s) while recording what the compositor actually displays (CDP screencast). Each frame is checked for blank areas: vertical runs of the body with no text where rows should be. Unlike the correctness probe, this also catches the compositor scrolling ahead of the main thread. Screencast capture skips frames under load and adds overhead - compare the two grids, not absolute numbers.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Captured frames with blank rows (lower is better) | 16.2 % (±26.6) | 0.00 % (±0.00) | -16.2 % | -25.7 to -6.85 | Infinite |
| Blank body area (avg over frames) (lower is better) | 5.76 % (±8.91) | 0.00 % (±0.00) | -5.76 % | -11.7 to -2.66 | Infinite |
| Worst frame: blank rows (lower is better) | 15.0 rows (±5.88) | 0.00 rows (±0.00) | -15.0 rows | -16.0 to -11.0 | Infinite |
| Captured frames (higher is better) | 74.0 (±1.62) | 74.0 (±0.98) | 1.00 × | 0.99–1.01 | ≈ |
