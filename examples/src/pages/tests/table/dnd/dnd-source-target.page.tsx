import * as React from 'react';
import { createPortal } from 'react-dom';

import {
  DragList,
  DragDropProvider,
  type DragProxyRenderParams,
} from '@infinite-table/infinite-react';

type Item = {
  id: number;
  label: string;
  category: string;
  color: string;
};

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#2563eb',
];

const CATEGORIES = [
  'Fruit',
  'Vegetable',
  'Dairy',
  'Grain',
  'Protein',
  'Snack',
  'Beverage',
  'Spice',
];

const ITEM_NAMES = [
  'Apple',
  'Banana',
  'Carrot',
  'Donut',
  'Eggplant',
  'Fig',
  'Grape',
  'Hummus',
  'Ice Cream',
  'Jalapeño',
  'Kiwi',
  'Lemon',
  'Mango',
  'Nectarine',
  'Orange',
  'Papaya',
  'Quinoa',
  'Radish',
  'Spinach',
  'Tomato',
  'Udon',
  'Vanilla',
  'Walnut',
  'Xigua',
  'Yogurt',
  'Zucchini',
  'Avocado',
  'Blueberry',
  'Coconut',
  'Dragonfruit',
];

function generateItems(count: number, startId = 1): Item[] {
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    label: ITEM_NAMES[i % ITEM_NAMES.length],
    category: CATEGORIES[i % CATEGORIES.length],
    color: COLORS[i % COLORS.length],
  }));
}

const SOURCE_ITEMS = generateItems(30, 1);
const SOURCE2_ITEMS = generateItems(10, 100);

function ItemCard(props: {
  item: Item;
  active: boolean;
  draggingInProgress: boolean;
  domProps: React.HTMLProps<HTMLDivElement>;
  showHandle?: boolean;
}) {
  const {
    item,
    active,
    draggingInProgress,
    domProps,
    showHandle = true,
  } = props;
  const { onPointerDown, className: _cls, ...restDomProps } = domProps;

  return (
    <div
      {...restDomProps}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        borderRadius: 8,
        background: active
          ? '#e0e7ff'
          : draggingInProgress
          ? '#f0fdf4'
          : '#fff',
        border: active ? '2px solid #6366f1' : '1px solid #e2e8f0',
        boxShadow: active
          ? '0 4px 12px rgba(99,102,241,0.25)'
          : '0 1px 2px rgba(0,0,0,0.04)',
        cursor: 'grab',
        userSelect: 'none',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
    >
      {showHandle && (
        <div
          onPointerDown={onPointerDown}
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            background: item.color,
            flexShrink: 0,
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          ⠿
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
          {item.label}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.category}</div>
      </div>
      <div
        style={{
          fontSize: 11,
          color: '#a1a1aa',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        #{item.id}
      </div>
    </div>
  );
}

function ListHeader(props: { title: string; count: number; accent: string }) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>
        {props.title}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#fff',
          background: props.accent,
          borderRadius: 10,
          padding: '2px 8px',
        }}
      >
        {props.count}
      </span>
    </div>
  );
}

function ProxyCard({
  item,
  style,
  proxyRef,
}: {
  item: Item;
  style: React.CSSProperties;
  proxyRef: React.RefCallback<HTMLElement>;
}) {
  return (
    <div
      ref={proxyRef}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        borderRadius: 10,
        background: '#eef2ff',
        border: '2px solid #6366f1',
        boxShadow: '0 12px 32px rgba(99,102,241,0.35)',
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          background: item.color,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        ⠿
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
          {item.label}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.category}</div>
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: '#6366f1',
          background: '#c7d2fe',
          borderRadius: 6,
          padding: '2px 6px',
        }}
      >
        Moving
      </div>
    </div>
  );
}

function makeRenderDragProxy(getItems: () => Item[]) {
  return ({ dragItemId, initialRect, dx, dy, ref }: DragProxyRenderParams) => {
    if (!dragItemId) return null;

    const item = getItems().find((i) => `${i.id}` === dragItemId);
    if (!item) return null;

    return createPortal(
      <ProxyCard
        item={item}
        proxyRef={ref}
        style={{
          position: 'fixed',
          top: initialRect.top + dy,
          left: initialRect.left + dx,
          width: initialRect.width,
          height: initialRect.height,
          zIndex: 999999,
        }}
      />,
      document.body,
    );
  };
}

