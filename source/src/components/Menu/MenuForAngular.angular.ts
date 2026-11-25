/**
 * Angular sibling of the Menu component (Menu.tsx + index.tsx, and the Vue
 * MenuForVue.vue.ts).
 *
 * The state machine (runtime items derivation, controlled/uncontrolled
 * props) is the shared managed-component system + menuStateShared.ts; the
 * submenu triangulation logic is the shared MenuTriangleContext; alignment
 * comes through the Angular overlay. This file owns the Angular view: the
 * CSS-grid menu, item rows, keyboard navigation and submenu spawning - same
 * DOM structure, class names and data attributes as React and Vue.
 *
 * Angular menus are items-driven (`[items]`), like the Vue ones.
 *
 * Labels, descriptions and the values of custom columns are Renderables
 * (strings, `TemplateRef`s, `renderTemplate()` / `renderComponent()`). A
 * bare `TemplateRef` gets `{ $implicit: item, item, column, value }` as its
 * context. A column `render` function returns the content of the cell: the
 * menu renders the cell element itself (with the `domProps` it passes to
 * `render`).
 */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { join } from '../../utils/join';
import { raf } from '../../utils/raf';
import { Rectangle } from '../../utils/pageGeometry/Rectangle';
import { styleWithUnits } from '../../utils/styleWithUnits';

import { display } from '../InfiniteTable/utilities.css';
import { ExpandCollapseIcon } from '../InfiniteTable/components/icons/ExpandCollapseIcon/ExpandCollapseIconForAngular.angular';

import { buildManagedAngularComponent } from '../hooks/useComponentState/useManagedComponent.angular';
import { watchSignals } from '../hooks/watchSignals.angular';
import {
  InfiniteOverlayPortal,
  createOverlay,
  type UpdateOverlayContentFn,
} from '../hooks/useOverlay/OverlayForAngular.angular';
import {
  InfiniteRender,
  renderComponent,
  renderTemplate,
} from '../RawList/InfiniteRenderForAngular.angular';
import type {
  ComponentType,
  HTMLProps,
  Renderable,
} from '../types/FrameworkTypes.angular';

import {
  MenuCls,
  MenuItemCls,
  MenuRowCls,
  MenuSeparatorCls,
} from './MenuCls.css';
import { MenuInputs, MENU_PROPS_META } from './MenuInputs.generated.angular';
import type {
  MenuColumn,
  MenuProps,
  MenuRuntimeItem,
  MenuRuntimeItemSelectable,
} from './MenuProps';
import type { MenuApi, MenuState } from './MenuState';
import {
  deriveMenuStateShared,
  forwardMenuProps,
  getInitialMenuStateShared,
  type MenuRenderAdapters,
} from './menuStateShared';
import {
  getFirstCheckBoxInsideMenuItem,
  getMenuItemRect,
} from './menuDomUtils';
import { MenuTriangleContext } from './MenuTriangleContext';
import { propToIdentifyMenu } from './propToIdentifyMenu';

/**
 * The separator decoration (`'-'` in the items).
 */
@Component({
  selector: 'hr[infiniteMenuSeparator]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { '[class]': 'className' },
  template: '',
})
export class MenuSeparator {
  protected readonly className = MenuSeparatorCls;
}

const SEPARATOR = renderComponent(MenuSeparator);
const SUBMENU_ICON = renderComponent(ExpandCollapseIcon, {
  inputs: { expanded: false },
});

// the menu renders the cell element of every column (with the domProps),
// so the submenu column only gives the content
const angularMenuRenderAdapters: MenuRenderAdapters = {
  renderSeparator: () => SEPARATOR,
  renderSubmenuColumn: (({ item }: { item: any }) =>
    item.menu ? SUBMENU_ICON : null) as MenuColumn['render'],
};

const MENU_DEFAULTS: Partial<MenuProps> = {
  addSubmenuColumnIfNeeded: true,
  bubbleActionsFromSubmenus: true,
  wrapLabels: false,
};

