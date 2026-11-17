# AG Grid vs TanStack Table vs PrimeVue DataTable vs Element Plus Table V2 vs Infinite Table — benchmark report

- Run: `ci` · 2026-11-17T12:40:18.952Z
- AG Grid 36.3.0 · TanStack Table 9.3.1 · PrimeVue DataTable 4.5.5 · Element Plus Table V2 2.14.8 · Infinite Table 10.1.5
- 300,000 rows (data checksum `300000:72377c6e`) · 1,000,000 rows (data checksum `1000000:19e5eebe`) × 20 columns, identical data for every grid
- Chrome 136.0.7103.25 · headless · CPU throttling 1× · viewport 1400×1000
- 7 measured runs per grid per scenario (+1 warmup, discarded), interleaved, fresh browser context per run
- Linux 7.0.0-1017-azure x64 · AMD EPYC 7763 64-Core Processor × 2
- Served from http://localhost:5570/
- Grid body: 759-760 px high, with the same number of rows in view in every grid (to get there, the setup made the boxes taller: AG Grid +3 px, TanStack +2 px)

The "Infinite vs ..." columns compare Infinite Table with one other grid: the ratio of the medians (Infinite / other, so < 1 means Infinite has the lower value), its 95% bootstrap confidence interval, and the grid that does better. A grid is only named when the interval excludes 1; "≈" means no significant difference. When the other grid has zeros among its values (e.g. 0% blank samples) a ratio means nothing, so the difference of the medians (Infinite − other) and its interval are shown instead, and a grid is only named when that interval excludes 0.

# 300,000 rows

Scroll range - browsers cap element sizes (Chrome ~16.7M-33.5M px, depending on the version), so a grid has to map the scrollbar onto the rows when the content is taller than that. One that doesn't can't reach its last rows: its scrolling results are for the rows it can reach, and the same wheel gesture goes over fewer rows in it.

| | AG Grid | TanStack | PrimeVue | Element Plus | Infinite |
|---|---:|---:|---:|---:|---:|
| Last row reachable with the scrollbar | yes (300,000) | yes (300,000) | yes (300,000) | yes (300,000) | yes (300,000) |
| Native scroll range | 11,999,241 px | 11,999,240 px | 11,999,240 px | 11,999,240 px | 11,999,240 px |
| Content px per scrollbar px | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |

## mount - 300,000 rows

Mount the grid with all the rows (data already in memory). "Visible" = from setState to the end of the first frame committed with the whole viewport (first/last visible row and column) showing the right content. "Settled" = until the first frame committed after the grid's last DOM mutation. Memory is the JS heap retained by the grid after GC (heap after mount - heap before mount).

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Time to first rows painted (lower is better) | 1303 ms (±25.9) | 415 ms (±10.4) | 955 ms (±41.5) | 90.3 ms (±3.37) | 345 ms (±12.3) | 0.26 × (0.26–0.28) **Infinite** | 0.83 × (0.81–0.89) **Infinite** | 0.36 × (0.34–0.40) **Infinite** | 3.82 × (3.79–4.25) **Element Plus** |
| Time until settled (lower is better) | 1408 ms (±25.9) | 415 ms (±10.4) | 955 ms (±41.5) | 90.3 ms (±3.37) | 369 ms (±14.6) | 0.26 × (0.26–0.28) **Infinite** | 0.89 × (0.86–0.95) **Infinite** | 0.39 × (0.37–0.42) **Infinite** | 4.08 × (4.00–4.50) **Element Plus** |
| Main thread: layout (lower is better) | 9.85 ms (±0.51) | 5.30 ms (±4.43) | 14.3 ms (±11.6) | 6.72 ms (±1.30) | 4.79 ms (±0.30) | 0.49 × (0.44–0.53) **Infinite** | 0.90 × (0.73–1.00) **Infinite** | 0.34 × (0.25–0.36) **Infinite** | 0.71 × (0.52–0.76) **Infinite** |
| Main thread: style recalc (lower is better) | 17.8 ms (±1.06) | 3.35 ms (±1.16) | 15.5 ms (±8.34) | 3.99 ms (±1.03) | 10.3 ms (±1.13) | 0.58 × (0.56–0.64) **Infinite** | 3.07 × (2.84–3.43) **TanStack** | 0.67 × (0.37–0.99) **Infinite** | 2.58 × (2.31–2.75) **Element Plus** |
| Main thread: all tasks (lower is better) | 1319 ms (±24.8) | 417 ms (±10.7) | 1011 ms (±37.0) | 156 ms (±5.99) | 369 ms (±18.3) | 0.28 × (0.27–0.30) **Infinite** | 0.88 × (0.84–0.95) **Infinite** | 0.36 × (0.35–0.40) **Infinite** | 2.36 × (2.27–2.60) **Element Plus** |
| JS heap retained by grid (lower is better) | 204 MB (±0.05) | 87.2 MB (±0.00) | 21.6 MB (±0.04) | 2.77 MB (±0.00) | 36.7 MB (±0.00) | 0.18 × (0.18–0.18) **Infinite** | 0.42 × (0.42–0.42) **Infinite** | 1.70 × (1.70–1.71) **PrimeVue** | 13.2 × (13.2–13.2) **Element Plus** |
| DOM elements in grid (lower is better) | 637 (±0.00) | 352 (±0.00) | 1028 (±0.00) | 992 (±0.00) | 606 (±0.00) | 0.95 × (0.95–0.95) **Infinite** | 1.72 × (1.72–1.72) **TanStack** | 0.59 × (0.59–0.59) **Infinite** | 0.61 × (0.61–0.61) **Infinite** |

## sort-string - 300,000 rows

