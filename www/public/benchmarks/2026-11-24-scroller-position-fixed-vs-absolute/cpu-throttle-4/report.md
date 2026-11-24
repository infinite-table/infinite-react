# absolute vs fixed (baseline)

```json
{
  "runId": "throttle4-20261123-2231",
  "date": "2026-11-23T20:32:01.940Z",
  "chrome": "136.0.7103.25",
  "headless": false,
  "os": "Darwin 24.1.0 arm64",
  "cpu": "Apple M1 Pro × 10",
  "loadAverageAtStart": 3.57,
  "viewport": "1400×1000",
  "size": "300k",
  "cpuThrottle": 4,
  "runs": 15,
  "warmup": 1,
  "fixed": {
    "url": "http://localhost:5571/",
    "version": "10.2.0",
    ".InfiniteVirtualScrollContainer:position": "fixed"
  },
  "absolute": {
    "url": "http://localhost:5572/",
    "version": "10.2.0",
    ".InfiniteVirtualScrollContainer:position": "absolute"
  }
}
```

Medians ± standard deviation of 15 runs per build (after 1 warmup), alternating which build goes first. "×" is the ratio of the medians, absolute / fixed, with its 95% bootstrap interval; when the baseline median is 0 the difference of medians is shown instead. A build is named better only when the interval excludes no change.

## scroll-vertical

The wheel-scroll down 24000px at 8000px/s (Input.synthesizeScrollGesture), with light tracing: frame outcomes from the compositor (PipelineReporter), rAF intervals and Long Animation Frames from the page, main-thread time from CDP.

| metric | fixed (baseline) | absolute | absolute vs fixed (95% CI) | |
|---|---:|---:|---:|---|
| Frames fully presented | 66.4 % ± 0.6 % | 69.9 % ± 1.5 % | ×1.05 [1.04, 1.07] | **absolute better** |
| Frames presented without main-thread update | 33.6 % ± 0.6 % | 30.1 % ± 1.5 % | ×0.90 [0.86, 0.92] | **absolute better** |
| Frames dropped | 0.0 % ± 0.0 % | 0.0 % ± 0.1 % | 0.0 % [0.0 %, 0.0 %] | no significant difference |
| p95 rAF frame interval | 34.3 ms ± 0.1 ms | 34.2 ms ± 0.1 ms | ×1.00 [1.00, 1.00] | no significant difference |
| Worst rAF frame interval | 50.1 ms ± 0.5 ms | 50.1 ms ± 0.4 ms | ×1.00 [1.00, 1.00] | no significant difference |
| rAF intervals > 25ms | 89.7 % ± 3.5 % | 77.7 % ± 4.9 % | ×0.87 [0.83, 0.90] | **absolute better** |
| Long animation frames: total blocking | 0.0 ms ± 0.0 ms | 0.0 ms ± 0.0 ms | 0.0 ms [0.0 ms, 0.0 ms] | no significant difference |
| Main thread: scripting | 1196 ms ± 7.7 ms | 1216 ms ± 13.9 ms | ×1.02 [1.01, 1.03] | **fixed better** |
| Main thread: layout | 158 ms ± 2.4 ms | 157 ms ± 2.6 ms | ×0.99 [0.98, 1.01] | no significant difference |
| Main thread: style recalc | 382 ms ± 4.4 ms | 383 ms ± 4.7 ms | ×1.00 [0.99, 1.02] | no significant difference |
| Main thread: all tasks | 2410 ms ± 20.1 ms | 2375 ms ± 26.1 ms | ×0.99 [0.97, 1.00] | **absolute better** |

## scroll-vertical-cost

The same wheel-scroll down 24000px at 8000px/s, traced in detail (its own pass - the tracing overhead is the same for both builds, but it is kept out of the frame outcomes): busy time of every thread of the frame pipeline (top-level tasks, overlaps counted once) - renderer main, compositor, renderer workers, GPU main, viz - and the paint / raster work in it. With out-of-process raster (the default) the raster itself runs on the GPU process main thread.

| metric | fixed (baseline) | absolute | absolute vs fixed (95% CI) | |
|---|---:|---:|---:|---|
| All pipeline threads: busy | 3630 ms ± 41.8 ms | 3515 ms ± 18.2 ms | ×0.97 [0.96, 0.98] | **absolute better** |
| Renderer main thread: busy | 2648 ms ± 34.3 ms | 2526 ms ± 16.1 ms | ×0.95 [0.95, 0.96] | **absolute better** |
| Renderer compositor thread: busy | 228 ms ± 4.7 ms | 233 ms ± 1.5 ms | ×1.02 [1.01, 1.03] | **fixed better** |
| Renderer worker threads: busy (raster, GC, ...) | 240 ms ± 2.9 ms | 241 ms ± 4.0 ms | ×1.00 [0.99, 1.02] | no significant difference |
| GPU process main thread: busy | 409 ms ± 3.3 ms | 414 ms ± 2.4 ms | ×1.01 [1.00, 1.02] | **fixed better** |
| Viz compositor thread: busy | 100 ms ± 1.7 ms | 102 ms ± 1.0 ms | ×1.02 [1.01, 1.03] | **fixed better** |
| Main thread: Paint + PrePaint | 659 ms ± 19.8 ms | 233 ms ± 7.7 ms | ×0.35 [0.34, 0.36] | **absolute better** |
| Main thread: Paint events | 18027 ± 163 | 5867 ± 1 | ×0.33 [0.32, 0.33] | **absolute better** |
| Main thread: Layerize + Commit | 316 ms ± 6.5 ms | 315 ms ± 6.3 ms | ×1.00 [0.98, 1.02] | no significant difference |
| Renderer raster tasks | 88.8 ms ± 2.0 ms | 92.6 ms ± 1.2 ms | ×1.04 [1.02, 1.05] | **fixed better** |
| Renderer raster tasks: count | 11550 ± 0 | 11550 ± 0 | ×1.00 [1.00, 1.00] | no significant difference |
| GPU process: raster (DoEndRasterCHROMIUM) | 166 ms ± 1.9 ms | 169 ms ± 1.1 ms | ×1.02 [1.01, 1.03] | **fixed better** |

