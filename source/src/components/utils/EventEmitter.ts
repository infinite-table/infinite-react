type EventHandler<T extends (...args: any[]) => void> = T;

export class EventEmitter<
  Events extends Record<string, (...args: any[]) => void>,
> {
  private listeners: { [K in keyof Events]?: EventHandler<Events[K]>[] } = {};

  constructor(listeners?: { [K in keyof Events]?: EventHandler<Events[K]> }) {
    if (listeners) {
      Object.keys(listeners).forEach((event) => {
        this.on(event as keyof Events, listeners![event as keyof Events]!);
      });
    }
  }

  on<K extends keyof Events>(
    event: K,
    handler: EventHandler<Events[K]>,
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(handler);
    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  once<K extends keyof Events>(
    event: K,
    handler: EventHandler<Events[K]>,
  ): () => void {
    const onceHandler = ((...args: Parameters<Events[K]>) => {
      this.off(event, onceHandler);
      handler(...args);
    }) as EventHandler<Events[K]>;

    return this.on(event, onceHandler);
  }

  off<K extends keyof Events>(
    event: K,
    handler: EventHandler<Events[K]>,
  ): void {
    const handlers = this.listeners[event];
    if (!handlers) return;
    const idx = handlers.indexOf(handler);
    if (idx !== -1) {
      handlers.splice(idx, 1);
    }
  }

  emit<K extends keyof Events>(
    event: K,
    ...payload: Parameters<Events[K]>
  ): void {
    const handlers = this.listeners[event];
    if (handlers) {
      handlers.slice().forEach((handler: EventHandler<Events[K]>) => {
        try {
          handler(...payload);
        } catch (e) {
          // Optionally log or handle error

          console.error(
            `Error in event handler for event '${String(event)}':`,
            e,
          );
        }
      });
    }
  }

  clear<K extends keyof Events>(event: K): void {
    if (this.listeners[event]) {
      this.listeners[event] = [];
    }
  }

  clearAll(): void {
    Object.keys(this.listeners).forEach((event) => {
      this.listeners[event as keyof Events] = [];
    });
  }
}
