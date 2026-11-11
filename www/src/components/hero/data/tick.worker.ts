/// <reference lib="webworker" />
/**
 * Tick generator. Runs the market simulation off the main thread and posts
 * compact, transferable batches (~every 16ms) at the requested rate.
 */
import { TickSimulator, TICK_STRIDE } from './sim';
import type { WorkerInMessage, WorkerOutMessage } from './protocol';

declare const self: DedicatedWorkerGlobalScope;

const sim = new TickSimulator();
let rowCount = 0;
let ticksPerSecond = 1000;
let paused = true;
let carry = 0;
let last = performance.now();
/** On-screen rows we try to keep lively (ticks per visible row per second). */
const VISIBLE_TICKS_PER_ROW = 1.6;

function visibleShare(focusCount: number) {
  if (!focusCount || !rowCount || !ticksPerSecond) return 0;
  const uniformOnVisible = (ticksPerSecond * focusCount) / rowCount;
  const wanted = focusCount * VISIBLE_TICKS_PER_ROW;
  const extra = Math.max(0, wanted - uniformOnVisible);
  return Math.min(0.6, extra / ticksPerSecond);
}

let focusCount = 0;

function loop() {
  const now = performance.now();
  const elapsed = Math.min(250, now - last);
  last = now;
  if (paused || !rowCount) {
    carry = 0;
    return;
  }
  sim.stepFactors();
  const due = (ticksPerSecond * elapsed) / 1000 + carry;
  const count = Math.floor(due);
  carry = due - count;
  if (!count) return;
  const buffer = new Float64Array(count * TICK_STRIDE);
  sim.generate(count, rowCount, visibleShare(focusCount), buffer);
  const message: WorkerOutMessage = { type: 'ticks', buffer, count };
  self.postMessage(message, [buffer.buffer]);
}

self.onmessage = (event: MessageEvent<WorkerInMessage>) => {
  const message = event.data;
  switch (message.type) {
    case 'rows':
      sim.ensure(message.rowCount);
      rowCount = message.rowCount;
      break;
    case 'rate':
      ticksPerSecond = Math.max(0, message.ticksPerSecond);
      break;
    case 'pause':
      paused = true;
      break;
    case 'resume':
      paused = false;
      last = performance.now();
      break;
    case 'focus':
      sim.setFocus(message.ids);
      focusCount = message.ids.length;
      break;
  }
};

setInterval(loop, 16);
