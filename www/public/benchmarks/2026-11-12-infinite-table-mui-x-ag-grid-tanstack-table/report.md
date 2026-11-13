# MUI X Data Grid vs AG Grid vs TanStack Table vs Infinite Table — benchmark report

- Run: `ci` · 2026-11-12T13:40:57.894Z
- MUI X Data Grid 9.17.0 · AG Grid 36.3.0 · TanStack Table 9.3.1 · Infinite Table 10.1.5
- 300,000 rows (data checksum `300000:72377c6e`) · 1,000,000 rows (data checksum `1000000:19e5eebe`) × 20 columns, identical data for every grid
- Chrome 136.0.7103.25 · headless · CPU throttling 1× · viewport 1400×1000
- 7 measured runs per grid per scenario (+1 warmup, discarded), interleaved, fresh browser context per run
- Linux 7.0.0-1017-azure x64 · AMD EPYC 9V74 80-Core Processor × 4
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
| Time to first rows painted (lower is better) | 275 ms (±3.03) | 323 ms (±1.90) | 232 ms (±3.83) | 246 ms (±4.64) | 0.89 × (0.88–0.91) **Infinite** | 0.76 × (0.75–0.77) **Infinite** | 1.06 × (1.04–1.07) **TanStack** |
| Time until settled (lower is better) | 275 ms (±3.03) | 425 ms (±1.95) | 232 ms (±3.83) | 246 ms (±4.64) | 0.89 × (0.88–0.91) **Infinite** | 0.58 × (0.57–0.58) **Infinite** | 1.06 × (1.04–1.07) **TanStack** |
| Main thread: scripting (lower is better) | 256 ms (±3.89) | 297 ms (±1.91) | 220 ms (±2.99) | 226 ms (±4.74) | 0.88 × (0.87–0.91) **Infinite** | 0.76 × (0.75–0.77) **Infinite** | 1.03 × (1.01–1.05) **TanStack** |
| Main thread: layout (lower is better) | 6.87 ms (±1.08) | 7.11 ms (±0.10) | 6.59 ms (±1.35) | 3.58 ms (±0.06) | 0.52 × (0.46–0.57) **Infinite** | 0.50 × (0.50–0.52) **Infinite** | 0.54 × (0.45–0.66) **Infinite** |
| Main thread: style recalc (lower is better) | 7.39 ms (±0.25) | 11.9 ms (±0.30) | 2.58 ms (±0.82) | 6.84 ms (±0.22) | 0.93 × (0.90–0.99) **Infinite** | 0.57 × (0.55–0.61) **Infinite** | 2.65 × (2.45–2.81) **TanStack** |
| Main thread: all tasks (lower is better) | 308 ms (±3.92) | 332 ms (±2.19) | 234 ms (±3.96) | 250 ms (±4.67) | 0.81 × (0.80–0.83) **Infinite** | 0.75 × (0.75–0.76) **Infinite** | 1.07 × (1.04–1.08) **TanStack** |
| JS heap retained by grid (lower is better) | 53.9 MB (±0.00) | 67.4 MB (±0.00) | 86.6 MB (±0.00) | 36.6 MB (±0.00) | 0.68 × (0.68–0.68) **Infinite** | 0.54 × (0.54–0.54) **Infinite** | 0.42 × (0.42–0.42) **Infinite** |
| DOM elements in grid (lower is better) | 529 (±0.00) | 637 (±0.00) | 352 (±0.00) | 609 (±0.00) | 1.15 × (1.15–1.15) **MUI X** | 0.96 × (0.96–0.96) **Infinite** | 1.73 × (1.73–1.73) **TanStack** |

## sort-string - 300,000 rows