const injectManagedMenu = buildManagedAngularComponent<any, any, any, any>({
  initSetupState: getInitialMenuStateShared as any,
  forwardProps: (() => forwardMenuProps()) as any,
  mapPropsToState: ((params: any) =>
    deriveMenuStateShared(params, angularMenuRenderAdapters)) as any,
  defaults: MENU_DEFAULTS,
  debugName: 'Menu',
} as any);

/**
 * The content to render for a Menu with the given props (React prop names,
 * as in menu definitions: `onAction`, `onHide`, ...) - the props become the
 * inputs of the component and the callbacks its outputs, as in a template.
 * `MenuCmp` is the `components.Menu` override, if any (a component class or
 * a template, which gets the props as its context).
 */
export function renderMenu(
  props: MenuProps & { domProps?: HTMLProps<HTMLDivElement> },
  MenuCmp?: ComponentType<any> | null,
): Renderable {
  if (MenuCmp instanceof TemplateRef) {
    return renderTemplate(MenuCmp, { $implicit: props, ...props });
  }
  const inputs: Record<string, unknown> = {};
  const outputs: Record<string, (value: any) => void> = {};
  const callbacks = MENU_PROPS_META.callbacks;

  for (const key in props) {
    const value = (props as any)[key];
    const callback = callbacks[key];
    if (callback && 'output' in callback) {
      if (callback.fn) {
        // also a function input, with the full signature (onShow(state, api))
        inputs[key] = value;
      } else if (typeof value === 'function') {
        outputs[callback.output] = value;
      }
      continue;
    }
    inputs[key] = value;
  }

  return renderComponent((MenuCmp as any) ?? Menu, { inputs, outputs });
}

type MenuCellView = {
  key: string;
  className: string;
  style: Record<string, any>;
  columnId: string;
  colName: string;
  rowId: string;
  rowIndex: string;
  itemKey: string;
  content: Renderable;
  context: unknown;
};

/**
 * The callbacks a row calls on its menu.
 */
type MenuRowHandlers = {
  onItemEnter: (item: MenuRuntimeItemSelectable, event: PointerEvent) => void;
  onItemLeave: (item: MenuRuntimeItemSelectable, event: PointerEvent) => void;
  onItemClick: (event: MouseEvent, item: MenuRuntimeItemSelectable) => void;
};

/**
 * One menu row (RuntimeItemRenderer in React): a cell per column, all in a
 * display:contents row so the menu grid lays them out.
 */
@Component({
  selector: 'div[infiniteMenuRow]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [InfiniteRender],
  host: { '[class]': 'rowClassName' },
  template: `
    @let i = item(); @if (i.type === 'decoration') {
    <div [style]="decorationStyle()">
      <ng-container [infiniteRender]="i.value" />
    </div>
    } @else { @for (cell of cells(); track cell.key) {
    <div
      [class]="cell.className"
      [style]="cell.style"
      [attr.data-menu-column-id]="cell.columnId"
      [attr.data-menu-col-name]="cell.colName"
      [attr.data-menu-row-id]="cell.rowId"
      [attr.data-menu-row-index]="cell.rowIndex"
      [attr.data-menu-item-key]="cell.itemKey"
      (pointerenter)="onPointerEnter($event)"
      (pointerleave)="onPointerLeave($event)"
      (mousedown)="onMouseDown()"
      (mouseup)="onMouseUp()"
      (click)="onClick($event)"
    >
      <ng-container
        [infiniteRender]="cell.content"
        [infiniteRenderContext]="cell.context"
      />
    </div>
    } }
  `,
})
export class MenuRow {
  readonly columns = input.required<MenuColumn[]>();
  readonly item = input.required<MenuRuntimeItem>();
  readonly index = input.required<number>();
  readonly active = input.required<boolean>();
  readonly keyboardActive = input.required<boolean>();
  readonly handlers = input.required<MenuRowHandlers>();

