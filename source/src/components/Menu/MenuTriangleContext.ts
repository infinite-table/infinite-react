import { getGlobal } from '../../utils/getGlobal';
import { Point } from '../../utils/pageGeometry/Point';
import { Rectangle } from '../../utils/pageGeometry/Rectangle';
import { Triangle } from '../../utils/pageGeometry/Triangle';
import { raf } from '../../utils/raf';

const ACTIVE_OTHER_MENU_ITEM_TIMEOUT = 250;

export function waitForValueOnRaf<ReturnType>(
  getter: () => ReturnType,
  timeout: number = 100,
): Promise<ReturnType | undefined> {
  const start = Date.now();
  return new Promise((resolve) => {
    let value;

    const fn = () => {
      value = getter();
      if (value !== undefined) {
        resolve(value);
        return;
      }
      if (Date.now() - start > timeout) {
        resolve(undefined);
        return;
      }

      raf(fn);
    };

    // it's important to start it on next tick
    raf(() => {
      fn();
    });
  });
}

const globalObject = getGlobal();

type MenuTriangleParams = {
  timeout?: number;
  /**
   * NOTE: #IAC-false
   * onItemActivateChange will only be called
   * with `itemKey: null` when the user has an active item that has no submenu and
   * leaves the menu hovering off that item directly outside the menu (not over another item).
   *
   * In this case, we want to mark that menu item as inactive, as it doesn't have any submenus.
   *
   * If the user hovers away from the menu when an item (that has submenu) is active,
   * we keep that as active even when the mouse is away, so we don't call onItemActivateChange with `itemKey: null`.
   */
  onItemActivate: (itemKey: string | null, target: HTMLElement | null) => void;
  itemHasSubMenu: (itemKey: string) => boolean;
  getMenuRectFor: (itemKey: string) => Rectangle | undefined;
  parentMenuId?: string;
};
/**
 * Here's the logic of menu and the menu triangle solution:
 *
 * - use hovers a menu item
 * - user then diagonally goes down and to the right to access the submenu
 * and even though along the way other menu items are hovered, the submenu
 * is not closed (and submenus for hovered items are not displayed along the way) - unless the move is slow (take more than say 200ms). When
 * an item has the submenu visible, we call it "active".
 * - if the move reverses, the submenu is closed and the last hovered item is activated
 *
 * Even items with no submenus can be active.
 *
 */

export class MenuTriangleContext {
  private activeItem: string | null = null;
  private currentHoveredItem: string | null = null;

  // private activeItemTimestamp: number = 0;
  private activeItemLeavePoint: Point | null = null;

  private menuLeaveTimeoutId: any = null;

  // private activeItemEventTarget: HTMLElement | null = null;
  private activeItemMenuRect: Rectangle | null = null;

  private lastPointerMoveTimestamp: number = 0;
  private mouseMoveTimeoutId: number = 0;
  private params: MenuTriangleParams;

  private lastHorizontalDiff: number = 0;

  constructor(params: MenuTriangleParams) {
    this.params = params;
  }

  private getTimeout = () => {
    return this.params.timeout || ACTIVE_OTHER_MENU_ITEM_TIMEOUT;
  };

  private getPointerMoveTarget = () => {
    return document.documentElement || globalObject;
  };

  private removePointerMoveListener = () => {
    this.getPointerMoveTarget().removeEventListener(
      'pointermove',
      this.onPointerMoveWhileActiveItem,
    );
  };

  /**
   * The whole point of this method is to change the active item when the mouse moves,
   * if the user is moving slowly or outside the menu triangle.
   *
   * This is called while having a currently active item.
   */
  private onPointerMoveWhileActiveItem = (pointerMoveEvent?: PointerEvent) => {
    clearTimeout(this.mouseMoveTimeoutId);

    if (!pointerMoveEvent) {
      // we called it ourselves
      // in order to update the timestamp of the last move
      this.lastPointerMoveTimestamp = Date.now();
      // and we exit early
      return;
    }

    // if there is no hovered item, or the hovered item is the active one, we can return
    // because we don't need tp update the active item
    if (
      !this.currentHoveredItem ||
      this.currentHoveredItem === this.activeItem
    ) {
      return;
    }

    const now = Date.now();

    if (!this.lastPointerMoveTimestamp) {
      this.lastPointerMoveTimestamp = now;
    }

    const timeElapsed = now - this.lastPointerMoveTimestamp;
    const timeoutGone = timeElapsed > this.getTimeout();

    // update the value of the last move timestamp
    this.lastPointerMoveTimestamp = now;

    const activateHoveredItem = () => {
      this.setActiveItem(null, null);
      // so we trigger onItemChange for the last hovered item again
      // because the move was slow or out of triangle

      this.onItemChange(true, this.currentHoveredItem!, pointerMoveEvent);
    };

    if (timeoutGone) {
      // the last mouse move was too long ago
      // so we trigger onItemChange for the last hovered item
      activateHoveredItem();
      return;
    }

    let hoveredItem = this.currentHoveredItem;
    this.mouseMoveTimeoutId = setTimeout(() => {
      if (hoveredItem !== this.currentHoveredItem) {
        // the hover item has changed, so we're out of sync
        return;
      }

      const now = Date.now();
      const elapsedTime = now - this.lastPointerMoveTimestamp;
      const timeoutGone = elapsedTime > this.getTimeout();

      if (timeoutGone) {
        activateHoveredItem();
      }
    }, this.getTimeout()) as any as number;

    const currentPoint = new Point({
      left: pointerMoveEvent.clientX,
      top: pointerMoveEvent.clientY,
    });

    // for checking the triangle logic, we have to have those, otherwise we can't continue
    if (!this.activeItemMenuRect || !this.activeItemLeavePoint) {
      return;
    }

    // we need to check if the user is moving the mouse back from the submenu to the menu again
    // this is a reverse movement, so we should activate the last hovered item

    const submenuToTheRight =
      this.activeItemLeavePoint.left < this.activeItemMenuRect.left;

    const horizontalDirectionSign = submenuToTheRight ? 1 : -1;
    const horizontalDiff =
      horizontalDirectionSign *
      (currentPoint.left - this.activeItemLeavePoint.left);

    if (horizontalDiff - this.lastHorizontalDiff < 0) {
      this.lastHorizontalDiff = 0;
      activateHoveredItem();
      return;
    }
    this.lastHorizontalDiff = horizontalDiff;

    // we need to check if the user is moving diagonally down and to the right/left (depending on the submenu position)
    const triangle = submenuToTheRight
      ? new Triangle([
          this.activeItemLeavePoint,
          this.activeItemMenuRect.getTopLeft(),
          this.activeItemMenuRect.getBottomLeft(),
        ])
      : new Triangle([
          // in this case, the menu is placed to the left, so adjust the triangle
          this.activeItemLeavePoint,
          this.activeItemMenuRect.getTopRight(),
          this.activeItemMenuRect.getBottomRight(),
        ]);

    if (!triangle.containsPoint(currentPoint)) {
      this.setActiveItem(null, null);
      this.onItemChange(true, this.currentHoveredItem!, pointerMoveEvent);
    }
  };

