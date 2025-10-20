export type PerfMarkerDetails = {
  name: string;
  value: string | number | boolean;
}[];

export interface PerfMarker {
  start(options?: { details?: PerfMarkerDetails }): PerfMarker;
  end(options?: { details?: PerfMarkerDetails }): PerfMarker;
}