  protected readonly rowClassName = MenuRowCls;

  private readonly pressed = signal(false);

  protected readonly decorationStyle = computed(() =>
    styleWithUnits(this.item().style as Record<string, any>),
  );

  protected readonly cells = computed((): MenuCellView[] => {
    const item = this.item();
    if (item.type !== 'item') {
      return [];
    }
    const columns = this.columns();
    const index = this.index();
    const active = this.active();
    const keyboardActive = this.keyboardActive();
    const pressed = this.pressed();
    const key = item.value.key;

    const className = join(
      MenuItemCls({
        active,
        disabled: !!item.disabled,
        keyboardActive,
        pressed: pressed || active,
      }),
      item.className,
    );

    const cells: MenuCellView[] = [];
    let spanIndex = 0;

    columns.forEach((col, i) => {
      const target = item.value;
      const field = col.field || col.name;
      const start = i + 1;
      const end = start + item.span;

      if (start < spanIndex) {
        return;
      }
      spanIndex = end;

      const style = styleWithUnits({
        ...(col.style as Record<string, any>),
        ...(item.style as Record<string, any>),
        gridColumnStart: start,
        gridColumnEnd: end,
      });

      const columnId = `${item.parentMenuId}-col-${col.name}`;
      const rowId = `${item.parentMenuId}-row-${index}`;
      const value = (target as any)[field];

      const domProps = {
        style,
        className,
        'data-menu-column-id': columnId,
        'data-menu-col-name': `${col.name}`,
        'data-menu-row-id': rowId,
        'data-menu-row-index': `${index}`,
        'data-menu-item-key': `${item.key}`,
      };

      const content = col.render
        ? (col.render({
            item: target,
            column: col,
            value,
            domProps,
          }) as Renderable)
        : (value as Renderable);

      cells.push({
        key: `${key}-${field}`,
        className,
        style,
        columnId,
        colName: `${col.name}`,
        rowId,
        rowIndex: `${index}`,
        itemKey: `${item.key}`,
        content,
        context: { $implicit: target, item: target, column: col, value },
      });
    });

    return cells;
  });

  private selectable(): MenuRuntimeItemSelectable | null {
    const item = this.item();
    return item.type === 'item' && !item.disabled ? item : null;
  }

  protected onPointerEnter(event: PointerEvent) {
    const item = this.selectable();
    if (item) {
      this.handlers().onItemEnter(item, event);
    }
  }
  protected onPointerLeave(event: PointerEvent) {
    const item = this.selectable();
    if (item) {
      this.handlers().onItemLeave(item, event);
    }
  }
  protected onMouseDown() {
    if (this.selectable()) {
      this.pressed.set(true);
    }
  }
  protected onMouseUp() {
    if (this.selectable()) {
      this.pressed.set(false);
    }
  }
  protected onClick(event: MouseEvent) {
    const item = this.selectable();
    if (item) {
      this.handlers().onItemClick(event, item);
    }
  }
}

const HOST_CLASS_NAME = display.contents;

/**
 * A menu: `<infinite-menu [items]="items" (action)="onAction($event)" />`.
 *
 * Items are objects with a `key` and a `label` (a Renderable), `'-'` for a
 * separator, and `menu: { items }` for a submenu. With `[columns]`, every
 * column shows the item property named like the column (`field`), or what
 * its `render` function returns.
 *
 * The host is a display:contents element; the menu element inside it has
 * the `InfiniteMenu` class and the `data-menu-id` attribute. `[domProps]`
 * (class, style) go on that element.
 */
