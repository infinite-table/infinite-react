# AG Grid vs Infinite Table — benchmark report

- Run: `2026-11-11-final` · 2026-11-11T13:30:55.417Z
- AG Grid 36.3.0 · Infinite Table 10.1.3
- 300,000 rows (data checksum `300000:72377c6e`) · 1,000,000 rows (data checksum `1000000:19e5eebe`) × 20 columns, identical data for both grids
- Chrome 136.0.7103.25 · headless · CPU throttling 1× · viewport 1400×1000
- 7 measured runs per grid per scenario (+1 warmup, discarded), A/B interleaved, fresh browser context per run
- Darwin 24.1.0 arm64 · Apple M1 Pro × 10
- Served from http://localhost:5560/

"Infinite / AG" < 1 means Infinite has the lower value. "Better" is only set when the 95% bootstrap CI of the ratio of medians excludes 1. When AG Grid has zeros among its values (e.g. 0% blank samples) a ratio means nothing, so the difference of medians (Infinite − AG) and its CI are shown instead, and "Better" needs that CI to exclude 0.

# 300,000 rows

Scroll range - browsers cap element sizes (Chrome ~16.7M-33.5M px, depending on the version), so grids map the scrollbar onto the rows when the content is taller than that.

| | AG Grid | Infinite |
|---|---:|---:|
| Last row reachable with the scrollbar | yes (300,000) | yes (300,000) |
| Native scroll range | 11,999,243 px | 11,999,240 px |
| Content px per scrollbar px | 1.000 | 1.000 |

## mount - 300,000 rows

Mount the grid with all the rows (data already in memory). "Visible" = from setState to the end of the first frame committed with the whole viewport (first/last visible row and column) showing the right content. "Settled" = until the first frame committed after the grid's last DOM mutation. Memory is the JS heap retained by the grid after GC (heap after mount - heap before mount).

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Time to first rows painted (lower is better) | 210 ms (±17.8) | 134 ms (±26.8) | 0.64 × | 0.59–0.71 | Infinite |
| Time until settled (lower is better) | 313 ms (±18.1) | 141 ms (±24.5) | 0.45 × | 0.42–0.50 | Infinite |
| Main thread: scripting (lower is better) | 190 ms (±15.9) | 120 ms (±26.4) | 0.63 × | 0.60–0.71 | Infinite |
| Main thread: layout (lower is better) | 7.59 ms (±0.73) | 1.94 ms (±0.16) | 0.26 × | 0.23–0.29 | Infinite |
| Main thread: style recalc (lower is better) | 8.37 ms (±0.58) | 3.69 ms (±0.35) | 0.44 × | 0.39–0.51 | Infinite |
| Main thread: all tasks (lower is better) | 217 ms (±16.3) | 136 ms (±25.9) | 0.63 × | 0.60–0.71 | Infinite |
| JS heap retained by grid (lower is better) | 67.5 MB (±0.00) | 36.2 MB (±0.48) | 0.54 × | 0.52–0.54 | Infinite |
| DOM elements in grid (lower is better) | 637 (±0.00) | 607 (±0.00) | 0.95 × | 0.95–0.95 | Infinite |

## sort-string - 300,000 rows