Click the "code" column header (string column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 1275 ms (±39.4) | 969 ms (±38.8) | 1354 ms (±31.4) | 487 ms (±8.66) | 0.38 × (0.37–0.39) **Infinite** | 0.50 × (0.48–0.51) **Infinite** | 0.36 × (0.35–0.36) **Infinite** |
| Ascending: click to settled (lower is better) | 1275 ms (±39.4) | 969 ms (±38.8) | 1354 ms (±31.4) | 499 ms (±9.47) | 0.39 × (0.39–0.40) **Infinite** | 0.51 × (0.49–0.52) **Infinite** | 0.37 × (0.36–0.37) **Infinite** |
| Descending: click to sorted rows painted (lower is better) | 1205 ms (±34.0) | 1008 ms (±28.8) | 1354 ms (±31.3) | 571 ms (±17.2) | 0.47 × (0.45–0.49) **Infinite** | 0.57 × (0.55–0.60) **Infinite** | 0.42 × (0.41–0.44) **Infinite** |
| Descending: click to settled (lower is better) | 1205 ms (±34.0) | 1008 ms (±28.8) | 1354 ms (±31.3) | 571 ms (±17.2) | 0.47 × (0.45–0.49) **Infinite** | 0.57 × (0.55–0.60) **Infinite** | 0.42 × (0.41–0.44) **Infinite** |
| Ascending: main thread scripting (lower is better) | 1262 ms (±39.6) | 951 ms (±38.4) | 1345 ms (±31.3) | 473 ms (±8.43) | 0.37 × (0.37–0.39) **Infinite** | 0.50 × (0.47–0.51) **Infinite** | 0.35 × (0.34–0.36) **Infinite** |
| Descending: main thread scripting (lower is better) | 1196 ms (±33.9) | 993 ms (±28.5) | 1347 ms (±30.9) | 555 ms (±16.7) | 0.46 × (0.44–0.48) **Infinite** | 0.56 × (0.54–0.60) **Infinite** | 0.41 × (0.40–0.43) **Infinite** |

## sort-number - 300,000 rows

Click the "salary" column header (number column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 649 ms (±35.8) | 879 ms (±32.9) | 1083 ms (±24.8) | 398 ms (±12.3) | 0.61 × (0.57–0.63) **Infinite** | 0.45 × (0.43–0.48) **Infinite** | 0.37 × (0.35–0.38) **Infinite** |
| Ascending: click to settled (lower is better) | 649 ms (±35.8) | 879 ms (±32.9) | 1083 ms (±24.8) | 414 ms (±14.4) | 0.64 × (0.58–0.65) **Infinite** | 0.47 × (0.44–0.49) **Infinite** | 0.38 × (0.36–0.39) **Infinite** |
| Descending: click to sorted rows painted (lower is better) | 886 ms (±32.6) | 861 ms (±15.7) | 1019 ms (±51.0) | 389 ms (±9.45) | 0.44 × (0.42–0.47) **Infinite** | 0.45 × (0.44–0.47) **Infinite** | 0.38 × (0.36–0.40) **Infinite** |
| Descending: click to settled (lower is better) | 886 ms (±32.6) | 861 ms (±15.7) | 1019 ms (±51.0) | 389 ms (±9.45) | 0.44 × (0.42–0.47) **Infinite** | 0.45 × (0.44–0.47) **Infinite** | 0.38 × (0.36–0.40) **Infinite** |
| Ascending: main thread scripting (lower is better) | 637 ms (±35.7) | 860 ms (±32.6) | 1074 ms (±24.9) | 385 ms (±12.6) | 0.60 × (0.55–0.62) **Infinite** | 0.45 × (0.42–0.47) **Infinite** | 0.36 × (0.34–0.37) **Infinite** |
| Descending: main thread scripting (lower is better) | 877 ms (±32.2) | 847 ms (±15.5) | 1012 ms (±50.5) | 373 ms (±9.84) | 0.43 × (0.41–0.46) **Infinite** | 0.44 × (0.43–0.46) **Infinite** | 0.37 × (0.35–0.38) **Infinite** |

## scroll-jump - 300,000 rows

Programmatic jumps to 10 far-away scroll positions (like dragging the scrollbar thumb). Measured from setting scrollTop to the end of the first frame committed with the first and last visible rows showing the right content, at the right position.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Jump to rows painted (median of jumps) (lower is better) | 23.6 ms (±0.24) | 34.9 ms (±1.21) | 12.2 ms (±0.35) | 35.3 ms (±0.46) | 1.50 × (1.49–1.54) **MUI X** | 1.01 × (0.96–1.03) ≈ | 2.90 × (2.82–2.97) **TanStack** |
| Jump to rows painted (worst jump) (lower is better) | 34.8 ms (±6.66) | 59.6 ms (±1.26) | 23.6 ms (±1.77) | 46.6 ms (±1.08) | 1.34 × (1.26–1.38) **MUI X** | 0.78 × (0.76–0.81) **Infinite** | 1.97 × (1.79–2.04) **TanStack** |
| Jump to settled (median of jumps) (lower is better) | 23.6 ms (±0.24) | 34.9 ms (±1.21) | 12.2 ms (±0.35) | 35.3 ms (±0.46) | 1.50 × (1.49–1.54) **MUI X** | 1.01 × (0.96–1.03) ≈ | 2.90 × (2.82–2.97) **TanStack** |
| Main thread scripting (all jumps) (lower is better) | 150 ms (±5.96) | 226 ms (±11.0) | 81.5 ms (±1.93) | 203 ms (±1.61) | 1.35 × (1.31–1.36) **MUI X** | 0.90 × (0.81–0.91) **Infinite** | 2.49 × (2.43–2.53) **TanStack** |

## scroll-vertical - 300,000 rows

Wheel-scroll down 24000px at 8000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 50.3 % (±0.00) | 51.1 % (±0.33) | 50.3 % (±0.00) | 59.1 % (±0.95) | 1.18 × (1.18–1.21) **Infinite** | 1.16 × (1.16–1.19) **Infinite** | 1.18 × (1.18–1.21) **Infinite** |
| Frames presented without main-thread update (lower is better) | 49.5 % (±0.00) | 48.6 % (±0.33) | 49.4 % (±0.00) | 40.9 % (±0.95) | 0.83 × (0.80–0.83) **Infinite** | 0.84 × (0.81–0.84) **Infinite** | 0.83 × (0.80–0.83) **Infinite** |
| Frames dropped (lower is better) | 0.27 % (±0.00) | 0.28 % (±0.00) | 0.28 % (±0.00) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 59.0 fps (±0.25) | 0.98 × (0.98–0.98) **MUI X** | 0.98 × (0.98–0.98) **AG Grid** | 0.98 × (0.98–0.98) **TanStack** |
| p95 rAF frame interval (lower is better) | 16.8 ms (±0.05) | 16.8 ms (±0.05) | 16.7 ms (±0.05) | 16.8 ms (±0.04) | 1.00 × (1.00–1.01) ≈ | 1.00 × (1.00–1.01) ≈ | 1.01 × (1.00–1.01) **TanStack** |
| Worst rAF frame interval (lower is better) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 50.0 ms (±0.08) | 2.98 × (2.97–2.98) **MUI X** | 2.98 × (2.97–2.98) **AG Grid** | 2.98 × (2.97–2.98) **TanStack** |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 1.09 % (±0.44) | +1.09 (+1.09 to +1.65) **MUI X** | +1.09 (+1.09 to +1.65) **AG Grid** | +1.09 (+1.09 to +1.65) **TanStack** |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Main thread: scripting (lower is better) | 677 ms (±21.2) | 660 ms (±18.2) | 428 ms (±8.78) | 771 ms (±6.41) | 1.14 × (1.12–1.20) **MUI X** | 1.17 × (1.15–1.19) **AG Grid** | 1.80 × (1.77–1.82) **TanStack** |
| Main thread: layout (lower is better) | 72.0 ms (±0.90) | 111 ms (±2.66) | 92.1 ms (±1.73) | 87.8 ms (±1.88) | 1.22 × (1.19–1.25) **MUI X** | 0.79 × (0.77–0.80) **Infinite** | 0.95 × (0.91–0.97) **Infinite** |
| Main thread: style recalc (lower is better) | 100 ms (±1.26) | 296 ms (±7.42) | 49.5 ms (±0.99) | 202 ms (±3.80) | 2.02 × (1.98–2.07) **MUI X** | 0.68 × (0.66–0.71) **Infinite** | 4.09 × (3.96–4.21) **TanStack** |
| Main thread: all tasks (lower is better) | 1625 ms (±33.8) | 1630 ms (±37.6) | 1013 ms (±14.4) | 1739 ms (±11.9) | 1.07 × (1.05–1.10) **MUI X** | 1.07 × (1.06–1.08) **AG Grid** | 1.72 × (1.69–1.74) **TanStack** |

## scroll-horizontal - 300,000 rows

Wheel-scroll right/left over all columns, 4 sweeps at 4000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 79.3 % (±7.91) | 76.4 % (±6.15) | 71.4 % (±4.52) | 95.0 % (±5.25) | 1.20 × (1.11–1.41) **Infinite** | 1.24 × (1.16–1.27) **Infinite** | 1.33 × (1.18–1.35) **Infinite** |
| Frames presented without main-thread update (lower is better) | 19.3 % (±7.72) | 22.2 % (±6.21) | 27.5 % (±4.40) | 4.96 % (±5.25) | 0.26 × (0.14–0.59) **Infinite** | 0.22 × (0.18–0.50) **Infinite** | 0.18 × (0.15–0.41) **Infinite** |
| Frames dropped (lower is better) | 0.71 % (±0.40) | 1.37 % (±0.28) | 0.70 % (±0.31) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.00) | 60.0 fps (±0.18) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) **Infinite** |
| p95 rAF frame interval (lower is better) | 16.8 ms (±0.05) | 16.8 ms (±0.05) | 16.8 ms (±0.05) | 16.7 ms (±0.04) | 0.99 × (0.99–1.00) ≈ | 0.99 × (0.99–1.00) ≈ | 0.99 × (0.99–1.00) ≈ |
| Worst rAF frame interval (lower is better) | 16.8 ms (±0.00) | 16.8 ms (±6.24) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.31) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Main thread: scripting (lower is better) | 401 ms (±8.24) | 270 ms (±11.4) | 177 ms (±7.97) | 165 ms (±1.55) | 0.41 × (0.40–0.42) **Infinite** | 0.61 × (0.57–0.62) **Infinite** | 0.93 × (0.88–0.95) **Infinite** |
| Main thread: layout (lower is better) | 49.1 ms (±0.86) | 78.9 ms (±2.98) | 54.6 ms (±1.62) | 11.9 ms (±0.26) | 0.24 × (0.23–0.25) **Infinite** | 0.15 × (0.14–0.16) **Infinite** | 0.22 × (0.21–0.22) **Infinite** |
| Main thread: style recalc (lower is better) | 24.5 ms (±1.07) | 46.7 ms (±1.55) | 15.7 ms (±0.72) | 53.4 ms (±0.77) | 2.18 × (2.05–2.25) **MUI X** | 1.14 × (1.10–1.16) **AG Grid** | 3.40 × (3.32–3.45) **TanStack** |
| Main thread: all tasks (lower is better) | 749 ms (±32.2) | 721 ms (±24.7) | 538 ms (±17.3) | 495 ms (±6.82) | 0.66 × (0.63–0.70) **Infinite** | 0.69 × (0.66–0.71) **Infinite** | 0.92 × (0.90–0.95) **Infinite** |