@Component({
  selector: 'infinite-menu',
  exportAs: 'infiniteMenu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MenuRow, InfiniteOverlayPortal],
  host: { '[class]': 'hostClassName' },
  template: `
    @if (initialized) { @let s = state(); @if (!s.destroyed) {
    <div
      #menu
      tabindex="0"
      [attr.data-menu-id]="s.menuId"
      [attr.data-submenu-for]="s.parentMenuItemKey"
      [class]="menuClassName()"
      [style]="menuStyle()"
      (keydown)="handleKeydown($event)"
      (mousedown)="onMenuMouseDown()"
      (mouseup)="onMenuMouseUp()"
      (focus)="onMenuFocus()"
      (blur)="onMenuBlur($event)"
    >
      @for (item of s.runtimeItems; track item.type === 'item' ? item.key :
      $index) {
      <div
        infiniteMenuRow
        [columns]="s.columns"
        [item]="item"
        [index]="$index"
        [active]="item.type === 'item' && item.key === s.activeItemKey"
        [keyboardActive]="
          item.type === 'item' && item.key === s.keyboardActiveItemKey
        "
        [handlers]="rowHandlers"
      ></div>
      }
    </div>
    <ng-container [infiniteOverlayPortal]="submenuOverlay" />
    } }
  `,
})
export class Menu extends MenuInputs implements OnInit, OnDestroy {
  /**
   * DOM props of the menu element (class / className, style).
   */
  readonly domProps = input<HTMLProps<HTMLDivElement>>();

  private readonly injector = inject(Injector);
  private readonly managed = injectManagedMenu(this, MENU_PROPS_META);

  protected initialized = false;
  protected readonly hostClassName = HOST_CLASS_NAME;

  /** the state (tracked) */
  protected readonly state = computed(
    () => this.managed.context.state() as MenuState,
  );

  private readonly menuRef = viewChild<ElementRef<HTMLDivElement>>('menu');

  // all submenus are rendered inside this menu, so they move with it
  protected readonly submenuOverlay = createOverlay({ portalContainer: false });

  protected readonly menuClassName = computed(() => {
    const domProps = this.domProps();
    return join(
      MenuCls,
      domProps?.class as string | undefined,
      domProps?.className as string | undefined,
      'InfiniteMenu',
    );
  });

  protected readonly menuStyle = computed(() => {
    const { columns, runtimeItems, wrapLabels } = this.state();
    const gridTemplateColumns = columns
      .map((col) => {
        return (
          col.width ||
          (typeof col.flex === 'number' ? `${col.flex}fr` : col.flex) ||
          'auto'
        );
      })
      .map((width) => (typeof width === 'number' ? `${width}px` : width))
      .join(' ');

    const style: Record<string, any> = {
      ...styleWithUnits(this.domProps()?.style as Record<string, any>),
      gridTemplateColumns,
      gridTemplateRows: runtimeItems.map(() => `auto`).join(' '),
    };
    if (!wrapLabels) {
      style.whiteSpace = 'nowrap';
    }
    return style;
  });

  private mounted = false;
  private shown = false;
  private shouldSelectFirstItemOnFocus = true;
  private submenuApi: MenuApi | null = null;

  protected rowHandlers!: MenuRowHandlers;

  /**
   * The menu's api (null until the menu is initialized).
   */
  api!: MenuApi;

  constructor() {
    super();

    // mount / unmount of the menu element (React's refCallback): onShow
    // when it appears and onHide when it goes away - including the
    // `destroyed` case, where the menu renders nothing without being
    // destroyed
    afterRenderEffect(() => {
      const node = this.menuRef()?.nativeElement ?? null;
      untracked(() => this.onMenuNode(node));
    });
  }

  // ngOnDestroy, not a DestroyRef callback: the outputs (`hide`) are closed
  // by the time DestroyRef callbacks run
  ngOnDestroy() {
    this.mounted = false;
    if (!this.initialized) {
      return;
    }
    if (this.shown) {
      this.shown = false;
      this.getState().onHide?.(this.getState());
    }
    this.getState().domRef.current = null;
  }

  private getState = (): MenuState =>
    this.managed.context.getComponentState() as MenuState;

  private get componentActions(): any {
    return this.managed.context.componentActions;
  }