Click the "code" column header (string column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Ascending: click to sorted rows painted (lower is better) | 743 ms (±144) | 324 ms (±37.6) | 0.44 × | 0.35–0.48 | Infinite |
| Ascending: click to settled (lower is better) | 743 ms (±144) | 327 ms (±35.3) | 0.44 × | 0.37–0.49 | Infinite |
| Descending: click to sorted rows painted (lower is better) | 780 ms (±95.8) | 336 ms (±48.7) | 0.43 × | 0.36–0.47 | Infinite |
| Descending: click to settled (lower is better) | 780 ms (±95.8) | 336 ms (±48.7) | 0.43 × | 0.36–0.47 | Infinite |
| Ascending: main thread scripting (lower is better) | 731 ms (±143) | 315 ms (±36.0) | 0.43 × | 0.35–0.47 | Infinite |
| Descending: main thread scripting (lower is better) | 771 ms (±95.2) | 321 ms (±50.8) | 0.42 × | 0.35–0.45 | Infinite |

## sort-number - 300,000 rows

Click the "salary" column header (number column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Ascending: click to sorted rows painted (lower is better) | 810 ms (±106) | 330 ms (±14.9) | 0.41 × | 0.39–0.49 | Infinite |
| Ascending: click to settled (lower is better) | 810 ms (±106) | 345 ms (±16.6) | 0.43 × | 0.40–0.51 | Infinite |
| Descending: click to sorted rows painted (lower is better) | 786 ms (±104) | 322 ms (±25.6) | 0.41 × | 0.35–0.48 | Infinite |
| Descending: click to settled (lower is better) | 786 ms (±104) | 322 ms (±25.6) | 0.41 × | 0.35–0.48 | Infinite |
| Ascending: main thread scripting (lower is better) | 798 ms (±104) | 317 ms (±14.8) | 0.40 × | 0.38–0.48 | Infinite |
| Descending: main thread scripting (lower is better) | 777 ms (±102) | 307 ms (±26.0) | 0.40 × | 0.34–0.46 | Infinite |

## scroll-jump - 300,000 rows

Programmatic jumps to 10 far-away scroll positions (like dragging the scrollbar thumb). Measured from setting scrollTop to the end of the first frame committed with the first and last visible rows showing the right content, at the right position.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Jump to rows painted (median of jumps) (lower is better) | 25.7 ms (±3.36) | 24.1 ms (±3.22) | 0.94 × | 0.83–1.19 | ≈ |
| Jump to rows painted (worst jump) (lower is better) | 41.2 ms (±5.64) | 29.0 ms (±3.81) | 0.70 × | 0.65–0.92 | Infinite |
| Jump to settled (median of jumps) (lower is better) | 25.7 ms (±3.36) | 24.1 ms (±3.22) | 0.94 × | 0.83–1.19 | ≈ |
| Main thread scripting (all jumps) (lower is better) | 147 ms (±16.9) | 134 ms (±22.3) | 0.91 × | 0.80–1.17 | ≈ |

## scroll-vertical - 300,000 rows

Wheel-scroll down 24000px at 8000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for both grids). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Frames fully presented (higher is better) | 52.3 % (±1.15) | 56.7 % (±1.61) | 1.08 × | 1.03–1.10 | Infinite |
| Frames presented without main-thread update (lower is better) | 47.7 % (±1.15) | 43.3 % (±1.61) | 0.91 × | 0.90–0.97 | Infinite |
| Frames dropped (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.00) | 60.0 fps (±0.01) | 1.00 × | 1.00–1.00 | ≈ |
| p95 rAF frame interval (lower is better) | 17.5 ms (±0.14) | 17.5 ms (±0.14) | 1.00 × | 0.99–1.02 | ≈ |
| Worst rAF frame interval (lower is better) | 17.6 ms (±0.05) | 17.7 ms (±0.08) | 1.01 × | 0.99–1.01 | ≈ |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms | 0.00 to 0.00 | ≈ |
| Main thread: scripting (lower is better) | 393 ms (±9.21) | 478 ms (±14.2) | 1.22 × | 1.17–1.25 | AG Grid |
| Main thread: layout (lower is better) | 75.8 ms (±2.84) | 54.8 ms (±3.36) | 0.72 × | 0.68–0.81 | Infinite |
| Main thread: style recalc (lower is better) | 176 ms (±5.43) | 124 ms (±5.90) | 0.70 × | 0.67–0.73 | Infinite |
| Main thread: all tasks (lower is better) | 992 ms (±20.8) | 1052 ms (±49.7) | 1.06 × | 1.01–1.12 | AG Grid |

## scroll-horizontal - 300,000 rows

Wheel-scroll right/left over all columns, 4 sweeps at 4000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for both grids). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Frames fully presented (higher is better) | 86.0 % (±3.72) | 89.0 % (±10.1) | 1.04 × | 0.84–1.13 | ≈ |
| Frames presented without main-thread update (lower is better) | 14.0 % (±3.72) | 11.0 % (±10.1) | 0.78 × | 0.23–2.51 | ≈ |
| Frames dropped (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.00) | 60.0 fps (±0.01) | 1.00 × | 1.00–1.00 | ≈ |
| p95 rAF frame interval (lower is better) | 17.3 ms (±0.18) | 17.6 ms (±0.20) | 1.02 × | 0.99–1.02 | ≈ |
| Worst rAF frame interval (lower is better) | 17.7 ms (±0.08) | 17.7 ms (±0.10) | 1.00 × | 0.99–1.01 | ≈ |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms | 0.00 to 0.00 | ≈ |
| Main thread: scripting (lower is better) | 170 ms (±6.17) | 106 ms (±8.81) | 0.63 × | 0.59–0.67 | Infinite |
| Main thread: layout (lower is better) | 51.7 ms (±2.58) | 8.33 ms (±0.47) | 0.16 × | 0.16–0.18 | Infinite |
| Main thread: style recalc (lower is better) | 30.3 ms (±1.11) | 34.3 ms (±3.46) | 1.13 × | 1.08–1.27 | AG Grid |
| Main thread: all tasks (lower is better) | 432 ms (±23.2) | 325 ms (±24.7) | 0.75 × | 0.67–0.79 | Infinite |