## scroll-horizontal

The wheel-scroll right/left over all columns, 4 sweeps at 4000px/s (Input.synthesizeScrollGesture), with light tracing: frame outcomes from the compositor (PipelineReporter), rAF intervals and Long Animation Frames from the page, main-thread time from CDP.

| metric | fixed (baseline) | absolute | absolute vs fixed (95% CI) | |
|---|---:|---:|---:|---|
| Frames fully presented | 81.5 % ± 6.9 % | 85.0 % ± 7.0 % | ×1.04 [1.00, 1.10] | **absolute better** |
| Frames presented without main-thread update | 18.5 % ± 6.9 % | 15.0 % ± 7.0 % | ×0.81 [0.58, 0.99] | **absolute better** |
| Frames dropped | 0.0 % ± 0.1 % | 0.0 % ± 0.0 % | 0.0 % [0.0 %, 0.0 %] | no significant difference |
| p95 rAF frame interval | 18.2 ms ± 0.2 ms | 18.1 ms ± 0.2 ms | ×1.00 [0.99, 1.01] | no significant difference |
| Worst rAF frame interval | 18.6 ms ± 0.1 ms | 18.6 ms ± 0.1 ms | ×1.00 [0.99, 1.01] | no significant difference |
| rAF intervals > 25ms | 0.0 % ± 0.0 % | 0.0 % ± 0.0 % | 0.0 % [0.0 %, 0.0 %] | no significant difference |
| Long animation frames: total blocking | 0.0 ms ± 0.0 ms | 0.0 ms ± 0.0 ms | 0.0 ms [0.0 ms, 0.0 ms] | no significant difference |
| Main thread: scripting | 355 ms ± 5.1 ms | 357 ms ± 6.7 ms | ×1.01 [0.98, 1.02] | no significant difference |
| Main thread: layout | 31.7 ms ± 1.9 ms | 32.8 ms ± 2.2 ms | ×1.04 [0.98, 1.08] | no significant difference |
| Main thread: style recalc | 128 ms ± 2.5 ms | 125 ms ± 3.6 ms | ×0.98 [0.97, 1.00] | no significant difference |
| Main thread: all tasks | 943 ms ± 10.7 ms | 916 ms ± 10.1 ms | ×0.97 [0.96, 0.98] | **absolute better** |

## scroll-horizontal-cost

The same wheel-scroll right/left over all columns, 4 sweeps at 4000px/s, traced in detail (its own pass - the tracing overhead is the same for both builds, but it is kept out of the frame outcomes): busy time of every thread of the frame pipeline (top-level tasks, overlaps counted once) - renderer main, compositor, renderer workers, GPU main, viz - and the paint / raster work in it. With out-of-process raster (the default) the raster itself runs on the GPU process main thread.

| metric | fixed (baseline) | absolute | absolute vs fixed (95% CI) | |
|---|---:|---:|---:|---|
| All pipeline threads: busy | 1492 ms ± 38.5 ms | 1462 ms ± 43.9 ms | ×0.98 [0.97, 0.99] | **absolute better** |
| Renderer main thread: busy | 1083 ms ± 27.4 ms | 1057 ms ± 33.4 ms | ×0.98 [0.96, 0.98] | **absolute better** |
| Renderer compositor thread: busy | 124 ms ± 4.0 ms | 123 ms ± 4.6 ms | ×0.99 [0.97, 1.00] | no significant difference |
| Renderer worker threads: busy (raster, GC, ...) | 85.7 ms ± 2.8 ms | 85.0 ms ± 2.5 ms | ×0.99 [0.97, 1.03] | no significant difference |
| GPU process main thread: busy | 135 ms ± 4.4 ms | 134 ms ± 3.8 ms | ×0.99 [0.97, 1.01] | no significant difference |
| Viz compositor thread: busy | 61.7 ms ± 2.1 ms | 61.5 ms ± 2.0 ms | ×1.00 [0.98, 1.01] | no significant difference |
| Main thread: Paint + PrePaint | 107 ms ± 6.9 ms | 81.0 ms ± 5.7 ms | ×0.75 [0.70, 0.78] | **absolute better** |
| Main thread: Paint events | 1731 ± 1 | 891 ± 3 | ×0.51 [0.51, 0.51] | **absolute better** |
| Main thread: Layerize + Commit | 301 ms ± 5.5 ms | 301 ms ± 4.9 ms | ×1.00 [0.98, 1.02] | no significant difference |
| Renderer raster tasks | 15.5 ms ± 0.7 ms | 15.6 ms ± 1.0 ms | ×1.01 [0.98, 1.06] | no significant difference |
| Renderer raster tasks: count | 1708 ± 0 | 1708 ± 5 | ×1.00 [1.00, 1.00] | no significant difference |
| GPU process: raster (DoEndRasterCHROMIUM) | 30.6 ms ± 0.6 ms | 31.1 ms ± 0.8 ms | ×1.01 [0.99, 1.02] | no significant difference |