Click the "code" column header (string column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 981 ms (±36.3) | 1155 ms (±67.0) | 3995 ms (±179) | 300 ms (±6.86) | 654 ms (±23.5) | 0.67 × (0.64–0.72) **Infinite** | 0.57 × (0.53–0.64) **Infinite** | 0.16 × (0.15–0.18) **Infinite** | 2.18 × (2.11–2.32) **Element Plus** |
| Ascending: click to settled (lower is better) | 981 ms (±36.3) | 1155 ms (±67.0) | 3995 ms (±179) | 300 ms (±6.86) | 659 ms (±24.4) | 0.67 × (0.64–0.73) **Infinite** | 0.57 × (0.54–0.64) **Infinite** | 0.16 × (0.15–0.18) **Infinite** | 2.19 × (2.12–2.35) **Element Plus** |
| Descending: click to sorted rows painted (lower is better) | 944 ms (±74.2) | 1075 ms (±31.2) | 4086 ms (±68.8) | 308 ms (±7.72) | 661 ms (±32.7) | 0.70 × (0.65–0.76) **Infinite** | 0.61 × (0.59–0.67) **Infinite** | 0.16 × (0.16–0.18) **Infinite** | 2.15 × (2.08–2.35) **Element Plus** |
| Descending: click to settled (lower is better) | 944 ms (±74.2) | 1075 ms (±31.2) | 4086 ms (±68.8) | 308 ms (±7.72) | 661 ms (±32.7) | 0.70 × (0.65–0.76) **Infinite** | 0.61 × (0.59–0.67) **Infinite** | 0.16 × (0.16–0.18) **Infinite** | 2.15 × (2.08–2.35) **Element Plus** |
| Ascending: main thread, all tasks (lower is better) | 987 ms (±36.5) | 1157 ms (±67.0) | 4030 ms (±179) | 410 ms (±12.3) | 660 ms (±24.9) | 0.67 × (0.64–0.73) **Infinite** | 0.57 × (0.54–0.64) **Infinite** | 0.16 × (0.15–0.18) **Infinite** | 1.61 × (1.57–1.73) **Element Plus** |
| Descending: main thread, all tasks (lower is better) | 948 ms (±74.6) | 1076 ms (±31.3) | 4120 ms (±65.9) | 414 ms (±19.0) | 659 ms (±29.8) | 0.70 × (0.65–0.75) **Infinite** | 0.61 × (0.59–0.67) **Infinite** | 0.16 × (0.16–0.17) **Infinite** | 1.59 × (1.50–1.73) **Element Plus** |

## sort-number - 300,000 rows

Click the "salary" column header (number column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 1145 ms (±106) | 954 ms (±71.4) | 3635 ms (±144) | 241 ms (±30.7) | 573 ms (±55.1) | 0.50 × (0.45–0.57) **Infinite** | 0.60 × (0.53–0.65) **Infinite** | 0.16 × (0.15–0.17) **Infinite** | 2.37 × (1.95–2.58) **Element Plus** |
| Ascending: click to settled (lower is better) | 1145 ms (±106) | 954 ms (±71.4) | 3635 ms (±144) | 241 ms (±30.7) | 578 ms (±55.2) | 0.51 × (0.45–0.58) **Infinite** | 0.61 × (0.54–0.66) **Infinite** | 0.16 × (0.15–0.17) **Infinite** | 2.39 × (1.97–2.60) **Element Plus** |
| Descending: click to sorted rows painted (lower is better) | 1047 ms (±62.3) | 845 ms (±78.6) | 3670 ms (±197) | 249 ms (±25.0) | 599 ms (±45.8) | 0.57 × (0.53–0.68) **Infinite** | 0.71 × (0.56–0.78) **Infinite** | 0.16 × (0.15–0.18) **Infinite** | 2.41 × (2.19–2.99) **Element Plus** |
| Descending: click to settled (lower is better) | 1047 ms (±62.3) | 845 ms (±78.6) | 3670 ms (±197) | 249 ms (±25.0) | 599 ms (±45.8) | 0.57 × (0.53–0.68) **Infinite** | 0.71 × (0.56–0.78) **Infinite** | 0.16 × (0.15–0.18) **Infinite** | 2.41 × (2.19–2.99) **Element Plus** |
| Ascending: main thread, all tasks (lower is better) | 1151 ms (±106) | 1298 ms (±83.2) | 3670 ms (±143) | 363 ms (±42.8) | 579 ms (±56.7) | 0.50 × (0.45–0.57) **Infinite** | 0.45 × (0.41–0.48) **Infinite** | 0.16 × (0.15–0.17) **Infinite** | 1.59 × (1.33–1.73) **Element Plus** |
| Descending: main thread, all tasks (lower is better) | 1051 ms (±60.9) | 846 ms (±78.8) | 3705 ms (±197) | 364 ms (±37.8) | 598 ms (±49.0) | 0.57 × (0.52–0.67) **Infinite** | 0.71 × (0.56–0.78) **Infinite** | 0.16 × (0.14–0.18) **Infinite** | 1.64 × (1.45–2.02) **Element Plus** |

## scroll-jump - 300,000 rows

Programmatic jumps to 10 far-away scroll positions (like dragging the scrollbar thumb). Measured from setting scrollTop to the end of the first frame committed with the first and last visible rows showing the right content, at the right position.

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Jump to rows painted (median of jumps) (lower is better) | 37.4 ms (±0.83) | 19.3 ms (±1.29) | 493 ms (±5.29) | 59.9 ms (±1.76) | 73.4 ms (±0.91) | 1.97 × (1.92–2.04) **AG Grid** | 3.81 × (3.55–4.09) **TanStack** | 0.15 × (0.15–0.15) **Infinite** | 1.23 × (1.17–1.26) **Element Plus** |
| Jump to rows painted (worst jump) (lower is better) | 84.7 ms (±2.38) | 54.9 ms (±17.9) | 693 ms (±10.7) | 97.1 ms (±2.16) | 95.5 ms (±3.02) | 1.13 × (1.11–1.18) **AG Grid** | 1.74 × (1.20–1.91) **TanStack** | 0.14 × (0.14–0.14) **Infinite** | 0.98 × (0.96–1.01) ≈ |
| Jump to settled (median of jumps) (lower is better) | 37.4 ms (±0.83) | 19.3 ms (±1.29) | 493 ms (±5.29) | 59.9 ms (±1.76) | 73.4 ms (±0.91) | 1.97 × (1.92–2.04) **AG Grid** | 3.81 × (3.55–4.09) **TanStack** | 0.15 × (0.15–0.15) **Infinite** | 1.23 × (1.17–1.26) **Element Plus** |
| Main thread, all tasks (all jumps) (lower is better) | 657 ms (±11.6) | 421 ms (±6.51) | 5593 ms (±59.3) | 716 ms (±6.51) | 857 ms (±12.4) | 1.30 × (1.29–1.32) **AG Grid** | 2.03 × (2.02–2.10) **TanStack** | 0.15 × (0.15–0.16) **Infinite** | 1.20 × (1.19–1.21) **Element Plus** |

## scroll-vertical - 300,000 rows

Wheel-scroll down 24000px at 8000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 48.3 % (±0.08) | 49.7 % (±0.30) | 7.73 % (±0.11) | 43.1 % (±0.52) | 39.5 % (±1.42) | 0.82 × (0.79–0.83) **AG Grid** | 0.79 × (0.77–0.81) **TanStack** | 5.11 × (4.91–5.22) **Infinite** | 0.92 × (0.88–0.94) **Element Plus** |
| Frames presented without main-thread update (lower is better) | 47.4 % (±0.08) | 48.9 % (±0.30) | 74.2 % (±0.98) | 42.5 % (±0.52) | 60.4 % (±1.52) | 1.27 × (1.24–1.31) **AG Grid** | 1.23 × (1.21–1.27) **TanStack** | 0.81 × (0.79–0.84) **Infinite** | 1.42 × (1.39–1.46) **Element Plus** |
| Frames dropped (lower is better) | 4.31 % (±0.16) | 1.39 % (±0.60) | 18.0 % (±1.08) | 14.4 % (±1.04) | 0.44 % (±0.61) | 0.10 × (0.00–0.32) **Infinite** | 0.32 × (0.00–0.94) **Infinite** | 0.02 × (0.00–0.07) **Infinite** | 0.03 × (0.00–0.09) **Infinite** |
| Main thread frame rate (rAF) (higher is better) | 55.5 fps (±0.17) | 58.7 fps (±0.69) | 3.98 fps (±0.12) | 45.6 fps (±0.92) | 15.8 fps (±0.66) | 0.28 × (0.27–0.29) **AG Grid** | 0.27 × (0.26–0.28) **TanStack** | 3.97 × (3.69–4.09) **Infinite** | 0.35 × (0.33–0.36) **Element Plus** |
| p95 rAF frame interval (lower is better) | 16.8 ms (±6.49) | 16.8 ms (±0.05) | 617 ms (±21.0) | 33.4 ms (±6.22) | 122 ms (±4.69) | 7.24 × (4.73–7.54) **AG Grid** | 7.24 × (7.05–7.54) **TanStack** | 0.20 × (0.19–0.21) **Infinite** | 3.64 × (3.46–3.79) **Element Plus** |
| Worst rAF frame interval (lower is better) | 50.1 ms (±8.13) | 50.0 ms (±20.8) | 667 ms (±8.90) | 66.7 ms (±6.24) | 167 ms (±13.1) | 3.33 × (2.50–3.67) **AG Grid** | 3.34 × (3.33–5.49) **TanStack** | 0.25 × (0.25–0.28) **Infinite** | 2.50 × (2.50–2.75) **Element Plus** |
| rAF intervals > 25ms (lower is better) | 4.65 % (±0.63) | 2.20 % (±0.96) | 46.7 % (±3.42) | 25.9 % (±1.90) | 87.8 % (±1.22) | 18.9 × (16.6–21.6) **AG Grid** | +85.6 (+83.8 to +86.4) **TanStack** | 1.88 × (1.74–2.01) **PrimeVue** | 3.39 × (3.19–3.57) **Element Plus** |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±2.20) | 0.00 ms (±0.00) | 3049 ms (±91.5) | 27.6 ms (±9.70) | 203 ms (±32.6) | +203 (+175 to +228) **AG Grid** | +203 (+175 to +228) **TanStack** | 0.07 × (0.06–0.08) **Infinite** | 7.36 × (5.09–9.70) **Element Plus** |
| Main thread: layout (lower is better) | 365 ms (±7.42) | 110 ms (±5.81) | 85.1 ms (±3.13) | 155 ms (±6.52) | 75.1 ms (±2.44) | 0.21 × (0.20–0.22) **Infinite** | 0.68 × (0.64–0.72) **Infinite** | 0.88 × (0.86–0.94) **Infinite** | 0.48 × (0.47–0.51) **Infinite** |
| Main thread: style recalc (lower is better) | 221 ms (±4.77) | 63.7 ms (±2.75) | 52.4 ms (±2.59) | 136 ms (±6.08) | 199 ms (±3.46) | 0.90 × (0.88–0.93) **Infinite** | 3.12 × (2.99–3.27) **TanStack** | 3.79 × (3.68–3.86) **PrimeVue** | 1.47 × (1.39–1.49) **Element Plus** |
| Main thread: all tasks (lower is better) | 1736 ms (±42.0) | 1329 ms (±27.7) | 3686 ms (±55.9) | 2989 ms (±15.8) | 2442 ms (±24.9) | 1.41 × (1.37–1.43) **AG Grid** | 1.84 × (1.78–1.87) **TanStack** | 0.66 × (0.65–0.67) **Infinite** | 0.82 × (0.81–0.82) **Infinite** |

## scroll-horizontal - 300,000 rows

Wheel-scroll right/left over all columns, 4 sweeps at 4000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 75.7 % (±6.03) | 71.2 % (±3.93) | 96.8 % (±0.27) | 50.2 % (±2.04) | 85.9 % (±1.77) | 1.13 × (1.11–1.17) **Infinite** | 1.21 × (1.19–1.34) **Infinite** | 0.89 × (0.87–0.91) **PrimeVue** | 1.71 × (1.60–1.76) **Infinite** |
| Frames presented without main-thread update (lower is better) | 22.1 % (±6.04) | 24.8 % (±4.92) | 3.20 % (±0.27) | 42.7 % (±2.48) | 14.1 % (±1.77) | 0.64 × (0.52–0.72) **Infinite** | 0.57 × (0.42–0.68) **Infinite** | 4.40 × (3.65–4.83) **PrimeVue** | 0.33 × (0.27–0.40) **Infinite** |
| Frames dropped (lower is better) | 2.33 % (±0.51) | 3.87 % (±1.72) | 0.00 % (±0.00) | 7.32 % (±1.02) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** |
| Main thread frame rate (rAF) (higher is better) | 59.0 fps (±0.26) | 59.0 fps (±1.00) | 60.0 fps (±0.00) | 54.9 fps (±0.84) | 55.2 fps (±0.41) | 0.93 × (0.92–0.94) **AG Grid** | 0.93 × (0.93–0.97) **TanStack** | 0.92 × (0.91–0.93) **PrimeVue** | 1.00 × (1.00–1.04) ≈ |
| p95 rAF frame interval (lower is better) | 16.8 ms (±0.05) | 16.8 ms (±0.04) | 16.7 ms (±0.05) | 33.3 ms (±0.01) | 33.2 ms (±8.10) | 1.98 × (1.00–1.99) **AG Grid** | 1.98 × (1.00–1.98) **TanStack** | 1.99 × (1.01–1.99) **PrimeVue** | 1.00 × (0.50–1.00) **Infinite** |
| Worst rAF frame interval (lower is better) | 33.3 ms (±0.05) | 33.4 ms (±8.88) | 16.8 ms (±0.00) | 66.6 ms (±8.11) | 99.9 ms (±13.1) | 3.00 × (2.49–3.00) **AG Grid** | 2.99 × (1.67–3.00) **TanStack** | 5.95 × (4.96–5.95) **PrimeVue** | 1.50 × (1.25–1.99) **Element Plus** |
| rAF intervals > 25ms (lower is better) | 1.63 % (±0.44) | 1.64 % (±1.20) | 0.00 % (±0.00) | 7.56 % (±1.59) | 6.09 % (±0.85) | 3.74 × (2.68–7.55) **AG Grid** | 3.71 × (1.54–3.78) **TanStack** | +6.09 (+4.39 to +6.14) **PrimeVue** | 0.80 × (0.53–0.91) **Infinite** |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±3.11) | 0.00 ms (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (-3.26 to 0.00) ≈ |
| Main thread: layout (lower is better) | 91.4 ms (±2.79) | 65.5 ms (±5.37) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 27.1 ms (±1.91) | 0.30 × (0.27–0.32) **Infinite** | 0.41 × (0.38–0.46) **Infinite** | +27.1 (+25.1 to +28.8) **PrimeVue** | +27.1 (+25.1 to +28.8) **Element Plus** |
| Main thread: style recalc (lower is better) | 50.3 ms (±2.00) | 17.4 ms (±3.87) | 0.00 ms (±0.00) | 6.88 ms (±1.53) | 37.9 ms (±1.48) | 0.75 × (0.71–0.79) **Infinite** | 2.18 × (1.71–2.46) **TanStack** | +37.9 (+37.5 to +39.5) **PrimeVue** | 5.50 × (4.24–5.88) **Element Plus** |
| Main thread: all tasks (lower is better) | 815 ms (±24.8) | 659 ms (±14.1) | 31.3 ms (±1.90) | 1666 ms (±54.7) | 656 ms (±11.7) | 0.81 × (0.78–0.82) **Infinite** | 1.00 × (0.96–1.01) ≈ | 20.9 × (18.7–21.4) **PrimeVue** | 0.39 × (0.38–0.41) **Infinite** |

## correctness-vertical - 300,000 rows

Same kind of vertical wheel gesture, faster (20000px/s). After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Blank samples (lower is better) | 2.70 % (±1.31) | 1.76 % (±0.64) | 0.00 % (±0.00) | 1.62 % (±1.09) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Frames with any blank/wrong sample (lower is better) | 11.3 % (±6.35) | 8.82 % (±3.19) | 0.00 % (±0.00) | 8.11 % (±5.43) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** |
| Worst frame: correct samples (higher is better) | 80.0 % (±19.8) | 80.0 % (±0.00) | 100 % (±0.00) | 80.0 % (±0.00) | 100 % (±0.00) | 1.25 × (1.25–1.94) **Infinite** | 1.25 × (1.25–1.25) **Infinite** | 1.00 × (1.00–1.00) ≈ | 1.25 × (1.25–1.25) **Infinite** |

## correctness-horizontal - 300,000 rows

Same kind of horizontal wheel gesture. After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Blank samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Frames with any blank/wrong sample (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Worst frame: correct samples (higher is better) | 100 % (±0.00) | 100 % (±0.00) | 100 % (±0.00) | 100 % (±0.00) | 100 % (±0.00) | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ |

## visual-blank-vertical - 300,000 rows

Fast vertical wheel gesture (20000px/s) while recording what the compositor actually displays (CDP screencast). Each frame is checked for blank areas: vertical runs of the body with no text where rows should be. Unlike the correctness probe, this also catches the compositor scrolling ahead of the main thread. Screencast capture skips frames under load and adds overhead - compare the grids, not absolute numbers.

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Captured frames with blank rows (lower is better) | 85.0 % (±3.84) | 54.5 % (±5.70) | 94.5 % (±1.23) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ |
| Blank body area (avg over frames) (lower is better) | 54.1 % (±6.87) | 29.1 % (±2.79) | 89.2 % (±0.71) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ |
| Worst frame: blank rows (lower is better) | 18.0 rows (±0.00) | 18.0 rows (±0.00) | 18.0 rows (±0.00) | 0.00 rows (±0.00) | 0.00 rows (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ |
| Captured frames (higher is better) | 22.0 (±1.57) | 33.0 (±1.11) | 55.0 (±3.15) | 22.0 (±0.53) | 44.0 (±2.16) | 2.00 × (1.82–2.14) **Infinite** | 1.33 × (1.21–1.41) **Infinite** | 0.80 × (0.71–0.82) **PrimeVue** | 2.00 × (1.82–2.14) **Infinite** |

# 1,000,000 rows

Scroll range - browsers cap element sizes (Chrome ~16.7M-33.5M px, depending on the version), so a grid has to map the scrollbar onto the rows when the content is taller than that. One that doesn't can't reach its last rows: its scrolling results are for the rows it can reach, and the same wheel gesture goes over fewer rows in it.

| | AG Grid | TanStack | PrimeVue | Element Plus | Infinite |
|---|---:|---:|---:|---:|---:|
| Last row reachable with the scrollbar | yes (1,000,000) | **no** - stops at row 838,860 | **no** - stops at row 838,881 | **no** - stops at row 838,861 | yes (1,000,000) |
| Native scroll range | 31,999,240 px | 33,553,630 px | 33,553,632 px | 33,553,668 px | 31,999,240 px |
| Content px per scrollbar px | 1.250 | 1.000 | 1.000 | 1.000 | 1.250 |

## mount - 1,000,000 rows

Mount the grid with all the rows (data already in memory). "Visible" = from setState to the end of the first frame committed with the whole viewport (first/last visible row and column) showing the right content. "Settled" = until the first frame committed after the grid's last DOM mutation. Memory is the JS heap retained by the grid after GC (heap after mount - heap before mount).

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Time to first rows painted (lower is better) | 3828 ms (±41.3) | 1166 ms (±39.5) | 1474 ms (±61.6) | 95.2 ms (±6.49) | 732 ms (±14.3) | 0.19 × (0.19–0.19) **Infinite** | 0.63 × (0.60–0.64) **Infinite** | 0.50 × (0.49–0.52) **Infinite** | 7.69 × (7.09–8.13) **Element Plus** |
| Time until settled (lower is better) | 3932 ms (±41.3) | 1166 ms (±39.5) | 1474 ms (±61.6) | 95.2 ms (±6.49) | 761 ms (±15.5) | 0.19 × (0.19–0.20) **Infinite** | 0.65 × (0.62–0.67) **Infinite** | 0.52 × (0.50–0.53) **Infinite** | 8.00 × (7.32–8.41) **Element Plus** |
| Main thread: layout (lower is better) | 9.19 ms (±0.09) | 4.99 ms (±0.17) | 80.4 ms (±48.0) | 6.17 ms (±0.94) | 4.25 ms (±2.97) | 0.46 × (0.45–0.90) **Infinite** | 0.85 × (0.83–1.70) ≈ | 0.05 × (0.04–0.13) **Infinite** | 0.69 × (0.67–1.34) ≈ |
| Main thread: style recalc (lower is better) | 16.3 ms (±0.31) | 3.16 ms (±0.11) | 47.2 ms (±15.2) | 3.70 ms (±0.14) | 14.7 ms (±4.34) | 0.90 × (0.69–0.99) **Infinite** | 4.64 × (3.49–5.16) **TanStack** | 0.31 × (0.24–0.35) **Infinite** | 3.96 × (3.00–4.39) **Element Plus** |
| Main thread: all tasks (lower is better) | 3840 ms (±36.8) | 1194 ms (±41.3) | 1585 ms (±51.4) | 101 ms (±6.66) | 758 ms (±15.5) | 0.20 × (0.19–0.20) **Infinite** | 0.63 × (0.61–0.65) **Infinite** | 0.48 × (0.47–0.49) **Infinite** | 7.53 × (6.91–7.96) **Element Plus** |
| JS heap retained by grid (lower is better) | 670 MB (±0.05) | 287 MB (±0.01) | 21.6 MB (±0.02) | 2.77 MB (±0.00) | 90.7 MB (±0.00) | 0.14 × (0.14–0.14) **Infinite** | 0.32 × (0.32–0.32) **Infinite** | 4.19 × (4.19–4.19) **PrimeVue** | 32.8 × (32.8–32.8) **Element Plus** |
| DOM elements in grid (lower is better) | 637 (±0.00) | 352 (±0.00) | 1028 (±0.00) | 992 (±0.00) | 606 (±0.00) | 0.95 × (0.95–0.95) **Infinite** | 1.72 × (1.72–1.72) **TanStack** | 0.59 × (0.59–0.59) **Infinite** | 0.61 × (0.61–0.61) **Infinite** |

## sort-string - 1,000,000 rows

Click the "code" column header (string column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 3992 ms (±126) | 4693 ms (±86.6) | 14191 ms (±392) | 1157 ms (±69.8) | 2202 ms (±50.9) | 0.55 × (0.53–0.56) **Infinite** | 0.47 × (0.46–0.49) **Infinite** | 0.16 × (0.15–0.16) **Infinite** | 1.90 × (1.77–1.99) **Element Plus** |
| Ascending: click to settled (lower is better) | 3992 ms (±126) | 4693 ms (±86.6) | 14191 ms (±392) | 1157 ms (±69.8) | 2207 ms (±50.7) | 0.55 × (0.53–0.56) **Infinite** | 0.47 × (0.46–0.49) **Infinite** | 0.16 × (0.15–0.16) **Infinite** | 1.91 × (1.78–2.00) **Element Plus** |
| Descending: click to sorted rows painted (lower is better) | 4001 ms (±67.6) | 4473 ms (±97.6) | 14583 ms (±557) | 1202 ms (±61.3) | 2366 ms (±80.5) | 0.59 × (0.56–0.61) **Infinite** | 0.53 × (0.51–0.55) **Infinite** | 0.16 × (0.15–0.17) **Infinite** | 1.97 × (1.79–2.09) **Element Plus** |
| Descending: click to settled (lower is better) | 4001 ms (±67.6) | 4473 ms (±97.6) | 14583 ms (±557) | 1202 ms (±61.3) | 2366 ms (±80.5) | 0.59 × (0.56–0.61) **Infinite** | 0.53 × (0.51–0.55) **Infinite** | 0.16 × (0.15–0.17) **Infinite** | 1.97 × (1.79–2.09) **Element Plus** |
| Ascending: main thread, all tasks (lower is better) | 3999 ms (±127) | 4695 ms (±86.8) | 14539 ms (±558) | 1575 ms (±73.9) | 2208 ms (±50.9) | 0.55 × (0.53–0.56) **Infinite** | 0.47 × (0.46–0.49) **Infinite** | 0.15 × (0.15–0.16) **Infinite** | 1.40 × (1.34–1.48) **Element Plus** |
| Descending: main thread, all tasks (lower is better) | 4004 ms (±67.6) | 4474 ms (±97.1) | 14855 ms (±713) | 1601 ms (±126) | 2369 ms (±81.3) | 0.59 × (0.56–0.61) **Infinite** | 0.53 × (0.50–0.55) **Infinite** | 0.16 × (0.15–0.17) **Infinite** | 1.48 × (1.35–1.56) **Element Plus** |

## sort-number - 1,000,000 rows

Click the "salary" column header (number column, unique-ish values) - first click sorts ascending (cold), second click descending. Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Ascending: click to sorted rows painted (lower is better) | 3997 ms (±101) | 3866 ms (±136) | 11704 ms (±496) | 761 ms (±16.0) | 1572 ms (±27.7) | 0.39 × (0.38–0.40) **Infinite** | 0.41 × (0.39–0.43) **Infinite** | 0.13 × (0.13–0.14) **Infinite** | 2.07 × (1.98–2.10) **Element Plus** |
| Ascending: click to settled (lower is better) | 3997 ms (±101) | 3866 ms (±136) | 11704 ms (±496) | 761 ms (±16.0) | 1576 ms (±27.6) | 0.39 × (0.38–0.40) **Infinite** | 0.41 × (0.40–0.43) **Infinite** | 0.13 × (0.13–0.14) **Infinite** | 2.07 × (1.99–2.11) **Element Plus** |
| Descending: click to sorted rows painted (lower is better) | 4058 ms (±70.6) | 3564 ms (±93.2) | 12099 ms (±529) | 773 ms (±7.82) | 1761 ms (±99.3) | 0.43 × (0.43–0.45) **Infinite** | 0.49 × (0.49–0.52) **Infinite** | 0.15 × (0.14–0.15) **Infinite** | 2.28 × (2.25–2.32) **Element Plus** |
| Descending: click to settled (lower is better) | 4058 ms (±70.6) | 3564 ms (±93.2) | 12099 ms (±529) | 773 ms (±7.82) | 1761 ms (±99.3) | 0.43 × (0.43–0.45) **Infinite** | 0.49 × (0.49–0.52) **Infinite** | 0.15 × (0.14–0.15) **Infinite** | 2.28 × (2.25–2.32) **Element Plus** |
| Ascending: main thread, all tasks (lower is better) | 4003 ms (±101) | 3909 ms (±500) | 12005 ms (±532) | 1161 ms (±19.9) | 1576 ms (±27.5) | 0.39 × (0.38–0.40) **Infinite** | 0.40 × (0.33–0.43) **Infinite** | 0.13 × (0.12–0.13) **Infinite** | 1.36 × (1.32–1.39) **Element Plus** |
| Descending: main thread, all tasks (lower is better) | 4061 ms (±69.6) | 3564 ms (±93.3) | 12131 ms (±524) | 1158 ms (±76.8) | 1761 ms (±99.7) | 0.43 × (0.43–0.45) **Infinite** | 0.49 × (0.49–0.51) **Infinite** | 0.15 × (0.14–0.15) **Infinite** | 1.52 × (1.50–1.54) **Element Plus** |

## scroll-jump - 1,000,000 rows

Programmatic jumps to 10 far-away scroll positions (like dragging the scrollbar thumb). Measured from setting scrollTop to the end of the first frame committed with the first and last visible rows showing the right content, at the right position.

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Jump to rows painted (median of jumps) (lower is better) | 43.9 ms (±2.42) | 20.8 ms (±0.84) | 496 ms (±4.81) | 59.1 ms (±0.74) | 75.8 ms (±1.94) | 1.73 × (1.62–1.75) **AG Grid** | 3.64 × (3.40–3.72) **TanStack** | 0.15 × (0.15–0.16) **Infinite** | 1.28 × (1.25–1.30) **Element Plus** |
| Jump to rows painted (worst jump) (lower is better) | 171 ms (±23.1) | 95.6 ms (±12.7) | 883 ms (±22.7) | 120 ms (±5.47) | 132 ms (±5.13) | 0.77 × (0.68–0.82) **Infinite** | 1.38 × (1.15–1.48) **TanStack** | 0.15 × (0.14–0.16) **Infinite** | 1.10 × (1.04–1.16) **Element Plus** |
| Jump to settled (median of jumps) (lower is better) | 43.9 ms (±2.42) | 20.8 ms (±0.84) | 496 ms (±4.81) | 59.1 ms (±0.74) | 75.8 ms (±1.94) | 1.73 × (1.62–1.75) **AG Grid** | 3.64 × (3.40–3.72) **TanStack** | 0.15 × (0.15–0.16) **Infinite** | 1.28 × (1.25–1.30) **Element Plus** |
| Main thread, all tasks (all jumps) (lower is better) | 596 ms (±26.1) | 324 ms (±11.0) | 5662 ms (±36.6) | 837 ms (±8.73) | 1095 ms (±20.4) | 1.84 × (1.75–1.90) **AG Grid** | 3.38 × (3.23–3.48) **TanStack** | 0.19 × (0.19–0.19) **Infinite** | 1.31 × (1.29–1.33) **Element Plus** |

## scroll-vertical - 1,000,000 rows

Wheel-scroll down 24000px at 8000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 42.9 % (±0.43) | 46.1 % (±0.24) | 7.79 % (±0.04) | 41.3 % (±0.49) | 26.3 % (±0.74) | 0.61 × (0.61–0.62) **AG Grid** | 0.57 × (0.57–0.57) **TanStack** | 3.37 × (3.34–3.40) **Infinite** | 0.64 × (0.63–0.65) **Element Plus** |
| Frames presented without main-thread update (lower is better) | 42.1 % (±0.37) | 45.2 % (±0.25) | 75.2 % (±0.40) | 40.6 % (±0.49) | 72.8 % (±0.63) | 1.73 × (1.71–1.74) **AG Grid** | 1.61 × (1.59–1.61) **TanStack** | 0.97 × (0.96–0.97) **Infinite** | 1.79 × (1.77–1.80) **Element Plus** |
| Frames dropped (lower is better) | 15.0 % (±0.79) | 8.68 % (±0.49) | 17.0 % (±0.43) | 18.1 % (±0.98) | 0.94 % (±0.35) | 0.06 × (0.06–0.10) **Infinite** | 0.11 × (0.10–0.17) **Infinite** | 0.06 × (0.05–0.08) **Infinite** | 0.05 × (0.05–0.08) **Infinite** |
| Main thread frame rate (rAF) (higher is better) | 45.1 fps (±0.68) | 50.9 fps (±0.49) | 4.23 fps (±0.15) | 42.4 fps (±0.81) | 10.5 fps (±0.41) | 0.23 × (0.23–0.24) **AG Grid** | 0.21 × (0.20–0.21) **TanStack** | 2.48 × (2.46–2.50) **Infinite** | 0.25 × (0.24–0.26) **Element Plus** |
| p95 rAF frame interval (lower is better) | 83.3 ms (±14.0) | 16.8 ms (±0.03) | 642 ms (±16.9) | 50.0 ms (±3.15) | 147 ms (±56.6) | 1.76 × (1.66–1.84) **AG Grid** | 8.73 × (8.73–8.92) **TanStack** | 0.23 × (0.23–0.24) **Infinite** | 2.93 × (2.93–3.00) **Element Plus** |
| Worst rAF frame interval (lower is better) | 133 ms (±24.4) | 233 ms (±18.6) | 850 ms (±11.5) | 117 ms (±13.6) | 400 ms (±23.6) | 3.00 × (2.56–3.57) **AG Grid** | 1.72 × (1.64–1.92) **TanStack** | 0.47 × (0.44–0.49) **Infinite** | 3.43 × (2.87–4.17) **Element Plus** |
| rAF intervals > 25ms (lower is better) | 8.63 % (±0.79) | 3.18 % (±0.50) | 43.8 % (±3.41) | 28.2 % (±2.94) | 81.8 % (±1.43) | 9.48 × (9.20–10.6) **AG Grid** | 25.7 × (21.4–26.2) **TanStack** | 1.87 × (1.64–1.88) **PrimeVue** | 2.90 × (2.61–3.13) **Element Plus** |
| Long animation frames: total blocking (lower is better) | 347 ms (±20.0) | 270 ms (±19.4) | 3136 ms (±133) | 112 ms (±14.2) | 940 ms (±80.3) | 2.71 × (2.47–2.82) **AG Grid** | 3.48 × (3.21–3.71) **TanStack** | 0.30 × (0.29–0.33) **Infinite** | 8.39 × (7.28–8.96) **Element Plus** |
| Main thread: layout (lower is better) | 579 ms (±28.3) | 160 ms (±9.08) | 75.0 ms (±2.70) | 162 ms (±9.88) | 72.4 ms (±8.25) | 0.13 × (0.12–0.15) **Infinite** | 0.45 × (0.42–0.55) **Infinite** | 0.97 × (0.93–1.15) ≈ | 0.45 × (0.42–0.53) **Infinite** |
| Main thread: style recalc (lower is better) | 163 ms (±5.11) | 98.3 ms (±9.07) | 52.4 ms (±1.42) | 151 ms (±4.63) | 189 ms (±17.1) | 1.15 × (1.09–1.35) **AG Grid** | 1.92 × (1.77–2.24) **TanStack** | 3.60 × (3.41–4.15) **PrimeVue** | 1.25 × (1.19–1.51) **Element Plus** |
| Main thread: all tasks (lower is better) | 2359 ms (±20.8) | 1556 ms (±19.8) | 3618 ms (±15.7) | 3029 ms (±13.2) | 2622 ms (±39.7) | 1.11 × (1.10–1.13) **AG Grid** | 1.69 × (1.65–1.70) **TanStack** | 0.72 × (0.72–0.73) **Infinite** | 0.87 × (0.86–0.87) **Infinite** |

## scroll-horizontal - 1,000,000 rows

Wheel-scroll right/left over all columns, 4 sweeps at 4000px/s (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). Frame outcomes come from Chrome's compositor (PipelineReporter): "partial" = frame shown without the main thread's update, "dropped" = no new frame. rAF frame intervals and Long Animation Frames come from the page.

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Frames fully presented (higher is better) | 72.5 % (±4.08) | 75.5 % (±7.17) | 96.8 % (±0.77) | 49.8 % (±1.86) | 88.4 % (±0.88) | 1.22 × (1.16–1.26) **Infinite** | 1.17 × (1.09–1.37) **Infinite** | 0.91 × (0.89–0.92) **PrimeVue** | 1.78 × (1.71–1.82) **Infinite** |
| Frames presented without main-thread update (lower is better) | 26.0 % (±3.75) | 21.9 % (±6.66) | 3.23 % (±0.77) | 40.7 % (±2.05) | 9.29 % (±0.80) | 0.36 × (0.31–0.42) **Infinite** | 0.43 × (0.28–0.54) **Infinite** | 2.88 × (2.62–5.87) **PrimeVue** | 0.23 × (0.20–0.24) **Infinite** |
| Frames dropped (lower is better) | 1.21 % (±0.72) | 2.50 % (±0.62) | 0.00 % (±0.00) | 8.97 % (±0.68) | 3.11 % (±1.02) | 2.57 × (1.15–4.86) **AG Grid** | 1.24 × (0.80–2.21) ≈ | +3.11 (+2.22 to +3.52) **PrimeVue** | 0.35 × (0.23–0.39) **Infinite** |
| Main thread frame rate (rAF) (higher is better) | 60.0 fps (±0.26) | 60.0 fps (±0.38) | 60.0 fps (±0.00) | 52.8 fps (±0.59) | 50.8 fps (±1.12) | 0.85 × (0.84–0.87) **AG Grid** | 0.85 × (0.84–0.87) **TanStack** | 0.85 × (0.84–0.86) **PrimeVue** | 0.96 × (0.95–0.98) **Element Plus** |
| p95 rAF frame interval (lower is better) | 16.8 ms (±0.05) | 16.7 ms (±0.05) | 16.7 ms (±0.04) | 33.4 ms (±0.05) | 33.2 ms (±6.64) | 1.98 × (1.44–1.99) **AG Grid** | 1.99 × (1.44–1.99) **TanStack** | 1.99 × (1.44–1.99) **PrimeVue** | 1.00 × (0.73–1.00) ≈ |
| Worst rAF frame interval (lower is better) | 16.8 ms (±8.86) | 16.8 ms (±8.82) | 16.8 ms (±0.00) | 50.1 ms (±13.1) | 133 ms (±42.9) | 7.94 × (3.99–11.9) **AG Grid** | 7.94 × (4.00–11.9) **TanStack** | 7.94 × (7.93–11.9) **PrimeVue** | 2.66 × (2.00–3.99) **Element Plus** |
| rAF intervals > 25ms (lower is better) | 0.00 % (±0.43) | 0.00 % (±0.64) | 0.00 % (±0.00) | 9.32 % (±0.69) | 6.25 % (±1.29) | +6.25 (+4.54 to +7.27) **AG Grid** | +6.25 (+4.54 to +7.27) **TanStack** | +6.25 (+5.36 to +7.27) **PrimeVue** | 0.67 × (0.53–0.79) **Infinite** |
| Long animation frames: total blocking (lower is better) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 0.00 ms (±12.2) | 51.1 ms (±44.1) | +51.1 (0.00 to +81.9) ≈ | +51.1 (0.00 to +81.9) ≈ | +51.1 (0.00 to +81.9) ≈ | +51.1 (-0.46 to +81.9) ≈ |
| Main thread: layout (lower is better) | 88.4 ms (±9.54) | 55.2 ms (±3.52) | 0.00 ms (±0.00) | 0.00 ms (±0.00) | 32.6 ms (±5.68) | 0.37 × (0.29–0.40) **Infinite** | 0.59 × (0.48–0.64) **Infinite** | +32.6 (+29.0 to +35.1) **PrimeVue** | +32.6 (+29.0 to +35.1) **Element Plus** |
| Main thread: style recalc (lower is better) | 49.2 ms (±2.31) | 16.5 ms (±0.95) | 0.00 ms (±0.00) | 8.01 ms (±1.70) | 41.6 ms (±7.29) | 0.85 × (0.77–0.95) **Infinite** | 2.52 × (2.27–2.92) **TanStack** | +41.6 (+38.9 to +46.4) **PrimeVue** | 5.20 × (4.57–5.90) **Element Plus** |
| Main thread: all tasks (lower is better) | 602 ms (±39.8) | 536 ms (±32.4) | 30.0 ms (±3.45) | 1779 ms (±22.1) | 825 ms (±15.2) | 1.37 × (1.31–1.42) **AG Grid** | 1.54 × (1.43–1.62) **TanStack** | 27.5 × (23.4–28.5) **PrimeVue** | 0.46 × (0.45–0.47) **Infinite** |

## correctness-vertical - 1,000,000 rows

Same kind of vertical wheel gesture, faster (20000px/s). After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Blank samples (lower is better) | 11.8 % (±2.41) | 2.55 % (±1.39) | 0.00 % (±0.00) | 3.03 % (±0.78) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Frames with any blank/wrong sample (lower is better) | 22.0 % (±5.62) | 12.8 % (±6.97) | 0.00 % (±0.00) | 15.2 % (±3.92) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ | 0.00 × (0.00–0.00) **Infinite** |
| Worst frame: correct samples (higher is better) | 0.00 % (±0.00) | 80.0 % (±0.00) | 100 % (±0.00) | 80.0 % (±0.00) | 100 % (±0.00) | +100 (+100 to +100) **Infinite** | 1.25 × (1.25–1.25) **Infinite** | 1.00 × (1.00–1.00) ≈ | 1.25 × (1.25–1.25) **Infinite** |

## correctness-horizontal - 1,000,000 rows

Same kind of horizontal wheel gesture. After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: "blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Blank samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Wrong/stale samples (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Frames with any blank/wrong sample (lower is better) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ | 0.00 (0.00 to 0.00) ≈ |
| Worst frame: correct samples (higher is better) | 100 % (±0.00) | 100 % (±0.00) | 100 % (±0.00) | 100 % (±0.00) | 100 % (±0.00) | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ | 1.00 × (1.00–1.00) ≈ |

## visual-blank-vertical - 1,000,000 rows

Fast vertical wheel gesture (20000px/s) while recording what the compositor actually displays (CDP screencast). Each frame is checked for blank areas: vertical runs of the body with no text where rows should be. Unlike the correctness probe, this also catches the compositor scrolling ahead of the main thread. Screencast capture skips frames under load and adds overhead - compare the grids, not absolute numbers.

| Metric | AG Grid median (sd) | TanStack median (sd) | PrimeVue median (sd) | Element Plus median (sd) | Infinite median (sd) | Infinite vs AG Grid | Infinite vs TanStack | Infinite vs PrimeVue | Infinite vs Element Plus |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Captured frames with blank rows (lower is better) | 90.5 % (±0.47) | 58.6 % (±8.76) | 94.4 % (±1.51) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ |
| Blank body area (avg over frames) (lower is better) | 76.4 % (±2.01) | 27.5 % (±4.57) | 89.0 % (±0.85) | 0.00 % (±0.00) | 0.00 % (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ |
| Worst frame: blank rows (lower is better) | 18.0 rows (±0.00) | 18.0 rows (±0.00) | 18.0 rows (±0.00) | 0.00 rows (±0.00) | 0.00 rows (±0.00) | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 × (0.00–0.00) **Infinite** | 0.00 (0.00 to 0.00) ≈ |
| Captured frames (higher is better) | 21.0 (±0.98) | 26.0 (±1.11) | 57.0 (±4.26) | 19.0 (±0.49) | 40.0 (±2.34) | 1.90 × (1.76–2.00) **Infinite** | 1.54 × (1.37–1.54) **Infinite** | 0.70 × (0.65–0.74) **PrimeVue** | 2.11 × (1.95–2.22) **Infinite** |
