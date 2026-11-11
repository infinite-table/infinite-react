export type WorkerInMessage =
  | { type: 'rows'; rowCount: number }
  | { type: 'rate'; ticksPerSecond: number }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'focus'; ids: Int32Array };

export type WorkerOutMessage = {
  type: 'ticks';
  /** `count` ticks, TICK_STRIDE values each: id, price, cumulative volume. */
  buffer: Float64Array;
  count: number;
};