  private setKeyboardActiveItemKey(key: string | null) {
    this.componentActions.keyboardActiveItemKey = key;
  }
  private setActiveItemKey(key: string | null) {
    this.componentActions.activeItemKey = key;
  }

  private hideAll = () => {
    const state = this.getState();
    state.onHideIntent?.(state);
  };

  ngOnInit() {
    this.managed.init();
    this.initialized = true;

    const getState = this.getState;

    this.api = {
      hideMenu: this.hideAll,
      focus: () => {
        const domNode = getState().domRef.current;
        if (domNode) {
          (domNode as HTMLElement).focus();

          setTimeout(() => {
            // sometimes the above focus does not work, so try again
            const node = getState().domRef.current as HTMLElement | null;
            if (node && node !== document.activeElement) {
              node.focus();
            }
          }, 10);

          // when doing arrow-left navigation from a third-level menu to a
          // second level and then to a root menu, the focus event may not
          // fire for the root menu - so call it explicitly
          this.onMenuFocus();
        }
      },
      getMenuId: () => getState().menuId,
      getParentMenuId: () => getState().parentMenuId,
    };

    // ---- submenu triangulation (shared MenuTriangleContext) ----
    const { onItemEnter, onItemLeave } = new MenuTriangleContext({
      parentMenuId: getState().parentMenuId,
      onItemActivate: (itemKey: string | null) => {
        if (!this.mounted) {
          return;
        }
        this.setActiveItemKey(itemKey);
      },
      itemHasSubMenu: (itemKey: string) => {
        const item = getState().runtimeItems.filter(
          (item) => item.type === 'item' && item.key === itemKey && item.menu,
        )[0];

        return !!item;
      },
      getMenuRectFor: (itemKey) => {
        const selector = `[data-submenu-for="${itemKey}"]`;
        const menuNode = document.querySelector(selector);
        if (!menuNode) {
          return undefined;
        }
        return Rectangle.from(menuNode.getBoundingClientRect());
      },
    }).getHandlers();

    this.rowHandlers = {
      onItemEnter: (item, event) => onItemEnter(item.key, event),
      onItemLeave: (item, event) => onItemLeave(item.key, event),
      onItemClick: (event, item) => this.onItemClick(event, item),
    };

    // ---- submenu spawning: mirrors the useLayoutEffect on activeItemKey.
    // The submenu content is also rendered again when this menu's items
    // change (React renders it with the menu), without realigning it
    let updateSubmenu: UpdateOverlayContentFn | null = null;

    watchSignals(
      () => {
        const s = this.state();
        return [s.activeItemKey, s.runtimeItems] as const;
      },
      ([activeItemKey], previous) => {
        const { runtimeItems, menuId, constrainTo } = getState();

        const activeItem = runtimeItems.filter(
          (item) => item.type === 'item' && activeItemKey === item.key,
        )[0] as MenuRuntimeItemSelectable | null;

        const activeItemKeyChanged = !previous || previous[0] !== activeItemKey;

        if (!activeItem || !activeItem.menu) {
          if (activeItemKeyChanged || updateSubmenu) {
            this.submenuApi = null;
            updateSubmenu = null;
            this.submenuOverlay.clearAll();
          }
          return;
        }

        if (!activeItemKeyChanged) {
          updateSubmenu?.(() => this.renderSubmenuForItem(activeItem), {
            skipRealign: true,
          });
          return;
        }

        const alignTo = getMenuItemRect(menuId, activeItem.key)!;

        if (alignTo) {
          updateSubmenu = this.submenuOverlay.showOverlay(
            () => this.renderSubmenuForItem(activeItem),
            {
              id: `${menuId}-submenu`,
              alignTo,
              alignPosition: [
                ['TopLeft', 'TopRight'],
                ['TopRight', 'TopLeft'],
              ],
              constrainTo,
            },
          );
        }
      },
      { injector: this.injector, flush: 'post' },
    );
  }

