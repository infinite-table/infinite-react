import { debug } from '../../../utils/debugPackage';
export type DataQuerySnapshot = {
  state: 'idle' | 'loading' | 'success' | 'error';
  result: any;
  error: any;
  done: boolean;
  doneAt: number;
  promise?: Promise<DataQuery>;
};

const logger = debug('InfiniteTable:DataQuery');

export class DataQuery {
  private state: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  private result: any = undefined;
  private error: any = undefined;
  private doneAt: number = 0;

  private pendingPromise: Promise<any> | undefined = undefined;

  public debugName: string = '';

  constructor(debugName?: string) {
    this.debugName = debugName || '';
  }

  fetch = async (loadFn: DataQueryFn, ...key: DataQueryKey[]) => {
    this.state = 'loading';
    let resolvePending: (v: any) => void = () => {};

    try {
      logger(`Fetching query ${this.debugName}...`);
      this.pendingPromise = new Promise((resolve) => {
        resolvePending = resolve;
      });
      this.result = await loadFn(...key);
      this.state = 'success';

      // only resolve when state and result have been set
    } catch (error) {
      this.result = undefined;
      this.error = error;
      this.state = 'error';
    }
    this.doneAt = Date.now();

    this.pendingPromise = undefined;
    resolvePending(this);

    logger(`Fetched query ${this.debugName}. State: ${this.state}.`);

    return this.getDoneSnapshot();
  };

  getCurrentSnapshot = (): DataQuerySnapshot => {
    const result: DataQuerySnapshot = {
      state: this.state,
      result: this.result,
      doneAt: this.doneAt,
      error: this.error,
      done: this.isDone(),
    };

    if (!result.done) {
      result.promise = this.pendingPromise;
    }

    return result;
  };

  getDoneSnapshot = async (): Promise<DataQuerySnapshot> => {
    if (this.state === 'idle') {
      throw new Error('DataQuery is still idle');
    }

    if (this.pendingPromise) {
      await this.pendingPromise;
    }

    return {
      state: this.state,
      result: this.result,
      error: this.error,
      done: this.isDone(),
      doneAt: this.doneAt,
    };
  };

  getResult = () => {
    if (!this.isDone()) {
      throw new Error('DataQuery is not done yet');
    }
    return this.result;
  };

  isDone = () => this.state === 'success' || this.state === 'error';
  isSuccess = () => this.state === 'success';
}

export type DataQueryKey =
  | string
  | number
  | boolean
  | null
  | symbol
  | {
      [key: string]: DataQueryKey | undefined;
    }
  | Array<DataQueryKey>;

export type DataQueryKeyStringified =
  | string
  | number
  | boolean
  | null
  | symbol
  | Array<DataQueryKeyStringified>;

export type DataQueryFn = (...key: DataQueryKey[]) => Promise<any>;
