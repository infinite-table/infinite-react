type DevToolsColor =
  | 'primary'
  | 'primary-light'
  | 'primary-dark'
  | 'secondary'
  | 'secondary-light'
  | 'secondary-dark'
  | 'tertiary'
  | 'tertiary-light'
  | 'tertiary-dark'
  | 'error';

export type DevToolsMarkerDetails = {
  label: string;
  track: string;
  trackGroup?: string;
  color?: DevToolsColor;
  details?: { name: string; value: string | number | boolean }[];
  tooltip?: string;

  startTs?: DOMHighResTimeStamp;
  endTs?: DOMHighResTimeStamp;
};

// Utility type to check if an object has any required properties
type HasRequiredProps<T> = T extends Record<string, never>
  ? false
  : {
      [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
    }[keyof T] extends never
  ? false
  : true;

// Function overloads for end methods
type EndMethod<T extends Omit<DevToolsMarkerDetails, 'track' | 'label'>> =
  HasRequiredProps<T> extends true
    ? (markerDetails: T) => DevToolsMarker
    : (markerDetails?: T) => DevToolsMarker;

export interface PerfMarker {
  start(options?: { details?: DevToolsMarkerDetails['details'] }): PerfMarker;
  end(options?: { details?: DevToolsMarkerDetails['details'] }): PerfMarker;
}

export class DevToolsMarker implements PerfMarker {
  static create(debugId: string) {
    return new DevToolsMarker(debugId);
  }

  private markerDetails: DevToolsMarkerDetails = {
    label: '',
    track: '',
    trackGroup: undefined,
    color: undefined,
    details: [],
    tooltip: undefined,
  };

  private stopped = false;
  private constructor(public readonly debugId: string) {
    this.debugId = debugId;
  }

  start = (startDetails?: { details?: DevToolsMarkerDetails['details'] }) => {
    if (this.markerDetails.startTs) {
      return this;
    }
    const start = performance.now();

    this.markerDetails.details = startDetails?.details ?? [];
    this.markerDetails.startTs = start;

    return this;
  };

  public get startTimestamp() {
    return this.markerDetails.startTs;
  }

  get track() {
    const self = this as DevToolsMarker;

    return (
      Object.keys(DevToolsTracks) as (keyof typeof DevToolsTracks)[]
    ).reduce(
      <T extends keyof typeof DevToolsTracks>(acc: any, track: T) => {
        const trackObj = {
          start: self.start,
          end: (
            markerDetails: Omit<DevToolsMarkerDetails, 'track'> & {
              label: keyof (typeof DevToolsTracks)[T]['labels'];
            },
          ) => {
            return self.end({
              ...markerDetails,
              track: DevToolsTracks[track].track,
              label: markerDetails.label,
            });
          },
          get label() {
            const currentTrack = DevToolsTracks[track];
            return Object.keys(currentTrack.labels).reduce(
              (labelAcc, label) => {
                const labelObj = {
                  start: self.start,
                  end: (
                    markerDetails?: Omit<
                      DevToolsMarkerDetails,
                      'track' | 'label'
                    >,
                  ) => {
                    return self.end({
                      ...markerDetails,
                      track: currentTrack.track,
                      label:
                        currentTrack.labels[
                          label as keyof typeof currentTrack.labels
                        ],
                    });
                  },
                };
                Object.defineProperty(labelAcc, label, {
                  get: () => {
                    self.markerDetails.label =
                      currentTrack.labels[
                        label as keyof typeof currentTrack.labels
                      ];
                    return labelObj;
                  },
                });

                return labelAcc;
              },
              {} as Record<
                string,
                {
                  start: DevToolsMarker['start'];
                  end: EndMethod<
                    Omit<DevToolsMarkerDetails, 'track' | 'label'>
                  >;
                }
              >,
            );
          },
        };

        Object.defineProperty(acc, track, {
          get: () => {
            const currentTrack = DevToolsTracks[track];
            self.markerDetails.track = currentTrack.track;
            return trackObj;
          },
        });
        return acc;
      },
      {} as {
        [K in keyof typeof DevToolsTracks]: {
          start: DevToolsMarker['start'];
          end: (
            markerDetails: Omit<DevToolsMarkerDetails, 'track'> & {
              label: keyof (typeof DevToolsTracks)[K]['labels'];
            },
          ) => DevToolsMarker;
          label: {
            [L in keyof (typeof DevToolsTracks)[K]['labels']]: {
              end: EndMethod<Omit<DevToolsMarkerDetails, 'track' | 'label'>>;
              start: DevToolsMarker['start'];
            };
          };
        };
      },
    );
  }

  end = (markerDetails: Partial<DevToolsMarkerDetails> = {}) => {
    if (this.stopped) {
      return this;
    }
    this.stopped = true;
    const start = markerDetails.startTs ?? this.markerDetails.startTs;
    const end =
      markerDetails.endTs ?? this.markerDetails.endTs ?? performance.now();

    const color = markerDetails.color || this.markerDetails.color || 'primary';
    const trackGroup =
      markerDetails.trackGroup ||
      this.markerDetails.trackGroup ||
      `Infinite Table (${this.debugId})`;

    const details = [
      ...(this.markerDetails.details || []),
      ...(markerDetails.details || []),
    ];
    const tooltip = markerDetails.tooltip || this.markerDetails.tooltip;

    const label = markerDetails.label || this.markerDetails.label || 'Unknown';
    const track = markerDetails.track || this.markerDetails.track || 'Unknown';

    performance.measure(label, {
      start,
      end,
      detail: {
        devtools: {
          dataType: 'track-entry',
          trackGroup,
          track,
          color,
          properties:
            details.length > 0
              ? details.map((detail) => [detail.name, detail.value])
              : undefined,
          tooltipText: tooltip,
        },
      },
    });
    return this;
  };
}

export const DevToolsTracks = {
  DataSource: {
    track: 'DataSource',
    labels: {
      RemoteDataLoad: 'Remote data load',
      TreeUnfilteredTreePaths: 'Computing unfiltered tree paths',
      Filter: 'Filter',
      Sort: 'Sort',
      Group: 'Group',
      LazyGroup: 'Lazy group',
      Tree: 'Tree',
      FlattenTree: 'Flatten tree',
      Flatten: 'Flatten groups',
      PrepareData: 'Preparing data',
      ComputeSelectionCount: 'Computing selection count',
      ComputeSelectionCountLazy: 'Computing selection count (lazy)',
      PrepareRowInfo: 'Preparing row info array',
    },
  },
  InfiniteTable: {
    track: 'InfiniteTable',
    labels: {
      Render: 'Rendering',
    },
  },
  MatrixBrain: {
    track: 'Layout Computations',
    labels: {
      ComputeRenderRange: 'Computing render range',
    },
  },
} as const;

export function getMarker(debugId: string) {
  return DevToolsMarker.create(debugId);
}
