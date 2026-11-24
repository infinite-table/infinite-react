# absolute vs fixed (baseline)

```json
{
  "runId": "fixed-vs-absolute-20261123-2143",
  "date": "2026-11-23T19:43:43.483Z",
  "chrome": "136.0.7103.25",
  "headless": false,
  "os": "Darwin 24.1.0 arm64",
  "cpu": "Apple M1 Pro × 10",
  "loadAverageAtStart": 3.25,
  "viewport": "1400×1000",
  "size": "300k",
  "cpuThrottle": 1,
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
| Frames fully presented | 50.8 % ± 1.8 % | 50.8 % ± 1.8 % | ×1.00 [0.99, 1.00] | no significant difference |
| Frames presented without main-thread update | 49.2 % ± 1.8 % | 49.2 % ± 1.8 % | ×1.00 [1.00, 1.01] | no significant difference |
| Frames dropped | 0.0 % ± 0.0 % | 0.0 % ± 0.0 % | 0.0 % [0.0 %, 0.0 %] | no significant difference |
| p95 rAF frame interval | 17.1 ms ± 0.2 ms | 17.1 ms ± 0.2 ms | ×1.00 [0.98, 1.01] | no significant difference |
| Worst rAF frame interval | 17.6 ms ± 0.1 ms | 17.6 ms ± 0.1 ms | ×1.00 [0.99, 1.01] | no significant difference |
| rAF intervals > 25ms | 0.0 % ± 0.0 % | 0.0 % ± 0.0 % | 0.0 % [0.0 %, 0.0 %] | no significant difference |
| Long animation frames: total blocking | 0.0 ms ± 0.0 ms | 0.0 ms ± 0.0 ms | 0.0 ms [0.0 ms, 0.0 ms] | no significant difference |
| Main thread: scripting | 386 ms ± 5.0 ms | 394 ms ± 4.4 ms | ×1.02 [1.01, 1.03] | **fixed better** |
| Main thread: layout | 52.4 ms ± 0.5 ms | 53.1 ms ± 0.6 ms | ×1.01 [1.00, 1.02] | **fixed better** |
| Main thread: style recalc | 127 ms ± 2.0 ms | 129 ms ± 2.1 ms | ×1.01 [1.00, 1.03] | **fixed better** |
| Main thread: all tasks | 923 ms ± 13.4 ms | 880 ms ± 11.1 ms | ×0.95 [0.94, 0.96] | **absolute better** |

## scroll-vertical-cost

The same wheel-scroll down 24000px at 8000px/s, traced in detail (its own pass - the tracing overhead is the same for both builds, but it is kept out of the frame outcomes): busy time of every thread of the frame pipeline (top-level tasks, overlaps counted once) - renderer main, compositor, renderer workers, GPU main, viz - and the paint / raster work in it. With out-of-process raster (the default) the raster itself runs on the GPU process main thread.

| metric | fixed (baseline) | absolute | absolute vs fixed (95% CI) | |
|---|---:|---:|---:|---|
| All pipeline threads: busy | 2107 ms ± 25.6 ms | 2036 ms ± 57.1 ms | ×0.97 [0.96, 0.98] | **absolute better** |
| Renderer main thread: busy | 1015 ms ± 12.7 ms | 935 ms ± 17.9 ms | ×0.92 [0.92, 0.93] | **absolute better** |
| Renderer compositor thread: busy | 290 ms ± 4.9 ms | 293 ms ± 10.5 ms | ×1.01 [1.00, 1.02] | no significant difference |
| Renderer worker threads: busy (raster, GC, ...) | 248 ms ± 9.9 ms | 248 ms ± 7.2 ms | ×1.00 [0.99, 1.01] | no significant difference |
| GPU process main thread: busy | 444 ms ± 5.2 ms | 446 ms ± 17.6 ms | ×1.01 [0.99, 1.02] | no significant difference |
| Viz compositor thread: busy | 111 ms ± 1.4 ms | 113 ms ± 6.4 ms | ×1.02 [1.00, 1.03] | **fixed better** |
| Main thread: Paint + PrePaint | 336 ms ± 5.6 ms | 80.7 ms ± 2.8 ms | ×0.24 [0.24, 0.24] | **absolute better** |
| Main thread: Paint events | 36572 ± 101 | 5957 ± 1 | ×0.16 [0.16, 0.16] | **absolute better** |
| Main thread: Layerize + Commit | 160 ms ± 2.2 ms | 159 ms ± 3.4 ms | ×0.99 [0.98, 1.01] | no significant difference |
| Renderer raster tasks | 100 ms ± 1.8 ms | 100 ms ± 3.9 ms | ×1.00 [0.99, 1.03] | no significant difference |
| Renderer raster tasks: count | 11550 ± 0 | 11550 ± 0 | ×1.00 [1.00, 1.00] | no significant difference |
| GPU process: raster (DoEndRasterCHROMIUM) | 190 ms ± 2.8 ms | 189 ms ± 2.1 ms | ×1.00 [0.99, 1.02] | no significant difference |

## scroll-horizontal

The wheel-scroll right/left over all columns, 4 sweeps at 4000px/s (Input.synthesizeScrollGesture), with light tracing: frame outcomes from the compositor (PipelineReporter), rAF intervals and Long Animation Frames from the page, main-thread time from CDP.

| metric | fixed (baseline) | absolute | absolute vs fixed (95% CI) | |
|---|---:|---:|---:|---|
| Frames fully presented | 81.5 % ± 6.7 % | 81.6 % ± 8.8 % | ×1.00 [0.97, 1.23] | no significant difference |
| Frames presented without main-thread update | 18.5 % ± 6.7 % | 18.4 % ± 8.8 % | ×0.99 [0.00, 1.17] | no significant difference |
| Frames dropped | 0.0 % ± 0.0 % | 0.0 % ± 0.0 % | 0.0 % [0.0 %, 0.0 %] | no significant difference |
| p95 rAF frame interval | 17.2 ms ± 0.2 ms | 17.1 ms ± 0.2 ms | ×0.99 [0.99, 1.02] | no significant difference |
| Worst rAF frame interval | 17.7 ms ± 0.1 ms | 17.6 ms ± 0.1 ms | ×0.99 [0.99, 1.01] | no significant difference |
| rAF intervals > 25ms | 0.0 % ± 0.0 % | 0.0 % ± 0.0 % | 0.0 % [0.0 %, 0.0 %] | no significant difference |
| Long animation frames: total blocking | 0.0 ms ± 0.0 ms | 0.0 ms ± 0.0 ms | 0.0 ms [0.0 ms, 0.0 ms] | no significant difference |
| Main thread: scripting | 117 ms ± 3.7 ms | 120 ms ± 4.1 ms | ×1.03 [0.99, 1.05] | no significant difference |
| Main thread: layout | 9.8 ms ± 0.3 ms | 9.7 ms ± 0.3 ms | ×0.99 [0.99, 1.03] | no significant difference |
| Main thread: style recalc | 42.9 ms ± 1.2 ms | 43.2 ms ± 1.5 ms | ×1.01 [0.98, 1.04] | no significant difference |
| Main thread: all tasks | 348 ms ± 11.8 ms | 349 ms ± 9.4 ms | ×1.00 [0.97, 1.04] | no significant difference |

## scroll-horizontal-cost

The same wheel-scroll right/left over all columns, 4 sweeps at 4000px/s, traced in detail (its own pass - the tracing overhead is the same for both builds, but it is kept out of the frame outcomes): busy time of every thread of the frame pipeline (top-level tasks, overlaps counted once) - renderer main, compositor, renderer workers, GPU main, viz - and the paint / raster work in it. With out-of-process raster (the default) the raster itself runs on the GPU process main thread.

| metric | fixed (baseline) | absolute | absolute vs fixed (95% CI) | |
|---|---:|---:|---:|---|
| All pipeline threads: busy | 885 ms ± 24.3 ms | 891 ms ± 16.2 ms | ×1.01 [0.98, 1.03] | no significant difference |
| Renderer main thread: busy | 380 ms ± 12.3 ms | 378 ms ± 10.6 ms | ×1.00 [0.97, 1.02] | no significant difference |
| Renderer compositor thread: busy | 158 ms ± 3.5 ms | 158 ms ± 3.7 ms | ×1.00 [0.98, 1.02] | no significant difference |
| Renderer worker threads: busy (raster, GC, ...) | 117 ms ± 11.5 ms | 118 ms ± 2.9 ms | ×1.01 [0.99, 1.21] | no significant difference |
| GPU process main thread: busy | 158 ms ± 3.0 ms | 159 ms ± 3.2 ms | ×1.00 [0.98, 1.02] | no significant difference |
| Viz compositor thread: busy | 78.3 ms ± 1.6 ms | 78.2 ms ± 2.1 ms | ×1.00 [0.98, 1.02] | no significant difference |
| Main thread: Paint + PrePaint | 33.6 ms ± 0.6 ms | 25.5 ms ± 0.7 ms | ×0.76 [0.75, 0.77] | **absolute better** |
| Main thread: Paint events | 1731 ± 0 | 891 ± 0 | ×0.51 [0.51, 0.52] | **absolute better** |
| Main thread: Layerize + Commit | 104 ms ± 2.8 ms | 103 ms ± 4.7 ms | ×0.99 [0.97, 1.04] | no significant difference |
| Renderer raster tasks | 18.6 ms ± 0.9 ms | 18.7 ms ± 2.4 ms | ×1.01 [0.97, 1.06] | no significant difference |
| Renderer raster tasks: count | 1708 ± 0 | 1708 ± 0 | ×1.00 [1.00, 1.00] | no significant difference |
| GPU process: raster (DoEndRasterCHROMIUM) | 35.8 ms ± 1.3 ms | 36.5 ms ± 0.8 ms | ×1.02 [0.98, 1.04] | no significant difference |