## correctness-vertical - 300,000 rows

Same kind of vertical wheel gesture, faster (20000px/s). After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Blank samples (lower is better) | 3.38 % (±0.78) | 0.00 % (±0.00) | 0.00 × | 0.00–0.00 | Infinite |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 38.4 % (±1.97) | +38.4 % | +37.7 to +38.8 | AG Grid |
| Frames with any blank/wrong sample (lower is better) | 16.9 % (±3.88) | 90.9 % (±1.49) | 5.38 × | 4.79–7.29 | AG Grid |
| Worst frame: correct samples (higher is better) | 80.0 % (±0.00) | 10.5 % (±19.8) | 0.13 × | 0.09–0.59 | AG Grid |

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
| Captured frames with blank rows (lower is better) | 2.70 % (±1.72) | 0.00 % (±0.00) | 0.00 × | 0.00–0.00 | Infinite |
| Blank body area (avg over frames) (lower is better) | 0.51 % (±0.35) | 0.00 % (±0.00) | 0.00 × | 0.00–0.00 | Infinite |
| Worst frame: blank rows (lower is better) | 4.00 rows (±2.14) | 0.00 rows (±0.00) | 0.00 × | 0.00–0.00 | Infinite |
| Captured frames (higher is better) | 74.0 (±0.38) | 74.0 (±0.38) | 1.00 × | 1.00–1.00 | ≈ |

# 1,000,000 rows

Scroll range - browsers cap element sizes (Chrome ~16.7M-33.5M px, depending on the version), so grids map the scrollbar onto the rows when the content is taller than that.

| | AG Grid | Infinite |
|---|---:|---:|
| Last row reachable with the scrollbar | yes (1,000,000) | yes (1,000,000) |
| Native scroll range | 31,999,242 px | 31,999,240 px |
| Content px per scrollbar px | 1.250 | 1.250 |

## mount - 1,000,000 rows

Mount the grid with all the rows (data already in memory). "Visible" = from setState to the end of the first frame committed with the whole viewport (first/last visible row and column) showing the right content. "Settled" = until the first frame committed after the grid's last DOM mutation. Memory is the JS heap retained by the grid after GC (heap after mount - heap before mount).

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Time to first rows painted (lower is better) | 476 ms (±8.55) | 329 ms (±17.9) | 0.69 × | 0.61–0.70 | Infinite |
| Time until settled (lower is better) | 580 ms (±8.82) | 345 ms (±15.8) | 0.60 × | 0.58–0.61 | Infinite |
| Main thread: scripting (lower is better) | 459 ms (±8.11) | 323 ms (±17.8) | 0.70 × | 0.63–0.72 | Infinite |
| Main thread: layout (lower is better) | 6.96 ms (±0.21) | 1.85 ms (±0.08) | 0.27 × | 0.25–0.28 | Infinite |
| Main thread: style recalc (lower is better) | 7.74 ms (±0.32) | 3.46 ms (±0.14) | 0.45 × | 0.41–0.46 | Infinite |
| Main thread: all tasks (lower is better) | 490 ms (±7.90) | 336 ms (±17.9) | 0.69 × | 0.62–0.70 | Infinite |
| JS heap retained by grid (lower is better) | 213 MB (±0.00) | 89.4 MB (±0.00) | 0.42 × | 0.42–0.42 | Infinite |
| DOM elements in grid (lower is better) | 637 (±0.00) | 607 (±0.00) | 0.95 × | 0.95–0.95 | Infinite |