  private onMenuNode(node: HTMLDivElement | null) {
    if (!this.initialized) {
      return;
    }
    const getState = this.getState;
    if (node && !this.shown) {
      this.shown = true;
      getState().domRef.current = node;
      this.mounted = true;
      getState().onShow?.(getState(), this.api);
      if (getState().autoFocus) {
        this.api.focus();
      }
    } else if (!node && this.shown) {
      this.shown = false;
      getState().onHide?.(getState());
      getState().domRef.current = null;
    } else if (node) {
      getState().domRef.current = node;
    }
  }

  protected onMenuFocus() {
    this.componentActions.focused = true;

    // we're using a special lazy focus (we consider
    // shouldSelectFirstItemOnFocus), as the user might be actually clicking
    // a menu item directly - in that case selecting the first item and then
    // the clicked item would flicker
    setTimeout(() => {
      const domNode = this.getState().domRef.current;
      if (
        this.shouldSelectFirstItemOnFocus &&
        domNode &&
        domNode === document.activeElement &&
        this.getState().keyboardActiveItemKey == null
      ) {
        this.setKeyboardActiveItemKey(
          this.getState().runtimeSelectableItems[0]?.key ?? null,
        );
      }
    });
  }

  protected onMenuBlur(event: FocusEvent) {
    const node = event.target as HTMLElement;
    // Chrome fires blur synchronously when the focused menu element is
    // removed (ArrowLeft in a submenu, a parent closing it): React and Vue
    // read `focused` in onHide before the removal, so keep it until then -
    // the parent menu takes the focus back when its focused submenu hides
    queueMicrotask(() => {
      if (node.isConnected && this.getState().domRef.current === node) {
        this.componentActions.focused = false;
      }
    });
  }

  protected onMenuMouseDown() {
    this.shouldSelectFirstItemOnFocus = false;
  }

  protected onMenuMouseUp() {
    this.shouldSelectFirstItemOnFocus = true;
  }

  private onItemClick(
    event: MouseEvent | KeyboardEvent,
    item: MenuRuntimeItemSelectable,
  ) {
    this.setKeyboardActiveItemKey(item.key);
    this.setActiveItemKey(item.key);

    if (item.originalMenuItem.onClick) {
      item.originalMenuItem.onClick(event as any);
    }
    const onActionParam = {
      key: item.key,
      item: item.originalMenuItem,
      hideMenu: this.hideAll,
    };
    if (item.originalMenuItem.onAction) {
      item.originalMenuItem.onAction(onActionParam);
    }
    const { onAction } = this.getState();
    if (onAction) {
      onAction(onActionParam);
    }

    if (item.originalMenuItem.hideMenuOnAction) {
      this.hideAll();
    }
  }

  private renderSubmenuForItem(item: MenuRuntimeItemSelectable): Renderable {
    const parentMenuId = this.getState().menuId;

    let itemMenu = item.menu;
    if (!itemMenu) {
      return null;
    }
    if (typeof itemMenu === 'function') {
      itemMenu = itemMenu();
    }
    const submenu = itemMenu as MenuProps;

    return renderMenu({
      parentMenuItemKey: item.key,
      parentMenuId,
      constrainTo: this.getState().constrainTo as any,
      ...submenu,
      autoFocus: false,
      onShow: (state: MenuState, submenuApi: MenuApi) => {
        submenu?.onShow?.(state, submenuApi);
        this.submenuApi = submenuApi;
      },
      onHideIntent: (state: MenuState) => {
        submenu?.onHideIntent?.(state);
        this.hideAll();
      },
      onHide: (state: MenuState) => {
        if (state.focused) {
          // the submenu was focused but now is unmounted
          this.setActiveItemKey(null);
          this.setKeyboardActiveItemKey(item.key);
          // so make sure we focus the current menu
          this.api.focus();
        }
      },
    });
  }

