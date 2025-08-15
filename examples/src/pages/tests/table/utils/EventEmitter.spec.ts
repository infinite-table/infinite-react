import { EventEmitter } from '@src/components/utils/EventEmitter';
import { test, expect } from '@playwright/test';

export default test.describe.parallel('EventEmitter', () => {
  test('should accept listeners in constructor', () => {
    type TypeEvents = {
      start: () => void;
      move: (options: { source: string; target: string }) => void;
      end: () => void;
    };

    class DragOperation extends EventEmitter<TypeEvents> {
      constructor(options: { listeners?: Partial<TypeEvents> }) {
        super(options.listeners);
      }
    }
    let counter: Record<
      string,
      {
        count: number;
        args: any[];
      }
    > = {
      start: {
        count: 0,
        args: [],
      },
      move: {
        count: 0,
        args: [],
      },
      end: {
        count: 0,
        args: [],
      },
    };

    const move = (...args: any[]) => {
      counter.move.count++;
      counter.move.args.push(...args);
    };

    const dragOperation = new DragOperation({
      listeners: {
        start: () => {
          counter.start.count++;
        },
        move,
      },
    });

    dragOperation.emit('start');
    dragOperation.emit('move', { source: 's', target: 't' });
    dragOperation.emit('end');

    expect(counter.start.count).toBe(1);
    expect(counter.move.count).toBe(1);
    expect(counter.end.count).toBe(0);

    dragOperation.off('move', move);

    dragOperation.emit('move', { source: 's', target: 't' });

    dragOperation.on('end', () => {
      counter.end.count++;
    });

    dragOperation.emit('end');

    expect(counter.end.count).toBe(1);
  });
  test('should work fine', () => {
    class DragOperation extends EventEmitter<{
      onDragStart: () => void;
      onDragMove: (options: { source: string; target: string }) => void;
      onDragEnd: () => void;
    }> {}

    const dragOperation = new DragOperation();

    let counter: Record<
      string,
      {
        count: number;
        args: any[];
      }
    > = {
      start: {
        count: 0,
        args: [],
      },
      move: {
        count: 0,
        args: [],
      },
      end: {
        count: 0,
        args: [],
      },
    };

    dragOperation.on('onDragStart', (...args) => {
      counter.start.count++;
      counter.start.args.push(args);
    });

    const removeDragMove = dragOperation.on('onDragMove', (...args) => {
      counter.move.count++;

      counter.move.args.push(args);
    });

    dragOperation.emit('onDragStart');
    dragOperation.emit('onDragStart');
    dragOperation.emit('onDragMove', {
      source: 's',
      target: 't',
    });

    removeDragMove();
    dragOperation.emit('onDragMove', {
      source: 's',
      target: 't',
    });
    dragOperation.emit('onDragMove', {
      source: 's',
      target: 't',
    });

    expect(counter.start.count).toBe(2);
    expect(counter.move.count).toBe(1);

    expect(counter.start.args).toEqual([[], []]);
    expect(counter.move.args).toEqual([[{ source: 's', target: 't' }]]);
  });
});
