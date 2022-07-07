import { cancelRaf, raf } from '../../../utils/raf';
import { NonUndefined } from '../../types/NonUndefined';

type ProgressiveSpeedScrollerDynamicOptions = {
  mousePosition: { clientX: number; clientY: number };

  set scrollLeft(value: number);
  get scrollLeft();
};

type ProgressiveSpeedScrollerStaticOptions = {
  scrollOffsetEnd: number;
  scrollOffsetStart: number;
  offset?: number;
  scrollAmountsPerRaf?: number[];
};

type ProgressiveSpeedScrollerOptions = ProgressiveSpeedScrollerStaticOptions &
  ProgressiveSpeedScrollerDynamicOptions & {
    offset: NonUndefined<ProgressiveSpeedScrollerStaticOptions['offset']>;
  } & {
    scrollAmountsPerRaf: NonUndefined<
      ProgressiveSpeedScrollerStaticOptions['scrollAmountsPerRaf']
    >;
  };

export const progressiveSpeedScroller = (
  staticOptions: ProgressiveSpeedScrollerStaticOptions,
) => {
  let scrollLeftRafId: number | null = null;
  let scrollRightRafId: number | null = null;

  return {
    stop() {
      if (scrollLeftRafId !== null) {
        cancelRaf(scrollLeftRafId);
      }
      if (scrollRightRafId != null) {
        cancelRaf(scrollRightRafId);
      }
    },
    scroll(dynamicOptions: ProgressiveSpeedScrollerDynamicOptions) {
      if (scrollLeftRafId !== null) {
        cancelRaf(scrollLeftRafId);
      }
      if (scrollRightRafId != null) {
        cancelRaf(scrollRightRafId);
      }

      const opts: ProgressiveSpeedScrollerOptions = {
        offset: 100,
        scrollAmountsPerRaf: [1, 1, 2, 4, 6, 8, 11, 15],
        ...staticOptions,
        ...dynamicOptions,
      };

      const self = this;

      function scrollLeft() {
        /**
         * 0 - viewport    scrollOffsetStart
         *      left
         * .----------------.----------------. scrollOffsetStart + offset
         * |                |                |
         * |                |                |
         * |                |                |     <- the user goes in this direction with the arrow
         * |                |                |
         * |                |     x mouse    |
         * |                |                |
         *                        | -------  |  - this is margin distance - the distance the user entered the offset
         *
         */

        const marginDistance =
          opts.scrollOffsetStart + opts.offset - opts.mousePosition.clientX;

        const shouldScrollLeft =
          marginDistance > 0 && marginDistance <= opts.offset;

        if (!shouldScrollLeft) {
          return false;
        }

        const segmentCount = opts.scrollAmountsPerRaf.length;
        const segmentDistance = Math.round(opts.offset / segmentCount);

        let speed: number = 0;
        for (let i = 0; i < segmentCount; i++) {
          if (marginDistance > (i + 1) * segmentDistance) {
            speed = opts.scrollAmountsPerRaf[i];
          }
        }

        dynamicOptions.scrollLeft = dynamicOptions.scrollLeft - speed;

        scrollLeftRafId = raf(() => {
          self.scroll(dynamicOptions);
        });

        return true;
      }

      /**
       * 0 - viewport    scrollOffsetEnd - offset
       *      left
       * .----------------.----------------. scrollOffsetEnd
       * |                |                |
       * |                |                |
       * |                |                |
       * |                |                |
       * |                |     x mouse    |
       * |                |                |
       *                  |  -----|        |  - this is margin distance - the distance the user entered the offset
       *
       * the user goes in this    ->
       *    direction with the arrow
       *
       */
      function scrollRight() {
        const marginDistance =
          opts.mousePosition.clientX - (opts.scrollOffsetEnd - opts.offset);

        const shouldScrollRight =
          marginDistance > 0 && marginDistance <= opts.offset;

        if (!shouldScrollRight) {
          return false;
        }

        const segmentCount = opts.scrollAmountsPerRaf.length;
        const segmentDistance = Math.round(opts.offset / segmentCount);

        let speed: number = 0;
        for (let i = 0; i < segmentCount; i++) {
          if (marginDistance > (i + 1) * segmentDistance) {
            speed = opts.scrollAmountsPerRaf[i];
          }
        }

        dynamicOptions.scrollLeft = dynamicOptions.scrollLeft + speed;

        scrollRightRafId = raf(() => {
          self.scroll(dynamicOptions);
        });

        return true;
      }

      if (scrollLeft()) {
        return true;
      }
      if (scrollRight()) {
        return true;
      }
      return false;
    },
  };
};