## sort-string - 1,000,000 rows

Click the "code" column header (string column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Ascending: click to sorted rows painted (lower is better) | 3771 ms (±203) | 1410 ms (±163) | 0.37 × | 0.35–0.44 | Infinite |
| Ascending: click to settled (lower is better) | 3771 ms (±203) | 1412 ms (±163) | 0.37 × | 0.35–0.44 | Infinite |
| Descending: click to sorted rows painted (lower is better) | 3760 ms (±295) | 1618 ms (±132) | 0.43 × | 0.37–0.50 | Infinite |
| Descending: click to settled (lower is better) | 3760 ms (±295) | 1618 ms (±132) | 0.43 × | 0.37–0.50 | Infinite |
| Ascending: main thread scripting (lower is better) | 3759 ms (±203) | 1399 ms (±162) | 0.37 × | 0.35–0.44 | Infinite |
| Descending: main thread scripting (lower is better) | 3751 ms (±295) | 1603 ms (±131) | 0.43 × | 0.37–0.49 | Infinite |

## sort-number - 1,000,000 rows

Click the "salary" column header (number column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Ascending: click to sorted rows painted (lower is better) | 3594 ms (±274) | 1359 ms (±146) | 0.38 × | 0.32–0.42 | Infinite |
| Ascending: click to settled (lower is better) | 3594 ms (±274) | 1364 ms (±142) | 0.38 × | 0.32–0.43 | Infinite |
| Descending: click to sorted rows painted (lower is better) | 3496 ms (±345) | 1305 ms (±108) | 0.37 × | 0.32–0.45 | Infinite |
| Descending: click to settled (lower is better) | 3496 ms (±345) | 1305 ms (±108) | 0.37 × | 0.32–0.45 | Infinite |
| Ascending: main thread scripting (lower is better) | 3576 ms (±265) | 1347 ms (±145) | 0.38 × | 0.32–0.42 | Infinite |
| Descending: main thread scripting (lower is better) | 3484 ms (±342) | 1291 ms (±108) | 0.37 × | 0.32–0.45 | Infinite |

## scroll-jump - 1,000,000 rows

Programmatic jumps to 10 far-away scroll positions (like dragging the scrollbar thumb). Measured from setting scrollTop to the end of the first frame committed with the first and last visible rows showing the right content, at the right position.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Jump to rows painted (median of jumps) (lower is better) | 24.1 ms (±2.57) | 25.5 ms (±1.55) | 1.06 × | 0.93–1.27 | ≈ |
| Jump to rows painted (worst jump) (lower is better) | 41.3 ms (±49.5) | 39.2 ms (±11.8) | 0.95 × | 0.54–1.12 | ≈ |
| Jump to settled (median of jumps) (lower is better) | 24.1 ms (±2.57) | 25.5 ms (±1.55) | 1.06 × | 0.93–1.27 | ≈ |
| Main thread scripting (all jumps) (lower is better) | 158 ms (±98.4) | 161 ms (±15.4) | 1.02 × | 0.83–1.25 | ≈ |

## scroll-vertical - 1,000,000 rows

Wheel-scroll down 24000px at 8000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for both grids). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Frames fully presented (higher is better) | 55.8 % (±2.51) | 62.0 % (±7.32) | 1.11 × | 1.04–1.27 | Infinite |
| Frames presented without main-thread update (lower is better) | 44.2 % (±2.42) | 38.0 % (±7.26) | 0.86 × | 0.69–0.95 | Infinite |
| Frames dropped (lower is better) | 0.00 % (±0.27) | 0.00 % (±0.21) | 0.00 % | -0.56 to 0.00 | ≈ |
| Main thread frame rate (rAF) (higher is better) | 59.3 fps (±2.17) | 58.7 fps (±4.24) | 0.99 × | 0.95–1.05 | ≈ |
| p95 rAF frame interval (lower is better) | 17.6 ms (±0.10) | 17.6 ms (±6.13) | 1.00 × | 0.99–1.02 | ≈ |
| Worst rAF frame interval (lower is better) | 33.4 ms (±53.1) | 50.6 ms (±27.6) | 1.51 × | 0.41–3.76 | ≈ |
| rAF intervals > 25ms (lower is better) | 1.09 % (±1.78) | 2.21 % (±6.26) | +1.12 % | -2.33 to +3.96 | ≈ |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±53.1) | 0.00 ms (±0.00) | 0.00 ms | -14.3 to 0.00 | ≈ |
| Main thread: scripting (lower is better) | 554 ms (±83.3) | 588 ms (±48.1) | 1.06 × | 0.81–1.22 | ≈ |
| Main thread: layout (lower is better) | 95.2 ms (±6.28) | 78.9 ms (±18.9) | 0.83 × | 0.74–0.95 | Infinite |
| Main thread: style recalc (lower is better) | 305 ms (±18.1) | 161 ms (±14.4) | 0.53 × | 0.48–0.57 | Infinite |
| Main thread: all tasks (lower is better) | 1517 ms (±156) | 1360 ms (±153) | 0.90 × | 0.75–1.03 | ≈ |

