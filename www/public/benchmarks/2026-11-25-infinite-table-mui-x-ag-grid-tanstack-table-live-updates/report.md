# MUI X Data Grid vs AG Grid vs TanStack Table vs Infinite Table — benchmark report

- Run: `ci` · 2026-11-25T10:54:22.499Z
- MUI X Data Grid 9.18.0 · AG Grid 36.3.0 · TanStack Table 9.3.1 · Infinite Table 10.2.1
- 300,000 rows (data checksum `300000:72377c6e`) · 1,000,000 rows (data checksum `1000000:19e5eebe`) × 20 columns, identical data for every grid
- Chrome 136.0.7103.25 · headless · CPU throttling 1× · viewport 1400×1000
- 7 measured runs per grid per scenario (+1 warmup, discarded), interleaved, fresh browser context per run
- Linux 7.0.0-1014-aws x64 · Intel(R) Xeon(R) 6975P-C × 4
- Served from http://localhost:5560/
- Grid body: 757-758 px high, with the same number of rows in view in every grid (to get there, the setup made the boxes taller: MUI X +14 px, Infinite +22 px)

The "Infinite vs ..." columns compare Infinite Table with one other grid: the ratio of the medians (Infinite / other, so < 1 means Infinite has the lower value), its 95% bootstrap confidence interval, and the grid that does better. A grid is only named when the interval excludes 1; "≈" means no significant difference. When the other grid has zeros among its values (e.g. 0% blank samples) a ratio means nothing, so the difference of the medians (Infinite − other) and its interval are shown instead, and a grid is only named when that interval excludes 0.

# 300,000 rows

Scroll range - browsers cap element sizes (Chrome ~16.7M-33.5M px, depending on the version), so a grid has to map the scrollbar onto the rows when the content is taller than that. One that doesn't can't reach its last rows: its scrolling results are for the rows it can reach, and the same wheel gesture goes over fewer rows in it.

| | MUI X | AG Grid | TanStack | Infinite |
|---|---:|---:|---:|---:|
| Last row reachable with the scrollbar | yes (300,000) | yes (300,000) | yes (300,000) | yes (300,000) |
| Native scroll range | 11,999,228 px | 11,999,243 px | 11,999,242 px | 11,999,242 px |
| Content px per scrollbar px | 1.000 | 1.000 | 1.000 | 1.000 |

## mount - 300,000 rows

Mount the grid with all the rows (data already in memory). "Visible" = from setState to the end of the first frame committed with the whole viewport (first/last visible row and column) showing the right content. "Settled" = until the first frame committed after the grid's last DOM mutation. Memory is the JS heap retained by the grid after GC (heap after mount - heap before mount).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Time to first rows painted (lower is better) | 268 ms (±9.56) | 292 ms (±5.37) | 208 ms (±6.65) | 205 ms (±12.1) | 0.77 × (0.73–0.85) **Infinite** | 0.70 × (0.67–0.76) **Infinite** | 0.99 × (0.93–1.07) ≈ |
| Time until settled (lower is better) | 268 ms (±9.56) | 395 ms (±5.44) | 208 ms (±6.65) | 221 ms (±6.73) | 0.83 × (0.78–0.86) **Infinite** | 0.56 × (0.53–0.57) **Infinite** | 1.06 × (0.99–1.11) ≈ |
| Main thread: scripting (lower is better) | 248 ms (±8.72) | 269 ms (±5.05) | 193 ms (±4.62) | 191 ms (±12.9) | 0.77 × (0.71–0.85) **Infinite** | 0.71 × (0.65–0.76) **Infinite** | 0.99 × (0.92–1.06) ≈ |
| Main thread: layout (lower is better) | 6.43 ms (±1.09) | 7.37 ms (±0.52) | 7.08 ms (±2.76) | 3.74 ms (±0.39) | 0.58 × (0.49–0.65) **Infinite** | 0.51 × (0.44–0.57) **Infinite** | 0.53 × (0.35–0.70) **Infinite** |
| Main thread: style recalc (lower is better) | 6.18 ms (±0.14) | 10.6 ms (±0.23) | 2.16 ms (±0.32) | 7.56 ms (±1.04) | 1.22 × (0.97–1.30) ≈ | 0.72 × (0.56–0.76) **Infinite** | 3.51 × (2.60–3.82) **TanStack** |
| Main thread: all tasks (lower is better) | 299 ms (±8.66) | 300 ms (±5.01) | 210 ms (±6.57) | 219 ms (±8.46) | 0.73 × (0.70–0.77) **Infinite** | 0.73 × (0.69–0.76) **Infinite** | 1.04 × (0.98–1.11) ≈ |
| JS heap retained by grid (lower is better) | 54.2 MB (±0.00) | 67.4 MB (±0.00) | 86.6 MB (±0.00) | 35.7 MB (±0.45) | 0.66 × (0.66–0.67) **Infinite** | 0.53 × (0.53–0.54) **Infinite** | 0.41 × (0.41–0.42) **Infinite** |
| DOM elements in grid (lower is better) | 529 (±0.00) | 637 (±0.00) | 352 (±0.00) | 609 (±0.00) | 1.15 × (1.15–1.15) **MUI X** | 0.96 × (0.96–0.96) **Infinite** | 1.73 × (1.73–1.73) **TanStack** |

## sort-string - 300,000 rows

