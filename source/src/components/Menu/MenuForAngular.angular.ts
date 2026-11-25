/**
 * Angular sibling of the Menu component (Menu.tsx + index.tsx, and the Vue
 * MenuForVue.vue.ts).
 *
 * The state machine (runtime items derivation, controlled/uncontrolled
 * props) is the shared managed-component system + menuStateShared.ts; the
 * keyboard navigation, item actions and focus handling are shared
 * (menuKeyboardNav.ts), and so are the submenu props, triangulation, grid
 * style and row cells (menuViewShared.ts); alignment comes through the
 * Angular overlay. This file owns the Angular view: the CSS-grid menu, item
 * rows and submenu spawning - same DOM structure, class names and data
 * attributes as React and Vue. Different from React and Vue: the blur of
 * the menu element is deferred (see onMenuBlur).
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

import { MenuCls, MenuRowCls, MenuSeparatorCls } from './MenuCls.css';
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
  createMenuFocus,
  handleMenuKeyDown,
  hideMenuAndParents,
  runMenuItemClick,
} from './menuKeyboardNav';
import {
  createMenuTriangleHandlers,
  getActiveSubmenuItem,
  getMenuGridStyle,
  getMenuItemCells,
  getSubmenuOverlayParams,
  getSubmenuProps,
} from './menuViewShared';
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
    const target = item.value;

    return getMenuItemCells(item, this.columns(), this.index(), {
      active: this.active(),
      keyboardActive: this.keyboardActive(),
      pressed: this.pressed(),
    }).map((cell): MenuCellView => {
      const col = cell.column;
      const { value, className, dataAttributes } = cell;
      const style = styleWithUnits(cell.style);

      const domProps = {
        style,
        className,
        ...dataAttributes,
      };

      const content = col.render
        ? (col.render({
            item: target,
            column: col,
            value,
            domProps,
          }) as Renderable)
        : (value as Renderable);

      return {
        key: cell.key,
        className,
        style,
        columnId: dataAttributes['data-menu-column-id'],
        colName: dataAttributes['data-menu-col-name'],
        rowId: dataAttributes['data-menu-row-id'],
        rowIndex: dataAttributes['data-menu-row-index'],
        itemKey: dataAttributes['data-menu-item-key'],
        content,
        context: { $implicit: target, item: target, column: col, value },
      };
    });
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

  protected readonly menuStyle = computed(() =>
    getMenuGridStyle(
      this.state(),
      styleWithUnits(this.domProps()?.style as Record<string, any>),
      (width) => (typeof width === 'number' ? `${width}px` : width),
    ),
  );

  private mounted = false;
  private shown = false;
  private shouldSelectFirstItemOnFocus = true;
  private submenuApi: MenuApi | null = null;

  protected rowHandlers!: MenuRowHandlers;

  private onMenuFocusHandler!: VoidFunction;

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

  private hideAll = () => hideMenuAndParents(this.getState);

  ngOnInit() {
    this.managed.init();
    this.initialized = true;

    const getState = this.getState;

    const { api, onMenuFocus } = createMenuFocus({
      getState,
      setFocused: (focused) => {
        this.componentActions.focused = focused;
      },
      setKeyboardActiveItemKey: (key) => this.setKeyboardActiveItemKey(key),
      shouldSelectFirstItemOnFocus: () => this.shouldSelectFirstItemOnFocus,
      hideAll: this.hideAll,
    });
    this.api = api;
    this.onMenuFocusHandler = onMenuFocus;

    // ---- submenu triangulation (shared MenuTriangleContext) ----
    const { onItemEnter, onItemLeave } = createMenuTriangleHandlers(
      getState,
      (itemKey: string | null) => {
        if (!this.mounted) {
          return;
        }
        this.setActiveItemKey(itemKey);
      },
    );

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

        const activeItem = getActiveSubmenuItem(runtimeItems, activeItemKey);

        const activeItemKeyChanged = !previous || previous[0] !== activeItemKey;

        if (!activeItem) {
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

        const overlayParams = getSubmenuOverlayParams(
          menuId,
          activeItem,
          constrainTo,
        );

        if (overlayParams) {
          updateSubmenu = this.submenuOverlay.showOverlay(
            () => this.renderSubmenuForItem(activeItem),
            overlayParams,
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
    this.onMenuFocusHandler();
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
    runMenuItemClick(event, item, {
      getState: this.getState,
      setActiveItemKey: (key) => this.setActiveItemKey(key),
      setKeyboardActiveItemKey: (key) => this.setKeyboardActiveItemKey(key),
      hideAll: this.hideAll,
    });
  }

  private renderSubmenuForItem(item: MenuRuntimeItemSelectable): Renderable {
    const submenuProps = getSubmenuProps(item, {
      parentMenuId: this.getState().menuId,
      constrainTo: this.getState().constrainTo,
      api: this.api,
      hideAll: this.hideAll,
      setSubmenuApi: (submenuApi) => {
        this.submenuApi = submenuApi;
      },
      setActiveItemKey: (key) => this.setActiveItemKey(key),
      setKeyboardActiveItemKey: (key) => this.setKeyboardActiveItemKey(key),
    });

    return submenuProps ? renderMenu(submenuProps) : null;
  }

  // ---- keyboard navigation (shared menuKeyboardNav.ts) ----
  protected handleKeydown(keyboardEvent: KeyboardEvent) {
    handleMenuKeyDown(keyboardEvent, {
      getState: this.getState,
      setActiveItemKey: (key) => this.setActiveItemKey(key),
      setKeyboardActiveItemKey: (key) => this.setKeyboardActiveItemKey(key),
      destroy: () => {
        this.componentActions.destroyed = true;
      },
      getSubmenuApi: () => this.submenuApi,
      isMounted: () => this.mounted,
      onItemClick: (event, item) => this.onItemClick(event, item),
    });
  }
}

// this is here because we want a simple way for `showOverlay` (from the
// overlay) to give the portal container to the menu
(Menu as any)[propToIdentifyMenu] = true;