  // ---- keyboard navigation (ported verbatim from Menu.tsx) ----
  protected handleKeydown(keyboardEvent: KeyboardEvent) {
    const getState = this.getState;
    const { runtimeItems, runtimeSelectableItems, keyboardActiveItemKey } =
      getState();
    const keyboardActiveIndex = runtimeItems.findIndex(
      (runtimeItem) =>
        runtimeItem.type === 'item' &&
        runtimeItem.key === keyboardActiveItemKey,
    );

    let newKeyboardActiveItemKey = keyboardActiveItemKey;

    const keyboardActiveItem = runtimeItems[
      keyboardActiveIndex
    ] as MenuRuntimeItemSelectable;

    const validKeys = {
      ArrowUp: () => {
        const newActiveItem = runtimeItems
          .slice(0, keyboardActiveIndex)
          .filter((item) => item.type === 'item' && !item.disabled)
          .pop();
        if (
          newActiveItem &&
          newActiveItem.type === 'item' &&
          newActiveItem.key
        ) {
          newKeyboardActiveItemKey = newActiveItem.key;
        }
      },
      ArrowDown: () => {
        const newActiveItem = runtimeItems
          .slice(keyboardActiveIndex + 1)
          .filter((item) => item.type === 'item' && !item.disabled)[0];

        if (
          newActiveItem &&
          newActiveItem.type === 'item' &&
          newActiveItem.key
        ) {
          newKeyboardActiveItemKey = newActiveItem.key;
        }
      },
      Home: () => {
        validKeys.PageUp();
      },
      End: () => {
        validKeys.PageDown();
      },
      PageUp: () => {
        newKeyboardActiveItemKey = runtimeSelectableItems[0].key;
      },
      PageDown: () => {
        newKeyboardActiveItemKey =
          runtimeSelectableItems[runtimeSelectableItems.length - 1].key;
      },
      ArrowLeft: () => {
        this.setActiveItemKey(null);

        // if we're in a submenu, we want to hide it (destroy it)
        if (getState().parentMenuId) {
          this.componentActions.destroyed = true;
        }
      },

      ArrowRight: () => {
        if (!keyboardActiveItem) {
          return;
        }
        this.setActiveItemKey(keyboardActiveItem.key);

        raf(() => {
          const submenuApi = this.submenuApi;
          if (
            this.mounted &&
            submenuApi &&
            submenuApi.getParentMenuId() === getState().menuId
          ) {
            submenuApi.focus();
          }
        });
      },
      Enter: () => {
        if (!keyboardActiveItem) {
          return;
        }
        if (keyboardActiveItem.originalMenuItem?.menu) {
          // we close it if it was opened
          if (this.submenuApi) {
            validKeys.ArrowLeft();
            return;
          }
          // or open if it was closed
          this.setActiveItemKey(keyboardActiveItem.key);
        } else {
          this.onItemClick(keyboardEvent, keyboardActiveItem);
        }
      },
      ' ': () => {
        if (!keyboardActiveItem) {
          return;
        }
        if (!keyboardActiveItem.originalMenuItem.menu) {
          this.onItemClick(keyboardEvent, keyboardActiveItem);
        }

        const checkbox = getFirstCheckBoxInsideMenuItem(
          getState().menuId,
          keyboardActiveItem.key,
        );
        if (!checkbox) {
          return;
        }

        checkbox.click();
      },
      Escape: () => {
        validKeys.ArrowLeft();

        const state = getState();

        if (!state.parentMenuId) {
          // this is a root menu, so make known to the parent that
          // it should possibly be hidden/destroyed on Escape
          state.onHideIntent?.(state);
        }
      },
    };

    const fn = validKeys[keyboardEvent.key as keyof typeof validKeys];

    if (fn) {
      fn();
      keyboardEvent.preventDefault();
    }
    if (newKeyboardActiveItemKey != keyboardActiveItemKey) {
      this.setKeyboardActiveItemKey(newKeyboardActiveItemKey);
    }
  }
}

// this is here because we want a simple way for `showOverlay` (from the
// overlay) to give the portal container to the menu
(Menu as any)[propToIdentifyMenu] = true;