Click the "code" column header (string column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 919 ms (±47.6) | 776 ms (±27.5) | 1069 ms (±35.6) | 389 ms (±13.0) | 0.42 × (0.40–0.44) **Infinite** | 0.50 × (0.48–0.52) **Infinite** | 0.36 × (0.35–0.39) **Infinite** |
| Ascending: click to settled (lower is better) | 919 ms (±47.6) | 776 ms (±27.5) | 1069 ms (±35.6) | 399 ms (±12.6) | 0.43 × (0.41–0.45) **Infinite** | 0.51 × (0.49–0.54) **Infinite** | 0.37 × (0.36–0.40) **Infinite** |
| Descending: click to sorted rows painted (lower is better) | 914 ms (±42.2) | 809 ms (±35.9) | 1049 ms (±34.1) | 397 ms (±9.16) | 0.43 × (0.41–0.45) **Infinite** | 0.49 × (0.48–0.53) **Infinite** | 0.38 × (0.38–0.39) **Infinite** |
| Descending: click to settled (lower is better) | 914 ms (±42.2) | 809 ms (±35.9) | 1049 ms (±34.1) | 397 ms (±9.16) | 0.43 × (0.41–0.45) **Infinite** | 0.49 × (0.48–0.53) **Infinite** | 0.38 × (0.38–0.39) **Infinite** |
| Ascending: main thread scripting (lower is better) | 908 ms (±47.4) | 759 ms (±26.9) | 1061 ms (±35.7) | 377 ms (±13.3) | 0.42 × (0.39–0.43) **Infinite** | 0.50 × (0.47–0.52) **Infinite** | 0.36 × (0.34–0.38) **Infinite** |
| Descending: main thread scripting (lower is better) | 906 ms (±42.1) | 796 ms (±35.6) | 1042 ms (±34.0) | 383 ms (±9.31) | 0.42 × (0.40–0.44) **Infinite** | 0.48 × (0.47–0.52) **Infinite** | 0.37 × (0.37–0.38) **Infinite** |

## sort-number - 300,000 rows

Click the "salary" column header (number column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 510 ms (±13.7) | 699 ms (±25.1) | 754 ms (±23.1) | 188 ms (±5.16) | 0.37 × (0.35–0.38) **Infinite** | 0.27 × (0.25–0.28) **Infinite** | 0.25 × (0.24–0.26) **Infinite** |
| Ascending: click to settled (lower is better) | 510 ms (±13.7) | 699 ms (±25.1) | 754 ms (±23.1) | 196 ms (±2.09) | 0.38 × (0.37–0.39) **Infinite** | 0.28 × (0.27–0.29) **Infinite** | 0.26 × (0.25–0.27) **Infinite** |
| Descending: click to sorted rows painted (lower is better) | 628 ms (±14.2) | 678 ms (±32.0) | 753 ms (±33.9) | 178 ms (±4.28) | 0.28 × (0.27–0.29) **Infinite** | 0.26 × (0.25–0.27) **Infinite** | 0.24 × (0.23–0.25) **Infinite** |
| Descending: click to settled (lower is better) | 628 ms (±14.2) | 678 ms (±32.0) | 753 ms (±33.9) | 178 ms (±4.28) | 0.28 × (0.27–0.29) **Infinite** | 0.26 × (0.25–0.27) **Infinite** | 0.24 × (0.23–0.25) **Infinite** |
| Ascending: main thread scripting (lower is better) | 500 ms (±13.5) | 682 ms (±25.2) | 747 ms (±23.2) | 175 ms (±4.85) | 0.35 × (0.33–0.36) **Infinite** | 0.26 × (0.24–0.27) **Infinite** | 0.23 × (0.22–0.24) **Infinite** |
| Descending: main thread scripting (lower is better) | 620 ms (±14.1) | 665 ms (±32.2) | 747 ms (±33.8) | 164 ms (±4.26) | 0.26 × (0.25–0.27) **Infinite** | 0.25 × (0.23–0.25) **Infinite** | 0.22 × (0.21–0.23) **Infinite** |

## scroll-jump - 300,000 rows

Programmatic jumps to 10 far-away scroll positions (like dragging the scrollbar thumb). Measured from setting scrollTop to the end of the first frame committed with the first and last visible rows showing the right content, at the right position.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Jump to rows painted (median of jumps) (lower is better) | 22.0 ms (±0.37) | 30.2 ms (±0.67) | 10.8 ms (±0.24) | 27.1 ms (±0.90) | 1.23 × (1.18–1.26) **MUI X** | 0.90 × (0.86–0.91) **Infinite** | 2.50 × (2.40–2.57) **TanStack** |
| Jump to rows painted (worst jump) (lower is better) | 31.5 ms (±1.18) | 47.0 ms (±1.45) | 22.4 ms (±1.14) | 34.8 ms (±1.59) | 1.10 × (1.04–1.18) **MUI X** | 0.74 × (0.71–0.78) **Infinite** | 1.55 × (1.45–1.62) **TanStack** |
| Jump to settled (median of jumps) (lower is better) | 22.0 ms (±0.37) | 30.2 ms (±0.67) | 10.8 ms (±0.24) | 27.1 ms (±0.90) | 1.23 × (1.18–1.26) **MUI X** | 0.90 × (0.86–0.91) **Infinite** | 2.50 × (2.40–2.57) **TanStack** |
| Main thread scripting (all jumps) (lower is better) | 144 ms (±2.77) | 191 ms (±2.48) | 74.1 ms (±1.29) | 160 ms (±3.02) | 1.11 × (1.10–1.16) **MUI X** | 0.83 × (0.82–0.86) **Infinite** | 2.15 × (2.13–2.26) **TanStack** |

## scroll-vertical - 300,000 rows

Wheel-scroll down 24000px at 8000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 50.3 % (±0.00) | 68.2 % (±17.2) | 100 % (±18.8) | 59.1 % (±2.19) | 1.17 × (1.17–1.23) **Infinite** | 0.87 × (0.82–1.18) ≈ | 0.59 × (0.59–0.62) **TanStack** |
| Frames presented without main-thread update (lower is better) | 49.5 % (±0.00) | 31.5 % (±17.1) | 0.00 % (±18.7) | 40.9 % (±2.19) | 0.83 × (0.77–0.83) **Infinite** | +9.47 (-9.24 to +13.7) ≈ | +40.9 (+38.1 to +41.0) **TanStack** |
| Frames dropped (lower is better) | 0.27 % (±0.00) | 0.29 % (±0.17) | 0.00 % (±0.10) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **Infinite** | -0.29 (-0.38 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 59.4 fps (±0.36) | 0.99 × (0.98–0.99) **MUI X** | 0.99 × (0.98–0.99) **AG Grid** | 0.99 × (0.98–0.99) **TanStack** |
| p95 rAF frame interval (lower is better) | 16.8 ms (±0.05) | 16.7 ms (±0.05) | 16.8 ms (±0.04) | 16.8 ms (±0.05) | 1.00 × (0.99–1.01) ≈ | 1.00 × (0.99–1.01) ≈ | 1.00 × (0.99–1.00) ≈ |
| Worst rAF frame interval (lower is better) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 50.0 ms (±8.16) | 2.98 × (1.98–2.98) **MUI X** | 2.98 × (1.98–2.98) **AG Grid** | 2.98 × (1.98–2.98) **TanStack** |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.54 % (±0.30) | +0.54 (+0.54 to +1.10) **MUI X** | +0.54 (+0.54 to +1.10) **AG Grid** | +0.54 (+0.54 to +1.10) **TanStack** |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Main thread: scripting (lower is better) | 418 ms (±9.09) | 447 ms (±7.31) | 245 ms (±16.8) | 519 ms (±10.2) | 1.24 × (1.18–1.25) **MUI X** | 1.16 × (1.12–1.18) **AG Grid** | 2.11 × (2.03–2.17) **TanStack** |
| Main thread: layout (lower is better) | 48.0 ms (±0.74) | 74.9 ms (±1.03) | 63.2 ms (±0.81) | 62.4 ms (±1.60) | 1.30 × (1.26–1.33) **MUI X** | 0.83 × (0.82–0.86) **Infinite** | 0.99 × (0.98–1.03) ≈ |
| Main thread: style recalc (lower is better) | 73.2 ms (±1.38) | 226 ms (±4.39) | 31.0 ms (±1.97) | 147 ms (±1.58) | 2.01 × (1.96–2.05) **MUI X** | 0.65 × (0.64–0.67) **Infinite** | 4.75 × (4.31–4.78) **TanStack** |
| Main thread: all tasks (lower is better) | 1109 ms (±18.4) | 1197 ms (±26.0) | 701 ms (±23.3) | 1116 ms (±11.8) | 1.01 × (0.97–1.01) ≈ | 0.93 × (0.91–0.95) **Infinite** | 1.59 × (1.56–1.63) **TanStack** |

## scroll-horizontal - 300,000 rows

Wheel-scroll right/left over all columns, 4 sweeps at 4000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 80.3 % (±0.16) | 100 % (±6.95) | 80.3 % (±0.25) | 89.0 % (±5.10) | 1.11 × (1.11–1.20) **Infinite** | 0.89 × (0.89–0.97) **AG Grid** | 1.11 × (1.10–1.20) **Infinite** |
| Frames presented without main-thread update (lower is better) | 19.0 % (±0.17) | 0.00 % (±6.67) | 19.0 % (±0.18) | 11.0 % (±5.10) | 0.58 × (0.18–0.59) **Infinite** | +11.0 (+3.42 to +11.3) **AG Grid** | 0.58 × (0.18–0.59) **Infinite** |
| Frames dropped (lower is better) | 0.70 % (±0.00) | 0.00 % (±0.28) | 0.70 % (±0.27) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ | -0.70 (-0.70 to -0.70) **Infinite** |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) **AG Grid** | 1.00 × (1.00–1.00) ≈ |
| p95 rAF frame interval (lower is better) | 16.7 ms (±0.00) | 16.7 ms (±0.05) | 16.7 ms (±0.05) | 16.7 ms (±0.05) | 1.00 × (1.00–1.01) ≈ | 1.00 × (0.99–1.01) ≈ | 1.00 × (0.99–1.01) ≈ |
| Worst rAF frame interval (lower is better) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Main thread: scripting (lower is better) | 272 ms (±16.3) | 184 ms (±13.2) | 115 ms (±12.9) | 124 ms (±7.95) | 0.46 × (0.41–0.50) **Infinite** | 0.67 × (0.60–0.74) **Infinite** | 1.08 × (0.87–1.15) ≈ |
| Main thread: layout (lower is better) | 35.0 ms (±3.57) | 47.1 ms (±3.51) | 32.9 ms (±4.31) | 9.84 ms (±1.14) | 0.28 × (0.23–0.34) **Infinite** | 0.21 × (0.17–0.22) **Infinite** | 0.30 × (0.22–0.31) **Infinite** |
| Main thread: style recalc (lower is better) | 19.9 ms (±1.85) | 34.7 ms (±1.67) | 9.84 ms (±1.53) | 37.9 ms (±1.92) | 1.91 × (1.80–2.30) **MUI X** | 1.09 × (1.02–1.19) **AG Grid** | 3.85 × (3.03–4.16) **TanStack** |
| Main thread: all tasks (lower is better) | 556 ms (±41.9) | 483 ms (±27.5) | 371 ms (±27.6) | 348 ms (±20.6) | 0.63 × (0.59–0.73) **Infinite** | 0.72 × (0.67–0.78) **Infinite** | 0.94 × (0.82–1.00) ≈ |

## correctness-vertical - 300,000 rows

Same kind of vertical wheel gesture, faster (20000px/s). After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Blank samples (lower is better) | 0.00 % (±0.00) | 3.04 % (±0.65) | 2.28 % (±0.80) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 41.1 % (±1.73) | +41.1 (+40.1 to +42.2) **MUI X** | +41.1 (+40.1 to +42.2) **AG Grid** | +41.1 (+40.1 to +42.2) **TanStack** |
| Frames with any blank/wrong sample (lower is better) | 0.00 % (±0.00) | 15.2 % (±3.25) | 11.4 % (±3.98) | 89.6 % (±1.09) | +89.6 (+88.6 to +90.0) **MUI X** | 5.90 × (5.32–8.78) **AG Grid** | 7.86 × (5.39–11.8) **TanStack** |
| Worst frame: correct samples (higher is better) | 100 % (±0.00) | 80.0 % (±0.00) | 80.0 % (±0.00) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **MUI X** | 0.00 × (0.00–0.00) **AG Grid** | 0.00 × (0.00–0.00) **TanStack** |

## correctness-horizontal - 300,000 rows

Same kind of horizontal wheel gesture. After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Blank samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Frames with any blank/wrong sample (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Worst frame: correct samples (higher is better) | 100 % (±0.00) | 100 % (±0.00) | 100 % (±0.00) | 100 % (±0.00) | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ |

## visual-blank-vertical - 300,000 rows

Fast vertical wheel gesture (20000px/s) while recording what the compositor actually displays (CDP screencast). Each frame is checked for blank areas: vertical runs of the body with no text where rows should be. Unlike the correctness probe, this also catches the compositor scrolling ahead of the main thread. Screencast capture skips frames under load and adds overhead - compare the grids, not absolute numbers.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Captured frames with blank rows (lower is better) | 0.00 % (±0.00) | 4.55 % (±2.37) | 1.39 % (±1.67) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | -1.39 (-2.86 to 0.00) ≈ |
| Blank body area (avg over frames) (lower is better) | 0.00 % (±0.00) | 0.49 % (±0.54) | 0.15 % (±0.16) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | -0.15 (-0.15 to 0.00) ≈ |
| Worst frame: blank rows (lower is better) | 0.00 rows (±0.00) | 4.00 rows (±2.70) | 1.00 rows (±1.46) | 0.00 rows (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | -1.00 (-2.00 to 0.00) ≈ |
| Captured frames (higher is better) | 72.0 (±0.49) | 66.0 (±0.98) | 73.0 (±1.51) | 73.0 (±1.07) | 1.01 × (1.00–1.03) ≈ | 1.11 × (1.07–1.12) **Infinite** | 1.00 × (0.99–1.03) ≈ |

## updates-low - 300,000 rows

Live updates, low frequency. The grid shows the rows in the order of the data. 10 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 153 ms (±1.92) | 45.5 ms (±1.72) | 132 ms (±5.49) | 99.0 ms (±1.26) | 0.65 × (0.64–0.66) **Infinite** | 2.18 × (2.10–2.24) **AG Grid** | 0.75 × (0.71–0.76) **Infinite** |
| Update to rows painted (worst update) (lower is better) | 210 ms (±4.66) | 57.9 ms (±2.91) | 185 ms (±2.82) | 134 ms (±5.27) | 0.64 × (0.61–0.67) **Infinite** | 2.31 × (2.20–2.50) **AG Grid** | 0.72 × (0.69–0.76) **Infinite** |
| Update to settled (median of updates) (lower is better) | 153 ms (±1.92) | 45.5 ms (±1.72) | 132 ms (±5.49) | 99.0 ms (±1.26) | 0.65 × (0.64–0.66) **Infinite** | 2.18 × (2.10–2.24) **AG Grid** | 0.75 × (0.71–0.76) **Infinite** |
| Main thread: layout (all updates) (lower is better) | 6.03 ms (±0.59) | 6.11 ms (±0.37) | 8.15 ms (±0.58) | 4.98 ms (±0.22) | 0.83 × (0.76–0.93) **Infinite** | 0.81 × (0.77–0.92) **Infinite** | 0.61 × (0.57–0.69) **Infinite** |
| Main thread: style recalc (all updates) (lower is better) | 3.45 ms (±0.11) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.41 ms (±0.01) | 0.12 × (0.11–0.12) **Infinite** | +0.41 (+0.40 to +0.42) **AG Grid** | +0.41 (+0.40 to +0.42) **TanStack** |
| Main thread: all tasks (all updates) (lower is better) | 1673 ms (±28.9) | 556 ms (±19.3) | 1585 ms (±22.0) | 1083 ms (±9.20) | 0.65 × (0.63–0.66) **Infinite** | 1.95 × (1.90–2.05) **AG Grid** | 0.68 × (0.67–0.70) **Infinite** |

## updates-low-sorted - 300,000 rows

Live updates, low frequency. The grid shows sorted by salary, highest first - the updates change the salaries, so rows move. 10 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 520 ms (±12.0) | 879 ms (±77.6) | 954 ms (±46.1) | 152 ms (±2.73) | 0.29 × (0.28–0.30) **Infinite** | 0.17 × (0.16–0.19) **Infinite** | 0.16 × (0.15–0.17) **Infinite** |
| Update to rows painted (worst update) (lower is better) | 596 ms (±15.4) | 939 ms (±86.8) | 1159 ms (±54.0) | 201 ms (±6.47) | 0.34 × (0.33–0.35) **Infinite** | 0.21 × (0.19–0.24) **Infinite** | 0.17 × (0.16–0.18) **Infinite** |
| Update to settled (median of updates) (lower is better) | 520 ms (±12.0) | 879 ms (±77.6) | 954 ms (±46.1) | 152 ms (±2.73) | 0.29 × (0.28–0.30) **Infinite** | 0.17 × (0.16–0.19) **Infinite** | 0.16 × (0.15–0.17) **Infinite** |
| Main thread: layout (all updates) (lower is better) | 9.08 ms (±0.20) | 8.02 ms (±0.25) | 13.9 ms (±2.24) | 18.2 ms (±1.10) | 2.01 × (1.91–2.10) **MUI X** | 2.27 × (2.17–2.44) **AG Grid** | 1.31 × (1.20–1.48) **TanStack** |
| Main thread: style recalc (all updates) (lower is better) | 21.8 ms (±2.30) | 21.5 ms (±1.15) | 9.73 ms (±0.50) | 0.50 ms (±0.04) | 0.02 × (0.02–0.02) **Infinite** | 0.02 × (0.02–0.03) **Infinite** | 0.05 × (0.05–0.05) **Infinite** |
| Main thread: all tasks (all updates) (lower is better) | 5442 ms (±110) | 9006 ms (±765) | 9796 ms (±417) | 1658 ms (±21.6) | 0.30 × (0.30–0.31) **Infinite** | 0.18 × (0.17–0.20) **Infinite** | 0.17 × (0.16–0.18) **Infinite** |

## updates-low-filtered - 300,000 rows

Live updates, low frequency. The grid shows filtered to a salary of at least 115,000 (about half of the rows) - the updates change the salaries, so rows go in and out of the filter. 10 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 208 ms (±4.02) | 81.7 ms (±4.27) | 290 ms (±10.1) | 85.5 ms (±2.45) | 0.41 × (0.41–0.42) **Infinite** | 1.05 × (0.99–1.09) ≈ | 0.30 × (0.28–0.30) **Infinite** |
| Update to rows painted (worst update) (lower is better) | 316 ms (±19.6) | 102 ms (±3.22) | 528 ms (±17.8) | 120 ms (±6.02) | 0.38 × (0.37–0.41) **Infinite** | 1.17 × (1.11–1.24) **AG Grid** | 0.23 × (0.22–0.24) **Infinite** |
| Update to settled (median of updates) (lower is better) | 242 ms (±11.7) | 81.7 ms (±4.27) | 290 ms (±10.1) | 89.4 ms (±2.18) | 0.37 × (0.35–0.38) **Infinite** | 1.09 × (1.02–1.13) **AG Grid** | 0.31 × (0.29–0.31) **Infinite** |
| Main thread: layout (all updates) (lower is better) | 6.69 ms (±0.15) | 7.50 ms (±0.35) | 7.71 ms (±0.27) | 7.27 ms (±0.33) | 1.09 × (1.01–1.11) **MUI X** | 0.97 × (0.88–1.00) ≈ | 0.94 × (0.88–0.97) **Infinite** |
| Main thread: style recalc (all updates) (lower is better) | 4.71 ms (±0.10) | 2.05 ms (±0.15) | 1.40 ms (±0.11) | 0.88 ms (±0.48) | 0.19 × (0.16–0.23) **Infinite** | 0.43 × (0.35–0.54) **Infinite** | 0.63 × (0.51–0.80) **Infinite** |
| Main thread: all tasks (all updates) (lower is better) | 2262 ms (±50.7) | 914 ms (±21.3) | 3267 ms (±112) | 956 ms (±16.3) | 0.42 × (0.42–0.43) **Infinite** | 1.05 × (1.02–1.06) **AG Grid** | 0.29 × (0.28–0.30) **Infinite** |

## updates-low-grouped - 300,000 rows

Live updates, low frequency. The grid shows grouped by department (10 collapsed groups), with the sum of the salaries of each group - the updates change the salaries, so the sums change. 10 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | TanStack median (sd) | Infinite median (sd) | Infinite vs TanStack |
|---|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 409 ms (±20.6) | 217 ms (±2.52) | 0.53 × (0.52–0.57) **Infinite** |
| Update to rows painted (worst update) (lower is better) | 669 ms (±32.4) | 308 ms (±8.82) | 0.46 × (0.43–0.48) **Infinite** |
| Update to settled (median of updates) (lower is better) | 409 ms (±20.6) | 217 ms (±2.52) | 0.53 × (0.52–0.57) **Infinite** |
| Main thread: layout (all updates) (lower is better) | 4.21 ms (±0.26) | 2.80 ms (±0.12) | 0.67 × (0.64–0.77) **Infinite** |
| Main thread: style recalc (all updates) (lower is better) | 0.00 ms (±0.00) | 0.47 ms (±0.03) | +0.47 (+0.44 to +0.51) **TanStack** |
| Main thread: all tasks (all updates) (lower is better) | 4431 ms (±162) | 2414 ms (±19.8) | 0.54 × (0.53–0.56) **Infinite** |

## updates-high - 300,000 rows

Live updates, high frequency. The grid shows the rows in the order of the data. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 270 ms (±55.1) | 35.2 ms (±6.11) | 282 ms (±88.5) | 156 ms (±62.7) | 0.58 × (0.43–0.97) **Infinite** | 4.42 × (2.93–6.02) **AG Grid** | 0.55 × (0.36–1.07) ≈ |
| Update delay, p95 (lower is better) | 185 ms (±8.64) | 22.6 ms (±1.61) | 173 ms (±5.51) | 101 ms (±4.96) | 0.54 × (0.51–0.57) **Infinite** | 4.46 × (4.21–4.73) **AG Grid** | 0.58 × (0.54–0.61) **Infinite** |
| Frames committed per second (higher is better) | 9.45 fps (±0.20) | 43.3 fps (±3.10) | 6.77 fps (±0.21) | 16.6 fps (±1.03) | 1.76 × (1.68–1.87) **Infinite** | 0.38 × (0.37–0.41) **AG Grid** | 2.45 × (2.35–2.61) **Infinite** |
| Gap between frames, p95 (lower is better) | 209 ms (±6.74) | 26.5 ms (±2.85) | 266 ms (±15.1) | 135 ms (±5.13) | 0.65 × (0.62–0.67) **Infinite** | 5.11 × (4.81–5.43) **AG Grid** | 0.51 × (0.48–0.56) **Infinite** |
| Longest gap between frames (lower is better) | 304 ms (±26.0) | 71.4 ms (±5.35) | 277 ms (±15.2) | 147 ms (±5.34) | 0.48 × (0.46–0.54) **Infinite** | 2.06 × (1.80–2.16) **AG Grid** | 0.53 × (0.50–0.58) **Infinite** |
| Long tasks: total blocking time (lower is better) | 2624 ms (±59.3) | 0.00 ms (±1.18) | 2740 ms (±94.8) | 1867 ms (±37.0) | 0.71 × (0.69–0.73) **Infinite** | +1867 (+1848 to +1892) **AG Grid** | 0.68 × (0.66–0.72) **Infinite** |
| Main thread: layout (lower is better) | 7.40 ms (±0.12) | 73.7 ms (±2.10) | 20.7 ms (±0.59) | 18.1 ms (±0.61) | 2.45 × (2.38–2.59) **MUI X** | 0.25 × (0.24–0.26) **Infinite** | 0.87 × (0.85–0.93) **Infinite** |
| Main thread: style recalc (lower is better) | 4.45 ms (±0.09) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.36 ms (±0.02) | 0.08 × (0.08–0.09) **Infinite** | +0.36 (+0.35 to +0.38) **AG Grid** | +0.36 (+0.35 to +0.38) **TanStack** |
| Main thread: all tasks (lower is better) | 4250 ms (±55.1) | 3989 ms (±6.03) | 4276 ms (±91.0) | 4136 ms (±62.6) | 0.97 × (0.96–1.00) **Infinite** | 1.04 × (1.03–1.05) **AG Grid** | 0.97 × (0.95–1.00) ≈ |

## updates-high-sorted - 300,000 rows

Live updates, high frequency. The grid shows sorted by salary, highest first - the updates change the salaries, so rows move. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 1042 ms (±180) | 1212 ms (±376) | 1235 ms (±387) | 229 ms (±41.3) | 0.22 × (0.18–0.30) **Infinite** | 0.19 × (0.11–0.24) **Infinite** | 0.19 × (0.10–0.23) **Infinite** |
| Update delay, p95 (lower is better) | 563 ms (±13.7) | 960 ms (±30.3) | 963 ms (±26.1) | 147 ms (±6.83) | 0.26 × (0.25–0.28) **Infinite** | 0.15 × (0.15–0.17) **Infinite** | 0.15 × (0.15–0.17) **Infinite** |
| Frames committed per second (higher is better) | 2.59 fps (±0.04) | 0.99 fps (±0.04) | 0.99 fps (±0.03) | 10.8 fps (±0.31) | 4.18 × (4.03–4.31) **Infinite** | 10.9 × (10.4–11.2) **Infinite** | 11.0 × (10.4–11.4) **Infinite** |
| Gap between frames, p95 (lower is better) | 649 ms (±15.7) | 1696 ms (±82.4) | 1058 ms (±23.1) | 200 ms (±7.44) | 0.31 × (0.29–0.32) **Infinite** | 0.12 × (0.11–0.12) **Infinite** | 0.19 × (0.18–0.19) **Infinite** |
| Longest gap between frames (lower is better) | 701 ms (±30.1) | 1852 ms (±70.4) | 1061 ms (±23.5) | 218 ms (±15.7) | 0.31 × (0.28–0.33) **Infinite** | 0.12 × (0.11–0.12) **Infinite** | 0.21 × (0.19–0.22) **Infinite** |
| Long tasks: total blocking time (lower is better) | 4392 ms (±140) | 4704 ms (±350) | 4935 ms (±359) | 2708 ms (±46.3) | 0.62 × (0.61–0.64) **Infinite** | 0.58 × (0.51–0.60) **Infinite** | 0.55 × (0.48–0.56) **Infinite** |
| Main thread: layout (lower is better) | 6.73 ms (±0.60) | 5.96 ms (±0.62) | 9.04 ms (±0.65) | 39.0 ms (±1.34) | 5.80 × (5.37–6.43) **MUI X** | 6.55 × (5.59–7.09) **AG Grid** | 4.32 × (3.99–4.66) **TanStack** |
| Main thread: style recalc (lower is better) | 10.7 ms (±0.80) | 16.0 ms (±1.40) | 5.28 ms (±0.42) | 0.36 ms (±0.02) | 0.03 × (0.03–0.04) **Infinite** | 0.02 × (0.02–0.02) **Infinite** | 0.07 × (0.06–0.07) **Infinite** |
| Main thread: all tasks (lower is better) | 5027 ms (±180) | 5259 ms (±370) | 5216 ms (±387) | 4209 ms (±41.3) | 0.84 × (0.82–0.87) **Infinite** | 0.80 × (0.72–0.84) **Infinite** | 0.81 × (0.71–0.82) **Infinite** |

## updates-high-filtered - 300,000 rows

Live updates, high frequency. The grid shows filtered to a salary of at least 115,000 (about half of the rows) - the updates change the salaries, so rows go in and out of the filter. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 406 ms (±102) | 91.1 ms (±17.3) | 490 ms (±99.6) | 178 ms (±35.6) | 0.44 × (0.34–0.79) **Infinite** | 1.95 × (1.47–2.79) **AG Grid** | 0.36 × (0.26–0.53) **Infinite** |
| Update delay, p95 (lower is better) | 213 ms (±13.0) | 57.8 ms (±2.04) | 429 ms (±11.8) | 78.9 ms (±2.81) | 0.37 × (0.33–0.38) **Infinite** | 1.37 × (1.28–1.42) **AG Grid** | 0.18 × (0.17–0.19) **Infinite** |
| Frames committed per second (higher is better) | 6.75 fps (±0.16) | 16.8 fps (±0.52) | 2.91 fps (±0.07) | 18.5 fps (±2.10) | 2.74 × (2.54–3.13) **Infinite** | 1.10 × (1.02–1.26) **Infinite** | 6.37 × (5.89–7.20) **Infinite** |
| Gap between frames, p95 (lower is better) | 297 ms (±25.5) | 68.2 ms (±2.43) | 522 ms (±12.9) | 108 ms (±8.23) | 0.36 × (0.32–0.45) **Infinite** | 1.58 × (1.39–1.71) **AG Grid** | 0.21 × (0.18–0.22) **Infinite** |
| Longest gap between frames (lower is better) | 338 ms (±19.6) | 140 ms (±2.58) | 543 ms (±19.2) | 122 ms (±2.20) | 0.36 × (0.34–0.40) **Infinite** | 0.87 × (0.85–0.89) **Infinite** | 0.22 × (0.21–0.24) **Infinite** |
| Long tasks: total blocking time (lower is better) | 3204 ms (±80.6) | 443 ms (±103) | 3782 ms (±98.8) | 1399 ms (±70.6) | 0.44 × (0.41–0.47) **Infinite** | 3.16 × (2.47–3.55) **AG Grid** | 0.37 × (0.35–0.40) **Infinite** |
| Main thread: layout (lower is better) | 10.6 ms (±0.45) | 32.2 ms (±1.88) | 9.21 ms (±0.21) | 25.3 ms (±1.00) | 2.38 × (2.25–2.54) **MUI X** | 0.79 × (0.73–0.86) **Infinite** | 2.75 × (2.64–2.88) **TanStack** |
| Main thread: style recalc (lower is better) | 6.94 ms (±2.34) | 4.17 ms (±0.27) | 1.95 ms (±0.16) | 1.46 ms (±0.21) | 0.21 × (0.13–0.23) **Infinite** | 0.35 × (0.33–0.39) **Infinite** | 0.75 × (0.70–0.82) **Infinite** |
| Main thread: all tasks (lower is better) | 4387 ms (±58.7) | 4043 ms (±40.2) | 4471 ms (±99.6) | 4157 ms (±43.4) | 0.95 × (0.93–0.97) **Infinite** | 1.03 × (1.02–1.04) **AG Grid** | 0.93 × (0.91–0.97) **Infinite** |

## updates-high-grouped - 300,000 rows

Live updates, high frequency. The grid shows grouped by department (10 collapsed groups), with the sum of the salaries of each group - the updates change the salaries, so the sums change. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | TanStack median (sd) | Infinite median (sd) | Infinite vs TanStack |
|---|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 529 ms (±78.8) | 282 ms (±71.8) | 0.53 × (0.40–0.80) **Infinite** |
| Update delay, p95 (lower is better) | 463 ms (±14.3) | 240 ms (±6.23) | 0.52 × (0.51–0.54) **Infinite** |
| Frames committed per second (higher is better) | 2.44 fps (±0.08) | 7.86 fps (±0.34) | 3.23 × (3.03–3.38) **Infinite** |
| Gap between frames, p95 (lower is better) | 574 ms (±12.0) | 307 ms (±11.7) | 0.53 × (0.51–0.55) **Infinite** |
| Longest gap between frames (lower is better) | 645 ms (±25.9) | 330 ms (±7.22) | 0.51 × (0.51–0.53) **Infinite** |
| Long tasks: total blocking time (lower is better) | 3938 ms (±72.3) | 3265 ms (±61.0) | 0.83 × (0.82–0.86) **Infinite** |
| Main thread: layout (lower is better) | 3.99 ms (±0.26) | 4.79 ms (±0.12) | 1.20 × (1.13–1.25) **TanStack** |
| Main thread: style recalc (lower is better) | 0.00 ms (±0.00) | 0.36 ms (±0.02) | +0.36 (+0.35 to +0.38) **TanStack** |
| Main thread: all tasks (lower is better) | 4510 ms (±77.1) | 4263 ms (±71.6) | 0.95 × (0.93–0.98) **Infinite** |

# 1,000,000 rows

Scroll range - browsers cap element sizes (Chrome ~16.7M-33.5M px, depending on the version), so a grid has to map the scrollbar onto the rows when the content is taller than that. One that doesn't can't reach its last rows: its scrolling results are for the rows it can reach, and the same wheel gesture goes over fewer rows in it.

| | MUI X | AG Grid | TanStack | Infinite |
|---|---:|---:|---:|---:|
| Last row reachable with the scrollbar | **no** - stops at row 838,860 | yes (1,000,000) | **no** - stops at row 838,860 | yes (1,000,000) |
| Native scroll range | 33,553,620 px | 31,999,242 px | 33,553,632 px | 31,999,242 px |
| Content px per scrollbar px | 1.000 | 1.250 | 1.000 | 1.250 |

## mount - 1,000,000 rows

Mount the grid with all the rows (data already in memory). "Visible" = from setState to the end of the first frame committed with the whole viewport (first/last visible row and column) showing the right content. "Settled" = until the first frame committed after the grid's last DOM mutation. Memory is the JS heap retained by the grid after GC (heap after mount - heap before mount).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Time to first rows painted (lower is better) | 636 ms (±10.0) | 747 ms (±18.4) | 598 ms (±9.28) | 484 ms (±32.7) | 0.76 × (0.70–0.80) **Infinite** | 0.65 × (0.60–0.68) **Infinite** | 0.81 × (0.75–0.84) **Infinite** |
| Time until settled (lower is better) | 636 ms (±10.0) | 850 ms (±19.0) | 598 ms (±9.28) | 484 ms (±28.4) | 0.76 × (0.70–0.80) **Infinite** | 0.57 × (0.53–0.60) **Infinite** | 0.81 × (0.75–0.84) **Infinite** |
| Main thread: scripting (lower is better) | 623 ms (±10.0) | 723 ms (±18.6) | 589 ms (±9.44) | 457 ms (±29.3) | 0.73 × (0.68–0.78) **Infinite** | 0.63 × (0.59–0.67) **Infinite** | 0.78 × (0.72–0.81) **Infinite** |
| Main thread: layout (lower is better) | 4.79 ms (±0.57) | 7.48 ms (±0.43) | 3.99 ms (±0.28) | 4.70 ms (±0.33) | 0.98 × (0.89–1.14) ≈ | 0.63 × (0.57–0.68) **Infinite** | 1.18 × (1.08–1.31) **TanStack** |
| Main thread: style recalc (lower is better) | 4.14 ms (±0.04) | 10.1 ms (±0.11) | 1.34 ms (±0.18) | 8.54 ms (±0.14) | 2.06 × (2.02–2.10) **MUI X** | 0.85 × (0.82–0.87) **Infinite** | 6.36 × (4.99–6.51) **TanStack** |
| Main thread: all tasks (lower is better) | 639 ms (±10.5) | 759 ms (±20.0) | 605 ms (±6.08) | 487 ms (±26.1) | 0.76 × (0.71–0.80) **Infinite** | 0.64 × (0.59–0.67) **Infinite** | 0.81 × (0.75–0.84) **Infinite** |
| JS heap retained by grid (lower is better) | 150 MB (±0.00) | 213 MB (±0.01) | 287 MB (±0.00) | 90.7 MB (±0.36) | 0.60 × (0.60–0.60) **Infinite** | 0.42 × (0.42–0.42) **Infinite** | 0.32 × (0.32–0.32) **Infinite** |
| DOM elements in grid (lower is better) | 529 (±0.00) | 637 (±0.00) | 352 (±0.00) | 609 (±0.00) | 1.15 × (1.15–1.15) **MUI X** | 0.96 × (0.96–0.96) **Infinite** | 1.73 × (1.73–1.73) **TanStack** |

## sort-string - 1,000,000 rows

Click the "code" column header (string column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 3458 ms (±177) | 3138 ms (±222) | 4115 ms (±162) | 1363 ms (±47.5) | 0.39 × (0.36–0.42) **Infinite** | 0.43 × (0.40–0.48) **Infinite** | 0.33 × (0.31–0.35) **Infinite** |
| Ascending: click to settled (lower is better) | 3458 ms (±177) | 3138 ms (±222) | 4115 ms (±162) | 1381 ms (±48.7) | 0.40 × (0.36–0.42) **Infinite** | 0.44 × (0.40–0.48) **Infinite** | 0.34 × (0.31–0.35) **Infinite** |
| Descending: click to sorted rows painted (lower is better) | 3758 ms (±199) | 3168 ms (±193) | 3989 ms (±149) | 1432 ms (±50.7) | 0.38 × (0.37–0.42) **Infinite** | 0.45 × (0.44–0.51) **Infinite** | 0.36 × (0.34–0.38) **Infinite** |
| Descending: click to settled (lower is better) | 3758 ms (±199) | 3168 ms (±193) | 3989 ms (±149) | 1432 ms (±50.7) | 0.38 × (0.37–0.42) **Infinite** | 0.45 × (0.44–0.51) **Infinite** | 0.36 × (0.34–0.38) **Infinite** |
| Ascending: main thread scripting (lower is better) | 3448 ms (±177) | 3123 ms (±221) | 4107 ms (±162) | 1350 ms (±47.6) | 0.39 × (0.36–0.42) **Infinite** | 0.43 × (0.40–0.47) **Infinite** | 0.33 × (0.30–0.34) **Infinite** |
| Descending: main thread scripting (lower is better) | 3750 ms (±199) | 3155 ms (±193) | 3979 ms (±149) | 1417 ms (±49.9) | 0.38 × (0.37–0.42) **Infinite** | 0.45 × (0.43–0.50) **Infinite** | 0.36 × (0.33–0.37) **Infinite** |

## sort-number - 1,000,000 rows

Click the "salary" column header (number column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 1853 ms (±120) | 2982 ms (±229) | 3340 ms (±182) | 514 ms (±13.8) | 0.28 × (0.25–0.30) **Infinite** | 0.17 × (0.17–0.19) **Infinite** | 0.15 × (0.15–0.16) **Infinite** |
| Ascending: click to settled (lower is better) | 1853 ms (±120) | 2982 ms (±229) | 3340 ms (±182) | 527 ms (±12.6) | 0.28 × (0.26–0.30) **Infinite** | 0.18 × (0.17–0.20) **Infinite** | 0.16 × (0.15–0.16) **Infinite** |
| Descending: click to sorted rows painted (lower is better) | 2436 ms (±216) | 3060 ms (±205) | 3392 ms (±242) | 516 ms (±17.5) | 0.21 × (0.20–0.22) **Infinite** | 0.17 × (0.16–0.19) **Infinite** | 0.15 × (0.15–0.17) **Infinite** |
| Descending: click to settled (lower is better) | 2436 ms (±216) | 3060 ms (±205) | 3392 ms (±242) | 516 ms (±17.5) | 0.21 × (0.20–0.22) **Infinite** | 0.17 × (0.16–0.19) **Infinite** | 0.15 × (0.15–0.17) **Infinite** |
| Ascending: main thread scripting (lower is better) | 1843 ms (±120) | 2966 ms (±230) | 3332 ms (±182) | 502 ms (±13.5) | 0.27 × (0.25–0.29) **Infinite** | 0.17 × (0.16–0.19) **Infinite** | 0.15 × (0.15–0.15) **Infinite** |
| Descending: main thread scripting (lower is better) | 2428 ms (±216) | 3047 ms (±204) | 3385 ms (±242) | 500 ms (±18.0) | 0.21 × (0.19–0.22) **Infinite** | 0.16 × (0.16–0.19) **Infinite** | 0.15 × (0.14–0.16) **Infinite** |

## scroll-jump - 1,000,000 rows

Programmatic jumps to 10 far-away scroll positions (like dragging the scrollbar thumb). Measured from setting scrollTop to the end of the first frame committed with the first and last visible rows showing the right content, at the right position.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Jump to rows painted (median of jumps) (lower is better) | 22.0 ms (±0.52) | 30.0 ms (±0.67) | 10.7 ms (±0.22) | 30.2 ms (±1.10) | 1.37 × (1.34–1.44) **MUI X** | 1.01 × (0.99–1.05) ≈ | 2.83 × (2.78–2.94) **TanStack** |
| Jump to rows painted (worst jump) (lower is better) | 43.1 ms (±1.38) | 66.0 ms (±5.72) | 30.4 ms (±2.08) | 44.1 ms (±1.46) | 1.02 × (1.00–1.07) **MUI X** | 0.67 × (0.65–0.72) **Infinite** | 1.45 × (1.34–1.54) **TanStack** |
| Jump to settled (median of jumps) (lower is better) | 22.0 ms (±0.52) | 30.0 ms (±0.67) | 10.7 ms (±0.22) | 30.2 ms (±1.10) | 1.37 × (1.34–1.44) **MUI X** | 1.01 × (0.99–1.05) ≈ | 2.83 × (2.78–2.94) **TanStack** |
| Main thread scripting (all jumps) (lower is better) | 147 ms (±3.33) | 206 ms (±7.38) | 72.7 ms (±1.37) | 187 ms (±4.77) | 1.28 × (1.23–1.30) **MUI X** | 0.91 × (0.87–0.92) **Infinite** | 2.57 × (2.47–2.65) **TanStack** |

## scroll-vertical - 1,000,000 rows

Wheel-scroll down 24000px at 8000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 50.3 % (±0.05) | 50.3 % (±0.05) | 100 % (±0.00) | 61.6 % (±0.50) | 1.22 × (1.21–1.23) **Infinite** | 1.22 × (1.21–1.23) **Infinite** | 0.62 × (0.61–0.62) **TanStack** |
| Frames presented without main-thread update (lower is better) | 49.4 % (±0.05) | 49.4 % (±0.05) | 0.00 % (±0.00) | 38.3 % (±0.55) | 0.77 × (0.77–0.79) **Infinite** | 0.77 × (0.77–0.79) **Infinite** | +38.3 (+37.9 to +39.0) **TanStack** |
| Frames dropped (lower is better) | 0.28 % (±0.10) | 0.28 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.21) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.12) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 57.4 fps (±0.35) | 0.96 × (0.95–0.96) **MUI X** | 0.96 × (0.95–0.96) **AG Grid** | 0.96 × (0.95–0.96) **TanStack** |
| p95 rAF frame interval (lower is better) | 16.7 ms (±0.05) | 16.7 ms (±0.05) | 16.7 ms (±0.04) | 16.8 ms (±0.04) | 1.01 × (1.00–1.01) **MUI X** | 1.01 × (1.00–1.01) ≈ | 1.01 × (1.01–1.01) **TanStack** |
| Worst rAF frame interval (lower is better) | 16.8 ms (±6.27) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 100 ms (±18.9) | 5.95 × (5.95–5.95) **MUI X** | 5.95 × (5.95–5.95) **AG Grid** | 5.95 × (5.95–5.95) **TanStack** |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.20) | 0.00 % (±0.00) | 0.00 % (±0.00) | 1.69 % (±0.41) | +1.69 (+1.69 to +1.70) **MUI X** | +1.69 (+1.69 to +1.70) **AG Grid** | +1.69 (+1.69 to +1.70) **TanStack** |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Main thread: scripting (lower is better) | 445 ms (±9.70) | 596 ms (±14.3) | 261 ms (±5.28) | 609 ms (±7.45) | 1.37 × (1.35–1.42) **MUI X** | 1.02 × (1.01–1.05) **AG Grid** | 2.33 × (2.27–2.37) **TanStack** |
| Main thread: layout (lower is better) | 49.8 ms (±0.71) | 85.1 ms (±3.02) | 64.9 ms (±2.52) | 79.0 ms (±1.76) | 1.59 × (1.53–1.61) **MUI X** | 0.93 × (0.90–0.95) **Infinite** | 1.22 × (1.17–1.24) **TanStack** |
| Main thread: style recalc (lower is better) | 75.8 ms (±0.95) | 367 ms (±5.76) | 31.5 ms (±0.48) | 202 ms (±4.87) | 2.66 × (2.61–2.73) **MUI X** | 0.55 × (0.54–0.56) **Infinite** | 6.41 × (6.28–6.57) **TanStack** |
| Main thread: all tasks (lower is better) | 1160 ms (±13.3) | 1558 ms (±25.4) | 782 ms (±6.94) | 1355 ms (±24.1) | 1.17 × (1.15–1.19) **MUI X** | 0.87 × (0.85–0.88) **Infinite** | 1.73 × (1.72–1.77) **TanStack** |

## scroll-horizontal - 1,000,000 rows

Wheel-scroll right/left over all columns, 4 sweeps at 4000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 76.7 % (±6.77) | 100 % (±0.00) | 80.3 % (±7.45) | 95.8 % (±4.85) | 1.25 × (1.09–1.43) **Infinite** | 0.96 × (0.88–0.96) **AG Grid** | 1.19 × (1.09–1.19) **Infinite** |
| Frames presented without main-thread update (lower is better) | 22.0 % (±6.46) | 0.00 % (±0.00) | 19.0 % (±7.19) | 4.17 % (±4.85) | 0.19 × (0.13–0.65) **Infinite** | +4.17 (+4.14 to +12.3) **AG Grid** | -14.8 (-14.9 to -6.67) **Infinite** |
| Frames dropped (lower is better) | 1.17 % (±0.40) | 0.00 % (±0.00) | 0.70 % (±0.27) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ | -0.70 (-0.70 to -0.70) **Infinite** |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ |
| p95 rAF frame interval (lower is better) | 16.8 ms (±0.04) | 16.7 ms (±0.05) | 16.7 ms (±0.05) | 16.7 ms (±0.05) | 0.99 × (0.99–1.00) ≈ | 1.00 × (0.99–1.01) ≈ | 1.00 × (0.99–1.01) ≈ |
| Worst rAF frame interval (lower is better) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Main thread: scripting (lower is better) | 307 ms (±11.8) | 209 ms (±3.98) | 138 ms (±3.79) | 137 ms (±4.30) | 0.45 × (0.43–0.48) **Infinite** | 0.65 × (0.63–0.67) **Infinite** | 1.00 × (0.97–1.04) ≈ |
| Main thread: layout (lower is better) | 40.1 ms (±1.02) | 55.2 ms (±1.07) | 40.8 ms (±1.43) | 11.0 ms (±0.38) | 0.27 × (0.26–0.29) **Infinite** | 0.20 × (0.19–0.21) **Infinite** | 0.27 × (0.26–0.28) **Infinite** |
| Main thread: style recalc (lower is better) | 22.2 ms (±0.56) | 38.1 ms (±0.48) | 12.5 ms (±0.42) | 41.9 ms (±0.87) | 1.89 × (1.79–1.91) **MUI X** | 1.10 × (1.07–1.12) **AG Grid** | 3.36 × (3.24–3.48) **TanStack** |
| Main thread: all tasks (lower is better) | 673 ms (±18.9) | 499 ms (±8.81) | 369 ms (±10.1) | 443 ms (±8.96) | 0.66 × (0.65–0.70) **Infinite** | 0.89 × (0.86–0.90) **Infinite** | 1.20 × (1.16–1.24) **TanStack** |

## correctness-vertical - 1,000,000 rows

Same kind of vertical wheel gesture, faster (20000px/s). After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Blank samples (lower is better) | 0.00 % (±0.00) | 2.29 % (±1.27) | 2.05 % (±0.92) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 62.7 % (±4.29) | +62.7 (+59.2 to +64.8) **MUI X** | +62.7 (+59.2 to +64.8) **AG Grid** | +62.7 (+59.2 to +64.8) **TanStack** |
| Frames with any blank/wrong sample (lower is better) | 0.00 % (±0.00) | 11.4 % (±6.37) | 10.3 % (±4.60) | 86.0 % (±0.82) | +86.0 (+84.8 to +86.4) **MUI X** | 7.52 × (5.05–12.2) **AG Grid** | 8.39 × (5.58–9.71) **TanStack** |
| Worst frame: correct samples (higher is better) | 100 % (±0.00) | 80.0 % (±0.00) | 80.0 % (±0.00) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **MUI X** | 0.00 × (0.00–0.00) **AG Grid** | 0.00 × (0.00–0.00) **TanStack** |

## correctness-horizontal - 1,000,000 rows

Same kind of horizontal wheel gesture. After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Blank samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Frames with any blank/wrong sample (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Worst frame: correct samples (higher is better) | 100 % (±0.00) | 100 % (±0.00) | 100 % (±0.00) | 100 % (±0.00) | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ |

## visual-blank-vertical - 1,000,000 rows

Fast vertical wheel gesture (20000px/s) while recording what the compositor actually displays (CDP screencast). Each frame is checked for blank areas: vertical runs of the body with no text where rows should be. Unlike the correctness probe, this also catches the compositor scrolling ahead of the main thread. Screencast capture skips frames under load and adds overhead - compare the grids, not absolute numbers.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Captured frames with blank rows (lower is better) | 0.00 % (±0.00) | 25.0 % (±4.70) | 4.55 % (±1.75) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Blank body area (avg over frames) (lower is better) | 0.00 % (±0.00) | 9.94 % (±1.52) | 1.10 % (±0.42) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Worst frame: blank rows (lower is better) | 0.00 rows (±0.00) | 18.0 rows (±0.38) | 7.00 rows (±3.11) | 0.00 rows (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Captured frames (higher is better) | 67.0 (±1.60) | 54.0 (±2.75) | 68.0 (±2.65) | 72.0 (±1.25) | 1.07 × (1.06–1.11) **Infinite** | 1.33 × (1.29–1.43) **Infinite** | 1.06 × (1.03–1.11) **Infinite** |

## updates-low - 1,000,000 rows

Live updates, low frequency. The grid shows the rows in the order of the data. 10 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 553 ms (±15.6) | 137 ms (±1.91) | 476 ms (±6.03) | 368 ms (±27.9) | 0.67 × (0.62–0.74) **Infinite** | 2.69 × (2.54–2.99) **AG Grid** | 0.77 × (0.73–0.86) **Infinite** |
| Update to rows painted (worst update) (lower is better) | 803 ms (±24.5) | 151 ms (±2.69) | 662 ms (±121) | 434 ms (±65.1) | 0.54 × (0.52–0.70) **Infinite** | 2.86 × (2.75–3.56) **AG Grid** | 0.65 × (0.61–0.82) **Infinite** |
| Update to settled (median of updates) (lower is better) | 553 ms (±15.6) | 137 ms (±1.91) | 476 ms (±6.03) | 368 ms (±27.9) | 0.67 × (0.62–0.74) **Infinite** | 2.69 × (2.54–2.99) **AG Grid** | 0.77 × (0.73–0.86) **Infinite** |
| Main thread: layout (all updates) (lower is better) | 5.89 ms (±0.31) | 5.94 ms (±0.30) | 7.95 ms (±6.70) | 5.27 ms (±0.15) | 0.89 × (0.88–0.98) **Infinite** | 0.89 × (0.84–0.92) **Infinite** | 0.66 × (0.29–0.71) **Infinite** |
| Main thread: style recalc (all updates) (lower is better) | 3.34 ms (±0.11) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.67 ms (±0.03) | 0.20 × (0.19–0.22) **Infinite** | +0.67 (+0.66 to +0.72) **AG Grid** | +0.67 (+0.66 to +0.72) **TanStack** |
| Main thread: all tasks (all updates) (lower is better) | 5870 ms (±166) | 1511 ms (±16.9) | 5366 ms (±52.4) | 3902 ms (±255) | 0.66 × (0.63–0.73) **Infinite** | 2.58 × (2.45–2.82) **AG Grid** | 0.73 × (0.68–0.79) **Infinite** |

## updates-low-sorted - 1,000,000 rows

Live updates, low frequency. The grid shows sorted by salary, highest first - the updates change the salaries, so rows move. 10 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 2118 ms (±180) | 4169 ms (±308) | 4162 ms (±292) | 505 ms (±25.9) | 0.24 × (0.21–0.26) **Infinite** | 0.12 × (0.11–0.13) **Infinite** | 0.12 × (0.11–0.13) **Infinite** |
| Update to rows painted (worst update) (lower is better) | 2520 ms (±197) | 4363 ms (±283) | 5576 ms (±439) | 734 ms (±50.4) | 0.29 × (0.26–0.33) **Infinite** | 0.17 × (0.15–0.18) **Infinite** | 0.13 × (0.12–0.15) **Infinite** |
| Update to settled (median of updates) (lower is better) | 2118 ms (±180) | 4169 ms (±308) | 4162 ms (±292) | 505 ms (±25.9) | 0.24 × (0.21–0.26) **Infinite** | 0.12 × (0.11–0.13) **Infinite** | 0.12 × (0.11–0.13) **Infinite** |
| Main thread: layout (all updates) (lower is better) | 10.0 ms (±0.31) | 8.62 ms (±2.52) | 14.5 ms (±1.19) | 17.5 ms (±0.60) | 1.74 × (1.67–1.88) **MUI X** | 2.03 × (1.97–2.26) **AG Grid** | 1.21 × (1.11–1.33) **TanStack** |
| Main thread: style recalc (all updates) (lower is better) | 23.4 ms (±2.15) | 21.3 ms (±0.63) | 9.31 ms (±0.40) | 0.77 ms (±0.04) | 0.03 × (0.03–0.04) **Infinite** | 0.04 × (0.03–0.04) **Infinite** | 0.08 × (0.08–0.09) **Infinite** |
| Main thread: all tasks (all updates) (lower is better) | 21537 ms (±1894) | 42306 ms (±3046) | 44901 ms (±3272) | 5369 ms (±253) | 0.25 × (0.22–0.27) **Infinite** | 0.13 × (0.11–0.14) **Infinite** | 0.12 × (0.11–0.13) **Infinite** |

## updates-low-filtered - 1,000,000 rows

Live updates, low frequency. The grid shows filtered to a salary of at least 115,000 (about half of the rows) - the updates change the salaries, so rows go in and out of the filter. 10 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 685 ms (±18.9) | 258 ms (±4.88) | 1403 ms (±36.1) | 276 ms (±11.0) | 0.40 × (0.39–0.42) **Infinite** | 1.07 × (1.03–1.13) **AG Grid** | 0.20 × (0.19–0.21) **Infinite** |
| Update to rows painted (worst update) (lower is better) | 933 ms (±151) | 296 ms (±4.97) | 1869 ms (±47.1) | 353 ms (±22.4) | 0.38 × (0.30–0.43) **Infinite** | 1.19 × (1.14–1.30) **AG Grid** | 0.19 × (0.18–0.20) **Infinite** |
| Update to settled (median of updates) (lower is better) | 685 ms (±18.9) | 258 ms (±4.88) | 1403 ms (±36.1) | 278 ms (±10.6) | 0.41 × (0.39–0.43) **Infinite** | 1.08 × (1.04–1.14) **AG Grid** | 0.20 × (0.19–0.21) **Infinite** |
| Main thread: layout (all updates) (lower is better) | 7.20 ms (±0.27) | 7.99 ms (±0.34) | 7.93 ms (±0.34) | 7.17 ms (±0.24) | 1.00 × (0.95–1.06) ≈ | 0.90 × (0.85–0.97) **Infinite** | 0.90 × (0.85–0.97) **Infinite** |
| Main thread: style recalc (all updates) (lower is better) | 4.66 ms (±0.14) | 2.13 ms (±0.14) | 1.53 ms (±0.05) | 0.92 ms (±0.05) | 0.20 × (0.19–0.21) **Infinite** | 0.43 × (0.41–0.49) **Infinite** | 0.60 × (0.58–0.66) **Infinite** |
| Main thread: all tasks (all updates) (lower is better) | 7399 ms (±174) | 2698 ms (±47.5) | 14712 ms (±355) | 2996 ms (±127) | 0.40 × (0.39–0.43) **Infinite** | 1.11 × (1.07–1.19) **AG Grid** | 0.20 × (0.19–0.22) **Infinite** |

## updates-low-grouped - 1,000,000 rows

Live updates, low frequency. The grid shows grouped by department (10 collapsed groups), with the sum of the salaries of each group - the updates change the salaries, so the sums change. 10 updates of 1,000 random rows each, one at a time: each update is sent 500 ms after the previous one is painted. An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. Measured from sending the update to the end of the first frame committed with the viewport showing it (the right rows, with the new values, in the right order).

| Metric | TanStack median (sd) | Infinite median (sd) | Infinite vs TanStack |
|---|---:|---:|---:|
| Update to rows painted (median of updates) (lower is better) | 1812 ms (±64.2) | 790 ms (±22.9) | 0.44 × (0.43–0.47) **Infinite** |
| Update to rows painted (worst update) (lower is better) | 2659 ms (±70.7) | 1113 ms (±66.9) | 0.42 × (0.40–0.46) **Infinite** |
| Update to settled (median of updates) (lower is better) | 1812 ms (±64.2) | 790 ms (±22.9) | 0.44 × (0.43–0.47) **Infinite** |
| Main thread: layout (all updates) (lower is better) | 4.08 ms (±0.15) | 2.93 ms (±0.20) | 0.72 × (0.65–0.78) **Infinite** |
| Main thread: style recalc (all updates) (lower is better) | 0.00 ms (±0.00) | 0.93 ms (±0.06) | +0.93 (+0.91 to +0.98) **TanStack** |
| Main thread: all tasks (all updates) (lower is better) | 19914 ms (±626) | 8418 ms (±307) | 0.42 × (0.41–0.44) **Infinite** |

## updates-high - 1,000,000 rows

Live updates, high frequency. The grid shows the rows in the order of the data. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 1038 ms (±130) | 182 ms (±26.6) | 772 ms (±81.4) | 516 ms (±117) | 0.50 × (0.31–0.58) **Infinite** | 2.84 × (1.89–3.59) **AG Grid** | 0.67 × (0.45–0.84) **Infinite** |
| Update delay, p95 (lower is better) | 622 ms (±24.9) | 123 ms (±1.23) | 630 ms (±14.3) | 366 ms (±16.1) | 0.59 × (0.52–0.60) **Infinite** | 2.97 × (2.75–3.02) **AG Grid** | 0.58 × (0.54–0.60) **Infinite** |
| Frames committed per second (higher is better) | 2.59 fps (±0.07) | 7.67 fps (±0.07) | 1.89 fps (±0.03) | 4.62 fps (±0.21) | 1.78 × (1.68–1.92) **Infinite** | 0.60 × (0.57–0.63) **AG Grid** | 2.44 × (2.29–2.56) **Infinite** |
| Gap between frames, p95 (lower is better) | 726 ms (±18.0) | 160 ms (±5.48) | 752 ms (±15.4) | 424 ms (±22.4) | 0.58 × (0.55–0.61) **Infinite** | 2.65 × (2.46–2.77) **AG Grid** | 0.56 × (0.55–0.60) **Infinite** |
| Longest gap between frames (lower is better) | 769 ms (±14.2) | 256 ms (±1.57) | 805 ms (±22.9) | 489 ms (±25.5) | 0.64 × (0.61–0.68) **Infinite** | 1.91 × (1.84–2.03) **AG Grid** | 0.61 × (0.58–0.65) **Infinite** |
| Long tasks: total blocking time (lower is better) | 4396 ms (±129) | 2398 ms (±24.1) | 4275 ms (±87.0) | 3826 ms (±99.6) | 0.87 × (0.81–0.88) **Infinite** | 1.60 × (1.53–1.62) **AG Grid** | 0.89 × (0.85–0.92) **Infinite** |
| Main thread: layout (lower is better) | 2.67 ms (±0.16) | 16.7 ms (±0.31) | 6.41 ms (±0.21) | 5.53 ms (±0.24) | 2.07 × (1.94–2.20) **MUI X** | 0.33 × (0.31–0.34) **Infinite** | 0.86 × (0.81–0.89) **Infinite** |
| Main thread: style recalc (lower is better) | 1.89 ms (±0.07) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.37 ms (±0.02) | 0.20 × (0.19–0.22) **Infinite** | +0.37 (+0.36 to +0.39) **AG Grid** | +0.37 (+0.36 to +0.39) **TanStack** |
| Main thread: all tasks (lower is better) | 5019 ms (±130) | 4134 ms (±28.4) | 4753 ms (±79.2) | 4497 ms (±117) | 0.90 × (0.84–0.92) **Infinite** | 1.09 × (1.05–1.11) **AG Grid** | 0.95 × (0.91–0.98) **Infinite** |

## updates-high-sorted - 1,000,000 rows

Live updates, high frequency. The grid shows sorted by salary, highest first - the updates change the salaries, so rows move. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 2741 ms (±178) | 8370 ms (±2024) | 5029 ms (±174) | 610 ms (±260) | 0.22 × (0.19–0.38) **Infinite** | 0.07 × (0.06–0.21) **Infinite** | 0.12 × (0.11–0.20) **Infinite** |
| Update delay, p95 (lower is better) | 2237 ms (±68.6) | 3777 ms (±165) | 4507 ms (±229) | 579 ms (±19.8) | 0.26 × (0.25–0.27) **Infinite** | 0.15 × (0.14–0.16) **Infinite** | 0.13 × (0.12–0.14) **Infinite** |
| Frames committed per second (higher is better) | 0.60 fps (±0.02) | 0.24 fps (±0.00) | 0.22 fps (±0.00) | 2.83 fps (±0.16) | 4.76 × (4.39–4.95) **Infinite** | 12.0 × (11.1–12.3) **Infinite** | 12.8 × (11.8–13.1) **Infinite** |
| Gap between frames, p95 (lower is better) | 2410 ms (±62.6) | 7947 ms (±204) | 4708 ms (±136) | 697 ms (±23.3) | 0.29 × (0.27–0.30) **Infinite** | 0.09 × (0.08–0.09) **Infinite** | 0.15 × (0.14–0.15) **Infinite** |
| Longest gap between frames (lower is better) | 2446 ms (±66.8) | 8360 ms (±221) | 4734 ms (±142) | 714 ms (±22.4) | 0.29 × (0.28–0.31) **Infinite** | 0.09 × (0.08–0.09) **Infinite** | 0.15 × (0.15–0.16) **Infinite** |
| Long tasks: total blocking time (lower is better) | 6461 ms (±178) | 11849 ms (±1880) | 8894 ms (±174) | 4112 ms (±233) | 0.64 × (0.62–0.70) **Infinite** | 0.35 × (0.33–0.53) **Infinite** | 0.46 × (0.46–0.50) **Infinite** |
| Main thread: layout (lower is better) | 2.74 ms (±0.05) | 2.75 ms (±0.59) | 3.44 ms (±0.31) | 14.0 ms (±0.65) | 5.11 × (4.78–5.38) **MUI X** | 5.10 × (4.79–8.61) **AG Grid** | 4.07 × (3.60–4.33) **TanStack** |
| Main thread: style recalc (lower is better) | 4.94 ms (±0.30) | 6.81 ms (±1.14) | 2.52 ms (±0.26) | 0.39 ms (±0.08) | 0.08 × (0.07–0.09) **Infinite** | 0.06 × (0.04–0.08) **Infinite** | 0.15 × (0.13–0.18) **Infinite** |
| Main thread: all tasks (lower is better) | 6722 ms (±178) | 12341 ms (±1905) | 9011 ms (±174) | 4592 ms (±259) | 0.68 × (0.66–0.75) **Infinite** | 0.37 × (0.36–0.56) **Infinite** | 0.51 × (0.50–0.56) **Infinite** |

## updates-high-filtered - 1,000,000 rows

Live updates, high frequency. The grid shows filtered to a salary of at least 115,000 (about half of the rows) - the updates change the salaries, so rows go in and out of the filter. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 1109 ms (±201) | 379 ms (±28.9) | 1958 ms (±95.8) | 352 ms (±89.1) | 0.32 × (0.29–0.47) **Infinite** | 0.93 × (0.78–1.36) ≈ | 0.18 × (0.17–0.27) **Infinite** |
| Update delay, p95 (lower is better) | 721 ms (±10.2) | 259 ms (±3.67) | 1702 ms (±29.3) | 299 ms (±12.9) | 0.42 × (0.39–0.44) **Infinite** | 1.16 × (1.09–1.22) **AG Grid** | 0.18 × (0.17–0.19) **Infinite** |
| Frames committed per second (higher is better) | 1.96 fps (±0.07) | 3.67 fps (±0.02) | 0.67 fps (±0.01) | 5.58 fps (±0.21) | 2.84 × (2.67–2.94) **Infinite** | 1.52 × (1.45–1.59) **Infinite** | 8.29 × (7.76–8.57) **Infinite** |
| Gap between frames, p95 (lower is better) | 794 ms (±88.8) | 373 ms (±4.87) | 1857 ms (±26.4) | 363 ms (±10.6) | 0.46 × (0.43–0.47) **Infinite** | 0.97 × (0.93–1.00) **Infinite** | 0.20 × (0.19–0.20) **Infinite** |
| Longest gap between frames (lower is better) | 799 ms (±156) | 645 ms (±8.58) | 1906 ms (±27.9) | 423 ms (±19.5) | 0.53 × (0.51–0.56) **Infinite** | 0.66 × (0.65–0.69) **Infinite** | 0.22 × (0.22–0.24) **Infinite** |
| Long tasks: total blocking time (lower is better) | 4592 ms (±200) | 3407 ms (±27.9) | 5721 ms (±95.8) | 3583 ms (±53.3) | 0.78 × (0.77–0.80) **Infinite** | 1.05 × (1.03–1.07) **AG Grid** | 0.63 × (0.62–0.65) **Infinite** |
| Main thread: layout (lower is better) | 5.28 ms (±2.07) | 9.40 ms (±0.13) | 3.02 ms (±0.13) | 8.89 ms (±0.77) | 1.68 × (1.58–1.94) **MUI X** | 0.95 × (0.90–1.09) ≈ | 2.95 × (2.79–3.42) **TanStack** |
| Main thread: style recalc (lower is better) | 3.79 ms (±0.11) | 3.11 ms (±0.14) | 0.88 ms (±0.03) | 0.99 ms (±0.08) | 0.26 × (0.24–0.29) **Infinite** | 0.32 × (0.30–0.37) **Infinite** | 1.13 × (1.06–1.26) **TanStack** |
| Main thread: all tasks (lower is better) | 5352 ms (±110) | 4340 ms (±28.7) | 5939 ms (±95.8) | 4334 ms (±89.8) | 0.81 × (0.80–0.84) **Infinite** | 1.00 × (0.98–1.04) ≈ | 0.73 × (0.72–0.77) **Infinite** |

## updates-high-grouped - 1,000,000 rows

Live updates, high frequency. The grid shows grouped by department (10 collapsed groups), with the sum of the salaries of each group - the updates change the salaries, so the sums change. A feed of 50 updates a second, of 100 random rows each, for 4 s (200 updates). An update changes salary, bonus, hours, score (by up to ±1%) in new copies of the rows: random rows, plus all the rows in the viewport, so that every update changes what is on screen. Every grid gets the same updates, through the API it documents for changing rows. The page hands the grid the updates once per animation frame: all the ones that arrived since the previous frame, as one update - so a grid that keeps the main thread busy gets them later, and more at once. "Lag at the end" = from the arrival of the last update to the end of the first frame committed with the viewport showing it. "Update delay" = from the arrival of an update to the frame that hands it to the grid. Frames, gaps and blocking time come from the trace, from the first update until the last one is painted: the frames the main thread committed, and the part over 50 ms of every task.

| Metric | TanStack median (sd) | Infinite median (sd) | Infinite vs TanStack |
|---|---:|---:|---:|
| Lag at the end: last update to painted (lower is better) | 2073 ms (±72.6) | 2038 ms (±191) | 0.98 × (0.87–1.04) ≈ |
| Update delay, p95 (lower is better) | 1967 ms (±62.0) | 903 ms (±30.6) | 0.46 × (0.43–0.47) **Infinite** |
| Frames committed per second (higher is better) | 0.50 fps (±0.01) | 1.56 fps (±0.12) | 3.14 × (2.96–3.32) **Infinite** |
| Gap between frames, p95 (lower is better) | 2163 ms (±64.3) | 1191 ms (±40.6) | 0.55 × (0.53–0.57) **Infinite** |
| Longest gap between frames (lower is better) | 2188 ms (±72.7) | 1269 ms (±55.4) | 0.58 × (0.56–0.60) **Infinite** |
| Long tasks: total blocking time (lower is better) | 5894 ms (±72.6) | 5681 ms (±198) | 0.96 × (0.92–0.98) **Infinite** |
| Main thread: layout (lower is better) | 1.32 ms (±0.17) | 1.83 ms (±0.11) | 1.39 × (1.29–1.56) **TanStack** |
| Main thread: style recalc (lower is better) | 0.00 ms (±0.00) | 0.33 ms (±0.04) | +0.33 (+0.29 to +0.38) **TanStack** |
| Main thread: all tasks (lower is better) | 6054 ms (±72.7) | 6029 ms (±189) | 1.00 × (0.95–1.01) ≈ |