## scroll-horizontal - 1,000,000 rows

Wheel-scroll right/left over all columns, 4 sweeps at 4000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for both grids). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Frames fully presented (higher is better) | 86.0 % (±5.36) | 89.4 % (±7.55) | 1.04 × | 0.93–1.13 | ≈ |
| Frames presented without main-thread update (lower is better) | 14.0 % (±5.36) | 10.6 % (±7.55) | 0.76 × | 0.20–1.57 | ≈ |
| Frames dropped (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±1.00) | 60.0 fps (±0.01) | 1.00 × | 1.00–1.00 | ≈ |
| p95 rAF frame interval (lower is better) | 17.3 ms (±0.15) | 17.3 ms (±0.20) | 1.00 × | 0.99–1.02 | ≈ |
| Worst rAF frame interval (lower is better) | 17.7 ms (±18.6) | 17.7 ms (±0.05) | 1.00 × | 0.99–1.00 | ≈ |
| rAF intervals > 25ms (lower is better) | 0.00 % (±1.17) | 0.00 % (±0.00) | 0.00 % | 0.00 to 0.00 | ≈ |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms | 0.00 to 0.00 | ≈ |
| Main thread: scripting (lower is better) | 180 ms (±33.1) | 121 ms (±4.90) | 0.67 × | 0.64–0.72 | Infinite |
| Main thread: layout (lower is better) | 53.1 ms (±5.92) | 9.21 ms (±0.23) | 0.17 × | 0.16–0.18 | Infinite |
| Main thread: style recalc (lower is better) | 35.5 ms (±3.39) | 38.5 ms (±1.01) | 1.08 × | 1.01–1.19 | AG Grid |
| Main thread: all tasks (lower is better) | 419 ms (±102) | 363 ms (±19.0) | 0.87 × | 0.81–0.92 | Infinite |

## correctness-vertical - 1,000,000 rows

Same kind of vertical wheel gesture, faster (20000px/s). After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | AG Grid median (sd) | Infinite median (sd) | Infinite / AG (or Infinite − AG) | 95% CI | Better |
|---|---:|---:|---:|---:|:---:|
| Blank samples (lower is better) | 2.47 % (±0.35) | 0.00 % (±0.00) | 0.00 × | 0.00–0.00 | Infinite |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 50.5 % (±12.2) | +50.5 % | +49.7 to +74.1 | AG Grid |
| Frames with any blank/wrong sample (lower is better) | 12.3 % (±1.73) | 90.4 % (±2.90) | 7.33 × | 6.84–7.74 | AG Grid |
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
| Captured frames with blank rows (lower is better) | 10.7 % (±7.95) | 0.00 % (±0.00) | 0.00 × | 0.00–0.00 | Infinite |
| Blank body area (avg over frames) (lower is better) | 3.94 % (±2.08) | 0.00 % (±0.00) | 0.00 × | 0.00–0.00 | Infinite |
| Worst frame: blank rows (lower is better) | 14.0 rows (±4.47) | 0.00 rows (±0.00) | 0.00 × | 0.00–0.00 | Infinite |
| Captured frames (higher is better) | 74.0 (±0.49) | 74.0 (±0.00) | 1.00 × | 0.99–1.00 | ≈ |