  /**
   * See #IAC-false note above
   */
  private setupMenuLeaveTracking = () => {
    this.menuLeaveTimeoutId = setTimeout(() => {
      if (this.activeItem && this.params.itemHasSubMenu(this.activeItem)) {
        // as per the note #IAC-false
        // we don't continue clearing the active item if it has submenus
        return;
      }
      this.setActiveItem(null, null);
    }, this.getTimeout());
  };

  /**
   * This function should call onItemActivate to notify whoever's listening
   */
  private setActiveItem = (
    itemKey: string | null,
    target: HTMLElement | null,
  ) => {
    if (itemKey === this.activeItem) {
      return;
    }

    if (itemKey == null) {
      this.removePointerMoveListener();
      this.params.onItemActivate(null, null);

      this.activeItem = null;
      // this.activeItemTimestamp = 0;
      // this.activeItemEventTarget = null;
      this.activeItemMenuRect = null;

      return;
    }

    this.activeItem = itemKey;
    // this.activeItemTimestamp = Date.now();
    // this.activeItemEventTarget = target as HTMLElement;

    this.params.onItemActivate(itemKey, target);

    this.activeItemMenuRect = null;
    // wait for the active item to be rendered
    // so we can retrieve the rect

    waitForValueOnRaf(() => {
      if (this.activeItem != itemKey) {
        return false;
      }
      return this.params.getMenuRectFor(itemKey);
    }).then((rect: Rectangle | false | undefined) => {
      if (this.activeItem != itemKey) {
        return;
      }
      if (rect) {
        this.activeItemMenuRect = rect;
      }
    });
  };

  /**
   * This function is called when an item receives mouse enter or mouse leave.
   */
  private onItemChange = (
    hovered: boolean,
    itemKey: string,
    event: PointerEvent,
  ) => {
    clearTimeout(this.menuLeaveTimeoutId);
    clearTimeout(this.mouseMoveTimeoutId);

    if (!hovered) {
      this.removePointerMoveListener();

      if (itemKey === this.activeItem) {
        // we're leaving the currently opened item
        // so make sure we save the leave coords as we might need them
        // later in the triangle logic
        this.activeItemLeavePoint = new Point({
          left: event.clientX,
          top: event.clientY,
        });
      }

      // we might be leaving the menu for good and stop moving the mouse for a while
      // so we need to make sure we start the timeout
      this.setupMenuLeaveTracking();
      return;
    }

    // if by some accident this gets called twice one after the other, we can simply ignore this
    // if (this.currentHoveredItem === itemKey) {
    //   return;
    // }

    this.currentHoveredItem = itemKey;
    if (!this.activeItem || !this.params.itemHasSubMenu(this.activeItem)) {
      // no item is currently activated or the currently activated item does not have a submenu
      // so we can safely activate the hovered item immediately
      this.setActiveItem(itemKey, event.target as HTMLElement);
      return;
    }

    // there is an active item already, and the active item does have a submenu
    // and the active item is different from the currently hovered item
    // so we listen to mouse moves

    this.onPointerMoveWhileActiveItem(); // we need to call this in order to initialize the timestamp of the last "move" (to the value of Date.now())
    this.getPointerMoveTarget().addEventListener(
      'pointermove',
      this.onPointerMoveWhileActiveItem,
    );
  };

  getHandlers = () => {
    return {
      onItemEnter: (itemKey: string, event: PointerEvent) => {
        this.onItemChange(true, itemKey, event);
      },
      onItemLeave: (itemKey: string, event: PointerEvent) => {
        this.onItemChange(false, itemKey, event);
      },
    };
  };
}
