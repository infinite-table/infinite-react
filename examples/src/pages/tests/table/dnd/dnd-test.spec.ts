import {
  ActiveDragSource,
  DragInteractionTarget,
  DragManager,
} from '@src/components/InfiniteTable/components/draggable/Dragger';
import { test, expect } from '@playwright/test';
import { Rectangle } from '@infinite-table/infinite-react/src/utils/pageGeometry/Rectangle';
import { PointCoords } from '@infinite-table/infinite-react/src/utils/pageGeometry/Point';

export default test.describe.parallel('DND', () => {
  test('should work for simple vertical list, no other interaction', () => {
    /**
     * list1
     *
     * +--- top: 0, left: 0 ----------+
     * |    item1                     |
     * +----bottom: 100, right: 50 ---+
     *
     * +--- top: 120, left: 0 --------+
     * |    item2                     |
     * +----bottom: 220, right: 50 ---+
     *
     * +--- top: 240, left: 0 --------+
     * |    item3                     |
     * +----bottom: 340, right: 50 ---+
     */

    const activeDragSource = new ActiveDragSource({
      listId: 'list1',
      // dragIndex: 0,
      dragItem: {
        id: 'item1',
        rect: Rectangle.from({
          top: 0,
          left: 0,
          height: 100,
          width: 50,
        }).toDOMRect(),
      },
    });

    const list1 = new DragInteractionTarget({
      orientation: 'vertical',
      listId: 'list1',
      listRectangle: Rectangle.from({
        top: 0,
        left: 0,
        height: 360,
        width: 50,
      }),
      draggableItems: [
        {
          id: 'item1',
          rect: Rectangle.from({
            top: 0,
            left: 0,
            height: 100,
            width: 50,
          }).toDOMRect(),
        },
        {
          id: 'item2',
          rect: Rectangle.from({
            top: 120,
            left: 0,
            height: 100,
            width: 50,
          }).toDOMRect(),
        },
        {
          id: 'item3',
          rect: Rectangle.from({
            top: 240,
            left: 0,
            height: 100,
            width: 50,
          }).toDOMRect(),
        },
      ],
    });

    const dragOperation = DragManager.startDrag(activeDragSource, {
      top: 10,
      left: 10,
    });

    DragManager.registerDragInteractionTarget(list1);

    let theOffsets: PointCoords[][] = [];
    list1.on('move', ({ offsetsForItems }) => {
      theOffsets.push(offsetsForItems);
    });

    dragOperation.move({
      top: 30,
      left: 10,
    });

    expect(theOffsets).toEqual([
      [
        { left: 0, top: 20 },
        { left: 0, top: 0 },
        { left: 0, top: 0 },
      ],
    ]);

    dragOperation.move({
      top: 70,
      left: 10,
    });

    expect(theOffsets.length).toEqual(2);

    expect(theOffsets[1]).toEqual([
      { left: 0, top: 60 },
      { left: 0, top: -100 },
      { left: 0, top: 0 },
    ]);

    dragOperation.move({
      top: 71,
      left: 10,
    });
    dragOperation.move({
      top: 72,
      left: 10,
    });
    // dragOperation.move({
    //   top: 69,
    //   left: 10,
    // });
    // dragOperation.move({
    //   top: 70,
    //   left: 10,
    // });

    expect(theOffsets[theOffsets.length - 1]).toEqual([
      { left: 0, top: 62 },
      { left: 0, top: -100 },
      { left: 0, top: 0 },
    ]);
  });
});