export default function DndSourceTargetExample() {
  const [sourceItems, setSourceItems] = React.useState<Item[]>(SOURCE_ITEMS);
  const [source2Items, setSource2Items] = React.useState<Item[]>(SOURCE2_ITEMS);
  const [targetItems, setTargetItems] = React.useState<Item[]>([]);

  const onDropSource = React.useCallback((sortedIndexes: number[]) => {
    setSourceItems((prev) => sortedIndexes.map((i) => prev[i]));
  }, []);

  const onRemoveSource = React.useCallback((sortedIndexes: number[]) => {
    setSourceItems((prev) => sortedIndexes.map((i) => prev[i]));
  }, []);

  const onDropSource2 = React.useCallback((sortedIndexes: number[]) => {
    setSource2Items((prev) => sortedIndexes.map((i) => prev[i]));
  }, []);

  const onRemoveSource2 = React.useCallback((sortedIndexes: number[]) => {
    setSource2Items((prev) => sortedIndexes.map((i) => prev[i]));
  }, []);

  const onDropTarget = React.useCallback((sortedIndexes: number[]) => {
    setTargetItems((prev) => sortedIndexes.map((i) => prev[i]));
  }, []);

  const onRemoveTarget = React.useCallback((sortedIndexes: number[]) => {
    setTargetItems((prev) => sortedIndexes.map((i) => prev[i]));
  }, []);

  const onAcceptDropTarget = React.useCallback(
    (params: {
      dragItemId: string;
      dragSourceListId: string;
      dragIndex: number;
      dropIndex: number;
    }) => {
      const allSourceItems =
        params.dragSourceListId === 'source' ? sourceItems : source2Items;
      const draggedItem = allSourceItems.find(
        (item) => `${item.id}` === params.dragItemId,
      );
      if (!draggedItem) return;

      setTargetItems((prev) => {
        const newItems = [...prev];
        newItems.splice(params.dropIndex, 0, draggedItem);
        return newItems;
      });
    },
    [sourceItems, source2Items],
  );

  const onAcceptDropSource = React.useCallback(
    (params: { dragItemId: string; dragIndex: number; dropIndex: number }) => {
      const draggedItem = targetItems.find(
        (item) => `${item.id}` === params.dragItemId,
      );
      if (!draggedItem) return;

      setSourceItems((prev) => {
        const newItems = [...prev];
        newItems.splice(params.dropIndex, 0, draggedItem);
        return newItems;
      });
    },
    [targetItems],
  );

  const renderSourceProxy = React.useMemo(
    () => makeRenderDragProxy(() => sourceItems),
    [sourceItems],
  );

  const renderTargetProxy = React.useMemo(
    () => makeRenderDragProxy(() => targetItems),
    [targetItems],
  );

  return (
    <DragDropProvider>
      {({ dragSourceListId, dropTargetListId, status }) => {
        const rejected = status === 'rejected';

        return (
          <div
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              padding: 32,
              minHeight: '100vh',
              background: '#f8fafc',
            }}
          >
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: 8,
              }}
            >
              Drag &amp; Drop: Source ↔ Target
            </h1>
            <p
              style={{
                fontSize: 14,
                color: '#64748b',
                marginBottom: 24,
              }}
            >
              Drag items between the two lists. Items are removed from the
              source list and added to the target.
            </p>

            <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
              {/* SOURCE LIST */}
              <div
                style={{
                  width: 340,
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
              >
                <ListHeader
                  title="Source"
                  count={sourceItems.length}
                  accent="#6366f1"
                />
                <DragList
                  orientation="vertical"
                  dragListId="source"
                  onDrop={onDropSource}
                  onRemove={onRemoveSource}
                  onAcceptDrop={onAcceptDropSource}
                  removeOnDropOutside
                  acceptDropsFrom={['source', 'target']}
                  dragStrategy="proxy"
                  renderDragProxy={renderSourceProxy}
                  // onDragProxySetup={({ dragItemNode }) => {
                  //   dragItemNode.style.visibility = 'visible';
                  // }}
                >
                  {(domProps) => {
                    const isDropTarget = dropTargetListId === 'source';
                    return (
                      <div
                        {...domProps}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          padding: 12,
                          // maxHeight: '70vh',
                          maxHeight: '300px',
                          overflowY: 'auto',
                          background:
                            isDropTarget && !rejected
                              ? '#f0fdf4'
                              : isDropTarget && rejected
                              ? '#fef2f2'
                              : dragSourceListId === 'source' && !isDropTarget
                              ? '#fef2f2'
                              : undefined,
                          transition: 'background 0.2s',
                        }}
                      >
                        {sourceItems.map((item) => (
                          <DragList.DraggableItem key={item.id} id={item.id}>
                            {(itemDomProps, { active, draggingInProgress }) => (
                              <ItemCard
                                item={item}
                                active={active}
                                draggingInProgress={draggingInProgress}
                                domProps={itemDomProps}
                              />
                            )}
                          </DragList.DraggableItem>
                        ))}
                        {sourceItems.length === 0 && (
                          <div
                            style={{
                              padding: 40,
                              textAlign: 'center',
                              color: '#94a3b8',
                              fontSize: 14,
                            }}
                          >
                            All items moved to target
                          </div>
                        )}
                      </div>
                    );
                  }}
                </DragList>
              </div>

              {/* ARROW */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingTop: 120,
                  fontSize: 28,
                  color: '#cbd5e1',
                }}
              >
                ⇄
              </div>

              {/* TARGET LIST */}
              <div
                style={{
                  width: 340,
                  background: '#fff',
                  borderRadius: 12,
                  border:
                    dropTargetListId === 'target' && !rejected
                      ? '2px solid #22c55e'
                      : dropTargetListId === 'target' && rejected
                      ? '2px solid #ef4444'
                      : '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                <ListHeader
                  title="Target"
                  count={targetItems.length}
                  accent="#22c55e"
                />
                <DragList
                  orientation="vertical"
                  dragListId="target"
                  onDrop={onDropTarget}
                  onRemove={onRemoveTarget}
                  onAcceptDrop={onAcceptDropTarget}
                  removeOnDropOutside
                  acceptDropsFrom={['source', 'source2', 'target']}
                  dragStrategy="proxy"
                  renderDragProxy={renderTargetProxy}
                >
                  {(domProps) => (
                    <div
                      {...domProps}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        padding: 12,
                        // maxHeight: '70vh',
                        maxHeight: '100px',
                        overflowY: 'auto',
                        minHeight: 200,
                        background:
                          dropTargetListId === 'target' && !rejected
                            ? '#f0fdf4'
                            : dropTargetListId === 'target' && rejected
                            ? '#fef2f2'
                            : undefined,
                        transition: 'background 0.2s',
                      }}
                    >
                      {targetItems.map((item) => (
                        <DragList.DraggableItem key={item.id} id={item.id}>
                          {(itemDomProps, { active, draggingInProgress }) => (
                            <ItemCard
                              item={item}
                              active={active}
                              draggingInProgress={draggingInProgress}
                              domProps={itemDomProps}
                            />
                          )}
                        </DragList.DraggableItem>
                      ))}
                      {targetItems.length === 0 && (
                        <div
                          style={{
                            padding: 40,
                            textAlign: 'center',
                            color: '#94a3b8',
                            fontSize: 14,
                            border: '2px dashed #e2e8f0',
                            borderRadius: 8,
                          }}
                        >
                          Drop items here
                        </div>
                      )}
                    </div>
                  )}
                </DragList>
              </div>

              {/* SOURCE 2 — preserveDragSpace, item stays visible */}
              <div
                style={{
                  width: 340,
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
              >
                <ListHeader
                  title="Source 2 (preserveDragSpace)"
                  count={source2Items.length}
                  accent="#8b5cf6"
                />
                <DragList
                  orientation="vertical"
                  dragListId="source2"
                  onDrop={onDropSource2}
                  onRemove={onRemoveSource2}
                  removeOnDropOutside
                  acceptDropsFrom={[]}
                  dragStrategy="proxy"
                  preserveDragSpace
                  onDragProxySetup={({ proxyElement }) => {
                    proxyElement.style.opacity = '0.85';
                    proxyElement.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                    // queueMicrotask(() => {
                    //   dragItemNode.style.visibility = 'visible';
                    // });
                  }}
                >
                  {(domProps) => {
                    const isDropTarget = dropTargetListId === 'source2';
                    return (
                      <div
                        {...domProps}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          padding: 12,
                          maxHeight: '300px',
                          overflowY: 'auto',
                          background:
                            isDropTarget && !rejected
                              ? '#f0fdf4'
                              : dragSourceListId === 'source2' && !isDropTarget
                              ? '#faf5ff'
                              : undefined,
                          transition: 'background 0.2s',
                        }}
                      >
                        {source2Items.map((item) => (
                          <DragList.DraggableItem key={item.id} id={item.id}>
                            {(itemDomProps, { active, draggingInProgress }) => (
                              <ItemCard
                                item={item}
                                active={active}
                                draggingInProgress={draggingInProgress}
                                domProps={itemDomProps}
                              />
                            )}
                          </DragList.DraggableItem>
                        ))}
                        {source2Items.length === 0 && (
                          <div
                            style={{
                              padding: 40,
                              textAlign: 'center',
                              color: '#94a3b8',
                              fontSize: 14,
                            }}
                          >
                            All items moved to target
                          </div>
                        )}
                      </div>
                    );
                  }}
                </DragList>
              </div>
            </div>
          </div>
        );
      }}
    </DragDropProvider>
  );
}