## correctness-vertical - 300,000 rows

Same kind of vertical wheel gesture, faster (20000px/s). After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Blank samples (lower is better) | 0.00 % (±0.00) | 1.82 % (±0.51) | 2.53 % (±0.50) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 69.0 % (±2.50) | +69.0 (+67.6 to +71.5) **MUI X** | +69.0 (+67.6 to +71.5) **AG Grid** | +69.0 (+67.6 to +71.5) **TanStack** |
| Frames with any blank/wrong sample (lower is better) | 0.00 % (±0.00) | 9.09 % (±2.57) | 12.7 % (±2.49) | 83.3 % (±1.85) | +83.3 (+82.9 to +85.4) **MUI X** | 9.17 × (7.88–15.9) **AG Grid** | 6.58 × (6.46–7.46) **TanStack** |
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
| Captured frames with blank rows (lower is better) | 0.00 % (±0.00) | 25.9 % (±2.64) | 2.86 % (±2.25) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | -2.86 (-2.99 to -1.41) **Infinite** |
| Blank body area (avg over frames) (lower is better) | 0.00 % (±0.00) | 5.60 % (±0.66) | 0.48 % (±0.26) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | -0.48 (-0.54 to -0.15) **Infinite** |
| Worst frame: blank rows (lower is better) | 0.00 rows (±0.00) | 13.0 rows (±1.73) | 5.00 rows (±2.57) | 0.00 rows (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | -5.00 (-5.00 to -1.00) **Infinite** |
| Captured frames (higher is better) | 69.0 (±0.76) | 55.0 (±1.40) | 70.0 (±1.40) | 72.0 (±1.11) | 1.04 × (1.01–1.06) **Infinite** | 1.31 × (1.29–1.35) **Infinite** | 1.03 × (1.01–1.07) **Infinite** |

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
| Time to first rows painted (lower is better) | 745 ms (±14.2) | 808 ms (±5.68) | 659 ms (±4.68) | 565 ms (±28.9) | 0.76 × (0.74–0.79) **Infinite** | 0.70 × (0.68–0.72) **Infinite** | 0.86 × (0.83–0.88) **Infinite** |
| Time until settled (lower is better) | 745 ms (±14.2) | 911 ms (±5.63) | 659 ms (±4.68) | 567 ms (±25.7) | 0.76 × (0.75–0.79) **Infinite** | 0.62 × (0.62–0.64) **Infinite** | 0.86 × (0.85–0.88) **Infinite** |
| Main thread: scripting (lower is better) | 731 ms (±14.3) | 782 ms (±5.83) | 648 ms (±4.49) | 542 ms (±26.8) | 0.74 × (0.73–0.77) **Infinite** | 0.69 × (0.68–0.71) **Infinite** | 0.84 × (0.82–0.86) **Infinite** |
| Main thread: layout (lower is better) | 4.65 ms (±0.13) | 7.41 ms (±0.29) | 4.34 ms (±0.17) | 3.89 ms (±0.28) | 0.84 × (0.79–0.96) **Infinite** | 0.52 × (0.49–0.59) **Infinite** | 0.90 × (0.82–1.00) ≈ |
| Main thread: style recalc (lower is better) | 4.81 ms (±0.07) | 11.9 ms (±0.23) | 1.86 ms (±0.32) | 8.70 ms (±0.57) | 1.81 × (1.70–1.96) **MUI X** | 0.73 × (0.69–0.79) **Infinite** | 4.67 × (3.71–5.52) **TanStack** |
| Main thread: all tasks (lower is better) | 748 ms (±14.2) | 825 ms (±9.41) | 661 ms (±5.02) | 569 ms (±26.8) | 0.76 × (0.75–0.79) **Infinite** | 0.69 × (0.68–0.71) **Infinite** | 0.86 × (0.85–0.88) **Infinite** |
| JS heap retained by grid (lower is better) | 150 MB (±0.00) | 213 MB (±0.02) | 287 MB (±0.00) | 90.7 MB (±0.48) | 0.61 × (0.60–0.61) **Infinite** | 0.43 × (0.42–0.43) **Infinite** | 0.32 × (0.31–0.32) **Infinite** |
| DOM elements in grid (lower is better) | 529 (±0.00) | 637 (±0.00) | 352 (±0.00) | 609 (±0.00) | 1.15 × (1.15–1.15) **MUI X** | 0.96 × (0.96–0.96) **Infinite** | 1.73 × (1.73–1.73) **TanStack** |

## sort-string - 1,000,000 rows

Click the "code" column header (string column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 5466 ms (±150) | 4067 ms (±97.7) | 6083 ms (±253) | 2120 ms (±75.9) | 0.39 × (0.36–0.40) **Infinite** | 0.52 × (0.49–0.54) **Infinite** | 0.35 × (0.33–0.37) **Infinite** |
| Ascending: click to settled (lower is better) | 5466 ms (±150) | 4067 ms (±97.7) | 6083 ms (±253) | 2129 ms (±73.7) | 0.39 × (0.36–0.41) **Infinite** | 0.52 × (0.49–0.54) **Infinite** | 0.35 × (0.33–0.38) **Infinite** |
| Descending: click to sorted rows painted (lower is better) | 5478 ms (±224) | 4141 ms (±79.9) | 5848 ms (±238) | 2431 ms (±83.9) | 0.44 × (0.42–0.46) **Infinite** | 0.59 × (0.56–0.60) **Infinite** | 0.42 × (0.39–0.43) **Infinite** |
| Descending: click to settled (lower is better) | 5478 ms (±224) | 4141 ms (±79.9) | 5848 ms (±238) | 2431 ms (±83.9) | 0.44 × (0.42–0.46) **Infinite** | 0.59 × (0.56–0.60) **Infinite** | 0.42 × (0.39–0.43) **Infinite** |
| Ascending: main thread scripting (lower is better) | 5454 ms (±150) | 4048 ms (±97.5) | 6074 ms (±251) | 2106 ms (±75.6) | 0.39 × (0.36–0.40) **Infinite** | 0.52 × (0.49–0.53) **Infinite** | 0.35 × (0.32–0.37) **Infinite** |
| Descending: main thread scripting (lower is better) | 5469 ms (±224) | 4126 ms (±79.7) | 5840 ms (±238) | 2415 ms (±82.8) | 0.44 × (0.41–0.46) **Infinite** | 0.59 × (0.56–0.60) **Infinite** | 0.41 × (0.39–0.43) **Infinite** |

## sort-number - 1,000,000 rows

Click the "salary" column header (number column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 2596 ms (±26.0) | 3306 ms (±66.2) | 4510 ms (±99.7) | 1374 ms (±13.6) | 0.53 × (0.53–0.54) **Infinite** | 0.42 × (0.41–0.43) **Infinite** | 0.30 × (0.30–0.31) **Infinite** |
| Ascending: click to settled (lower is better) | 2596 ms (±26.0) | 3306 ms (±66.2) | 4510 ms (±99.7) | 1383 ms (±13.7) | 0.53 × (0.53–0.54) **Infinite** | 0.42 × (0.41–0.43) **Infinite** | 0.31 × (0.31–0.32) **Infinite** |
| Descending: click to sorted rows painted (lower is better) | 3760 ms (±67.0) | 3379 ms (±64.4) | 4527 ms (±114) | 1479 ms (±32.5) | 0.39 × (0.39–0.41) **Infinite** | 0.44 × (0.42–0.45) **Infinite** | 0.33 × (0.32–0.34) **Infinite** |
| Descending: click to settled (lower is better) | 3760 ms (±67.0) | 3379 ms (±64.4) | 4527 ms (±114) | 1479 ms (±32.5) | 0.39 × (0.39–0.41) **Infinite** | 0.44 × (0.42–0.45) **Infinite** | 0.33 × (0.32–0.34) **Infinite** |
| Ascending: main thread scripting (lower is better) | 2583 ms (±26.2) | 3288 ms (±62.1) | 4502 ms (±99.6) | 1360 ms (±13.6) | 0.53 × (0.52–0.53) **Infinite** | 0.41 × (0.41–0.43) **Infinite** | 0.30 × (0.30–0.31) **Infinite** |
| Descending: main thread scripting (lower is better) | 3751 ms (±67.2) | 3365 ms (±64.2) | 4519 ms (±114) | 1462 ms (±33.0) | 0.39 × (0.38–0.40) **Infinite** | 0.43 × (0.42–0.45) **Infinite** | 0.32 × (0.31–0.34) **Infinite** |

## scroll-jump - 1,000,000 rows

Programmatic jumps to 10 far-away scroll positions (like dragging the scrollbar thumb). Measured from setting scrollTop to the end of the first frame committed with the first and last visible rows showing the right content, at the right position.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Jump to rows painted (median of jumps) (lower is better) | 21.8 ms (±0.36) | 34.9 ms (±1.30) | 12.5 ms (±0.35) | 40.0 ms (±0.60) | 1.84 × (1.79–1.88) **MUI X** | 1.15 × (1.12–1.16) **AG Grid** | 3.21 × (3.13–3.29) **TanStack** |
| Jump to rows painted (worst jump) (lower is better) | 41.2 ms (±1.24) | 68.2 ms (±2.01) | 34.5 ms (±1.27) | 51.5 ms (±2.65) | 1.25 × (1.15–1.29) **MUI X** | 0.75 × (0.70–0.78) **Infinite** | 1.49 × (1.39–1.56) **TanStack** |
| Jump to settled (median of jumps) (lower is better) | 21.8 ms (±0.36) | 34.9 ms (±1.30) | 12.5 ms (±0.35) | 40.0 ms (±0.60) | 1.84 × (1.79–1.88) **MUI X** | 1.15 × (1.12–1.16) **AG Grid** | 3.21 × (3.13–3.29) **TanStack** |
| Main thread scripting (all jumps) (lower is better) | 147 ms (±3.30) | 232 ms (±6.47) | 81.4 ms (±3.59) | 236 ms (±6.56) | 1.60 × (1.56–1.64) **MUI X** | 1.02 × (0.98–1.03) ≈ | 2.90 × (2.83–2.96) **TanStack** |

## scroll-vertical - 1,000,000 rows

Wheel-scroll down 24000px at 8000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 50.3 % (±0.11) | 49.9 % (±0.13) | 50.3 % (±0.16) | 65.2 % (±2.07) | 1.30 × (1.27–1.34) **Infinite** | 1.31 × (1.27–1.35) **Infinite** | 1.30 × (1.27–1.33) **Infinite** |
| Frames presented without main-thread update (lower is better) | 49.4 % (±0.11) | 49.2 % (±0.16) | 49.4 % (±0.16) | 34.3 % (±2.29) | 0.69 × (0.65–0.74) **Infinite** | 0.70 × (0.66–0.74) **Infinite** | 0.69 × (0.65–0.74) **Infinite** |
| Frames dropped (lower is better) | 0.28 % (±0.22) | 1.11 % (±0.25) | 0.28 % (±0.31) | 0.00 % (±0.31) | 0.00 × (0.00–2.09) ≈ | 0.00 × (0.00–0.69) **Infinite** | 0.00 × (0.00–2.10) ≈ |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.25) | 59.0 fps (±0.29) | 60.0 fps (±0.37) | 55.5 fps (±1.19) | 0.92 × (0.91–0.95) **MUI X** | 0.94 × (0.92–0.96) **AG Grid** | 0.92 × (0.91–0.94) **TanStack** |
| p95 rAF frame interval (lower is better) | 16.7 ms (±0.04) | 16.8 ms (±0.05) | 16.7 ms (±0.03) | 16.8 ms (±6.85) | 1.01 × (1.00–1.65) **MUI X** | 1.00 × (1.00–1.64) ≈ | 1.01 × (1.01–1.65) **TanStack** |
| Worst rAF frame interval (lower is better) | 16.8 ms (±8.84) | 33.3 ms (±0.05) | 16.8 ms (±18.8) | 117 ms (±0.05) | 6.94 × (3.50–6.95) **MUI X** | 3.50 × (3.49–3.50) **AG Grid** | 6.94 × (3.50–6.95) **TanStack** |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.43) | 1.64 % (±0.50) | 0.00 % (±0.27) | 3.51 % (±1.99) | +3.51 (+1.76 to +5.36) **MUI X** | 2.14 × (1.39–4.90) **AG Grid** | +3.51 (+2.30 to +5.36) **TanStack** |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Main thread: scripting (lower is better) | 703 ms (±25.6) | 865 ms (±14.2) | 445 ms (±10.3) | 908 ms (±32.9) | 1.29 × (1.24–1.37) **MUI X** | 1.05 × (1.01–1.11) **AG Grid** | 2.04 × (1.94–2.14) **TanStack** |
| Main thread: layout (lower is better) | 72.7 ms (±2.51) | 120 ms (±2.30) | 93.9 ms (±9.68) | 105 ms (±2.48) | 1.44 × (1.37–1.46) **MUI X** | 0.87 × (0.84–0.89) **Infinite** | 1.12 × (1.10–1.13) **TanStack** |
| Main thread: style recalc (lower is better) | 103 ms (±2.26) | 466 ms (±12.3) | 52.1 ms (±1.30) | 276 ms (±11.6) | 2.68 × (2.47–2.75) **MUI X** | 0.59 × (0.54–0.60) **Infinite** | 5.30 × (4.99–5.57) **TanStack** |
| Main thread: all tasks (lower is better) | 1693 ms (±44.4) | 2155 ms (±28.0) | 1103 ms (±16.9) | 2081 ms (±74.4) | 1.23 × (1.17–1.28) **MUI X** | 0.97 × (0.92–0.99) **Infinite** | 1.89 × (1.78–1.94) **TanStack** |

## scroll-horizontal - 1,000,000 rows

Wheel-scroll right/left over all columns, 4 sweeps at 4000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 67.3 % (±0.69) | 90.8 % (±6.37) | 80.3 % (±4.08) | 88.2 % (±4.55) | 1.31 × (1.31–1.43) **Infinite** | 0.97 × (0.96–1.16) ≈ | 1.10 × (1.09–1.29) **Infinite** |
| Frames presented without main-thread update (lower is better) | 31.6 % (±0.45) | 8.20 % (±6.05) | 19.0 % (±3.69) | 10.7 % (±4.44) | 0.34 × (0.13–0.39) **Infinite** | +2.50 (-12.3 to +4.62) ≈ | 0.56 × (0.20–0.64) **Infinite** |
| Frames dropped (lower is better) | 1.17 % (±0.26) | 0.83 % (±0.53) | 0.70 % (±0.47) | 0.00 % (±0.48) | 0.00 × (0.00–0.00) **Infinite** | -0.83 (-1.45 to -0.75) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 60.0 fps (±0.00) | 1.00 × (1.00–1.00) **Infinite** | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ |
| p95 rAF frame interval (lower is better) | 16.7 ms (±0.05) | 16.8 ms (±0.04) | 16.7 ms (±0.05) | 16.7 ms (±0.05) | 1.00 × (0.99–1.01) ≈ | 0.99 × (0.99–1.00) ≈ | 1.00 × (0.99–1.01) ≈ |
| Worst rAF frame interval (lower is better) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 16.8 ms (±0.00) | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Main thread: scripting (lower is better) | 397 ms (±7.21) | 262 ms (±5.85) | 176 ms (±5.08) | 182 ms (±7.72) | 0.46 × (0.43–0.47) **Infinite** | 0.69 × (0.66–0.72) **Infinite** | 1.03 × (0.97–1.08) ≈ |
| Main thread: layout (lower is better) | 49.4 ms (±1.10) | 78.1 ms (±1.45) | 54.8 ms (±1.46) | 12.9 ms (±0.88) | 0.26 × (0.25–0.28) **Infinite** | 0.16 × (0.16–0.18) **Infinite** | 0.23 × (0.23–0.25) **Infinite** |
| Main thread: style recalc (lower is better) | 24.9 ms (±0.83) | 46.7 ms (±0.78) | 15.7 ms (±0.36) | 57.4 ms (±3.90) | 2.31 × (2.19–2.45) **MUI X** | 1.23 × (1.17–1.30) **AG Grid** | 3.66 × (3.49–3.83) **TanStack** |
| Main thread: all tasks (lower is better) | 806 ms (±11.9) | 665 ms (±52.3) | 472 ms (±11.9) | 570 ms (±18.5) | 0.71 × (0.68–0.73) **Infinite** | 0.86 × (0.81–0.91) **Infinite** | 1.21 × (1.15–1.25) **TanStack** |

## correctness-vertical - 1,000,000 rows

Same kind of vertical wheel gesture, faster (20000px/s). After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | MUI X median (sd) | AG Grid median (sd) | TanStack median (sd) | Infinite median (sd) | Infinite vs MUI X | Infinite vs AG Grid | Infinite vs TanStack |
|---|---:|---:|---:|---:|---:|---:|---:|
| Blank samples (lower is better) | 0.00 % (±0.00) | 2.71 % (±0.78) | 2.31 % (±0.70) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 76.2 % (±1.07) | +76.2 (+75.9 to +77.0) **MUI X** | +76.2 (+75.9 to +77.0) **AG Grid** | +76.2 (+75.9 to +77.0) **TanStack** |
| Frames with any blank/wrong sample (lower is better) | 0.00 % (±0.00) | 13.6 % (±3.90) | 11.5 % (±3.52) | 80.6 % (±1.60) | +80.6 (+80.6 to +80.6) **MUI X** | 5.94 × (5.10–9.34) **AG Grid** | 6.98 × (5.24–7.85) **TanStack** |
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
| Captured frames with blank rows (lower is better) | 0.00 % (±0.00) | 52.8 % (±4.25) | 9.52 % (±2.61) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Blank body area (avg over frames) (lower is better) | 0.00 % (±0.00) | 20.6 % (±1.85) | 2.70 % (±0.83) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Worst frame: blank rows (lower is better) | 0.00 rows (±0.00) | 18.0 rows (±0.00) | 11.0 rows (±1.83) | 0.00 rows (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** |
| Captured frames (higher is better) | 63.0 (±0.90) | 38.0 (±1.07) | 61.0 (±1.11) | 66.0 (±2.37) | 1.05 × (1.02–1.10) **Infinite** | 1.74 × (1.67–1.81) **Infinite** | 1.08 × (1.05–1.12) **Infinite** |
