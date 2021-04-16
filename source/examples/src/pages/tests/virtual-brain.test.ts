import { OnScrollFn } from '@src/components/types/ScrollPosition';
import {
  OnRenderRangeChangeFn,
  VirtualBrain,
} from '@src/components/VirtualBrain';

export default describe('VirtualBrain', () => {
  it('should correctly trigger onRenderCountChange and onRenderRange change when scrolling and chainging available size', async () => {
    const brain = new VirtualBrain({
      count: 10,
      itemSize: 50,
      mainAxis: 'vertical',
    });

    const onRenderCountChange: (count: number) => void = jest.fn();
    const onRenderRangeChange: OnRenderRangeChangeFn = jest.fn();
    const onScroll: OnScrollFn = jest.fn();

    brain.onRenderCountChange(onRenderCountChange);
    brain.onRenderRangeChange(onRenderRangeChange);
    brain.onScroll(onScroll);

    brain.setAvailableSize({
      height: 120,
      width: 100,
    });
    await page.waitForTimeout(5);

    expect(onRenderRangeChange).toHaveBeenCalledTimes(1);
    expect(onRenderRangeChange).toHaveBeenCalledWith({
      renderStartIndex: 0,
      renderEndIndex: 3,
    });

    expect(onRenderCountChange).toHaveBeenCalledTimes(1);
    expect(onRenderCountChange).toHaveBeenCalledWith(4);
    expect(onScroll).toHaveBeenCalledTimes(0);

    // scroll down a bit, but not too much so the render range stays the same
    brain.setScrollPosition({
      scrollTop: 10,
      scrollLeft: 0,
    });
    await page.waitForTimeout(5);

    expect(onRenderRangeChange).toHaveBeenCalledTimes(1);
    expect(onRenderCountChange).toHaveBeenCalledTimes(1);
    expect(onScroll).toHaveBeenCalledTimes(1);

    // scroll down to trigger render range change
    brain.setScrollPosition({
      scrollTop: 50,
      scrollLeft: 0,
    });
    await page.waitForTimeout(5);

    expect(onRenderRangeChange).toHaveBeenCalledTimes(2);
    expect(onRenderRangeChange).toHaveBeenCalledWith({
      renderStartIndex: 1,
      renderEndIndex: 4,
    });
    expect(onRenderCountChange).toHaveBeenCalledTimes(1);

    // now set a new size
    brain.setAvailableSize({
      height: 210,
      width: 100,
    });
    await page.waitForTimeout(5);

    // and expect render range and render count to have changed
    expect(onRenderRangeChange).toHaveBeenCalledTimes(3);
    expect(onRenderRangeChange).toHaveBeenCalledWith({
      renderStartIndex: 1,
      renderEndIndex: 6,
    });
    expect(onRenderCountChange).toHaveBeenCalledTimes(2);
    expect(onRenderCountChange).toHaveBeenCalledWith(6);
  });

  it('should correctly trigger onRenderRangeChange when count gets smaller than the max render range', async () => {
    const onRenderCountChange: (count: number) => void = jest.fn();
    const onRenderRangeChange: OnRenderRangeChangeFn = jest.fn();
    const onScroll: OnScrollFn = jest.fn();

    const brain = new VirtualBrain({
      count: 10,
      itemSize: 50,
      mainAxis: 'vertical',
    });

    brain.onRenderCountChange(onRenderCountChange);
    brain.onRenderRangeChange(onRenderRangeChange);
    brain.onScroll(onScroll);

    brain.setAvailableSize({
      height: 120,
      width: 100,
    });
    await page.waitForTimeout(5);

    expect(brain.getRenderRange()).toEqual({
      renderStartIndex: 0,
      renderEndIndex: 3,
    });

    expect(onRenderRangeChange).toHaveBeenCalledTimes(1);
    expect(onRenderCountChange).toHaveBeenCalledTimes(1);
    expect(onRenderCountChange).toHaveBeenCalledWith(4);

    brain.update(2, 50);
    await page.waitForTimeout(5);

    expect(brain.getRenderRange()).toEqual({
      renderStartIndex: 0,
      renderEndIndex: 1,
    });

    expect(onScroll).toHaveBeenCalledTimes(0);
    expect(onRenderRangeChange).toHaveBeenCalledTimes(2);
    expect(onRenderRangeChange).toHaveBeenCalledWith({
      renderStartIndex: 0,
      renderEndIndex: 1,
    });
    expect(onRenderCountChange).toHaveBeenCalledTimes(2);
    expect(onRenderCountChange).toHaveBeenCalledWith(2);

    brain.update(20, 10);
    await page.waitForTimeout(5);

    expect(brain.getRenderCount()).toEqual(13);
    expect(onRenderRangeChange).toHaveBeenCalledWith({
      renderStartIndex: 0,
      renderEndIndex: 12,
    });
  });
  it('should work correctly when itemMainSize is number', () => {
    const brain: VirtualBrain = new VirtualBrain({
      itemSize: 5,
      mainAxis: 'vertical',
      count: 5,
    }) as VirtualBrain;

    expect(brain.getItemAt(1)).toEqual(0);
    expect(brain.getItemAt(4)).toEqual(0);
    expect(brain.getItemAt(5)).toEqual(1);
    expect(brain.getItemAt(24)).toEqual(4);

    // beyond max scroll position
    expect(brain.getItemAt(25)).toEqual(4);
  });

  it('getItemOffset should work correctly when itemMainSize is a function', () => {
    const sizes: Record<number, number> = {
      0: 5,
      1: 7,
      2: 10,
      3: 7,
      4: 9,
    };
    /**
     *   INDEX | START POS  | END POS | LENGTH
     *   -------------------------------------
     *      0  |     0      |    4    |   5
     *      1  |     5      |    11   |   7
     *      2  |     12     |    21   |  10
     *      3  |     22     |    28   |   7
     *      4  |     29     |    37   |   9
     */
    const brain: VirtualBrain = new VirtualBrain({
      itemSize: (itemIndex: number) => {
        return sizes[itemIndex];
      },
      mainAxis: 'vertical',
      count: 5,
    }) as VirtualBrain;

    // item 4
    expect(brain.getItemOffsetFor(1)).toEqual(5);
    expect(brain.getItemOffsetFor(4)).toEqual(29);
    expect(brain.getItemOffsetFor(3)).toEqual(22);
  });

  it('render count should work correctly when itemMainSize is a function', () => {
    const sizes: Record<number, number> = {
      0: 5,
      1: 7,
      2: 10,
      3: 7,
      4: 9,
    };
    /**
     *   INDEX | START POS  | END POS | LENGTH
     *   -------------------------------------
     *      0  |     0      |    4    |   5
     *      1  |     5      |    11   |   7
     *      2  |     12     |    21   |  10
     *      3  |     22     |    28   |   7
     *      4  |     29     |    37   |   9
     */
    const brain: VirtualBrain = new VirtualBrain({
      itemSize: (itemIndex: number) => {
        return sizes[itemIndex];
      },
      mainAxis: 'vertical',
      count: 5,
    }) as VirtualBrain;

    brain.setAvailableSize({ height: 10, width: 0 });

    expect(brain.getRenderCount()).toEqual(3);
  });

  it('should work correctly when itemMainSize is a function', () => {
    const sizes: Record<number, number> = {
      0: 5,
      1: 7,
      2: 10,
      3: 7,
      4: 9,
    };
    /**
     *   INDEX | START POS  | END POS | LENGTH
     *   -------------------------------------
     *      0  |     0      |    4    |   5
     *      1  |     5      |    11   |   7
     *      2  |     12     |    21   |  10
     *      3  |     22     |    28   |   7
     *      4  |     29     |    37   |   9
     */
    const brain: VirtualBrain = new VirtualBrain({
      itemSize: (itemIndex: number) => {
        return sizes[itemIndex];
      },
      mainAxis: 'vertical',
      count: 5,
    }) as VirtualBrain;

    // item 4
    expect(brain.getItemAt(29)).toEqual(4);
    expect(brain.getItemAt(30)).toEqual(4);
    expect(brain.getItemAt(32)).toEqual(4);
    expect(brain.getItemAt(33)).toEqual(4);

    // item 0
    expect(brain.getItemAt(1)).toEqual(0);
    expect(brain.getItemAt(4)).toEqual(0);

    // item 2
    expect(brain.getItemAt(12)).toEqual(2);
    expect(brain.getItemAt(20)).toEqual(2);
    expect(brain.getItemAt(21)).toEqual(2);

    // item 3
    expect(brain.getItemAt(22)).toEqual(3);
    expect(brain.getItemAt(24)).toEqual(3);
    expect(brain.getItemAt(28)).toEqual(3);

    // item 1
    expect(brain.getItemAt(5)).toEqual(1);
    expect(brain.getItemAt(8)).toEqual(1);
    expect(brain.getItemAt(11)).toEqual(1);

    expect(brain.getTotalSize()).toEqual(38);
  });

  it('should work correctly when no size', () => {
    const brain = new VirtualBrain({
      count: 0,
      mainAxis: 'vertical',
      itemSize: 10,
    });

    expect(brain.getRenderCount()).toEqual(0);
    expect(brain.getRenderRange()).toEqual({
      renderStartIndex: -1,
      renderEndIndex: -1,
    });

    brain.update(100, 10);

    expect(brain.getRenderCount()).toEqual(0);
    expect(brain.getRenderRange()).toEqual({
      renderStartIndex: -1,
      renderEndIndex: -1,
    });

    brain.setAvailableSize({
      height: 5,
      width: 0,
    });

    expect(brain.getRenderCount()).toEqual(2);
    expect(brain.getRenderRange()).toEqual({
      renderStartIndex: 0,
      renderEndIndex: 1,
    });

    brain.setAvailableSize({
      height: 0,
      width: 0,
    });

    expect(brain.getRenderCount()).toEqual(0);
    expect(brain.getRenderRange()).toEqual({
      renderStartIndex: -1,
      renderEndIndex: -1,
    });
  });
});
