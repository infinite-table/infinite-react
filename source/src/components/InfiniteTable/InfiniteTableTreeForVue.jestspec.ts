/**
 * @jest-environment jsdom
 *
 * Phase 3d validation: tree grid parity for the Vue table.
 *
 * - TreeDataSource (nodesKey) + TreeGrid Vue wrappers
 * - the tree column renders expand/collapse icons (renderTreeIcon: true)
 * - clicking the icon collapses/expands nodes (TreeApi + shared reducer)
 * - treeApi expand/collapse/selection works from the imperative api
 */
import { createApp, defineComponent, h, nextTick } from 'vue';
import type { App } from 'vue';

import { TreeDataSource, TreeGrid } from '../TreeGrid/TreeGridForVue.vue';

type FileNode = {
  id: string;
  name: string;
  sizeKB?: number;
  children?: FileNode[];
};

const nodes: FileNode[] = [
  {
    id: '1',
    name: 'Documents',
    children: [
      { id: '10', name: 'resume.pdf', sizeKB: 100 },
      {
        id: '11',
        name: 'work',
        children: [
          { id: '110', name: 'report.docx', sizeKB: 210 },
          { id: '111', name: 'data.xlsx', sizeKB: 340 },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Pictures',
    children: [{ id: '20', name: 'photo.jpg', sizeKB: 2000 }],
  },
];

const VIEWPORT = { width: 400, height: 300 };

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = ResizeObserverMock;

async function flush(ms = 30) {
  await nextTick();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, ms));
  await nextTick();
}

describe('Vue TreeGrid', () => {
  let container: HTMLElement;
  let app: App | null = null;

  const mount = async (
    tableProps: Record<string, any> = {},
    dataSourceProps: Record<string, any> = {},
  ) => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const Root = defineComponent({
      setup() {
        return () =>
          h(
            TreeDataSource,
            { primaryKey: 'id', data: nodes, ...dataSourceProps } as any,
            {
              default: () =>
                h(TreeGrid, {
                  columns: {
                    name: {
                      field: 'name',
                      header: 'Name',
                      renderTreeIcon: true,
                    },
                    sizeKB: { field: 'sizeKB', header: 'Size' },
                  },
                  ...tableProps,
                } as any),
            },
          );
      },
    });

    app = createApp(Root);
    app.mount(container);
    await flush();

    const getState = (globalThis as any).getState;
    const actions = (globalThis as any).componentActions;
    actions.bodySize = { ...VIEWPORT };
    getState().brain.update(VIEWPORT);
    await flush();

    return { getState, actions };
  };

  afterEach(async () => {
    app?.unmount();
    app = null;
    container.remove();
    await flush(10);
  });

  const getDataSourceState = () => (globalThis as any).getDataSourceState();
  const treeApi = () => (globalThis as any).dataSourceApi.treeApi;

  const visibleNames = () =>
    getDataSourceState().dataArray.map((ri: any) => ri.data?.name);

  const nameCell = (rowId: string) =>
    container.querySelector(
      `[data-column-id="name"][data-row-id="${rowId}"]`,
    ) as HTMLElement | null;

  const expanderIcon = (rowId: string) =>
    nameCell(rowId)?.querySelector(
      '[data-name="expand-collapse-icon"]',
    ) as HTMLElement | null;

  test('tree DataSource flattens nodes and marks isTree', async () => {
    await mount();

    expect(getDataSourceState().isTree).toBe(true);

    // all nodes are expanded by default
    expect(visibleNames()).toEqual([
      'Documents',
      'resume.pdf',
      'work',
      'report.docx',
      'data.xlsx',
      'Pictures',
      'photo.jpg',
    ]);

    const rowInfo = getDataSourceState().dataArray[0];
    expect(rowInfo.isTreeNode).toBe(true);
    expect(rowInfo.isParentNode).toBe(true);
    expect(rowInfo.nodePath).toEqual(['1']);
  });

  test('parent nodes render the expand/collapse icon, leaf nodes do not', async () => {
    await mount();

    expect(expanderIcon('1')).not.toBeNull();
    expect(expanderIcon('11')).not.toBeNull();
    expect(expanderIcon('10')).toBeNull();
  });

  test('clicking the expander icon collapses and expands the node', async () => {
    await mount();

    const icon = expanderIcon('1')!;
    icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();

    expect(visibleNames()).toEqual(['Documents', 'Pictures', 'photo.jpg']);

    expanderIcon('1')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    await flush();

    expect(visibleNames()).toContain('resume.pdf');
    expect(visibleNames().length).toBe(7);
  });

  test('treeApi collapse/expand and selection work imperatively', async () => {
    await mount({}, { selectionMode: 'multi-row' });

    treeApi().collapseNode(['1']);
    await flush();
    expect(visibleNames()).toEqual(['Documents', 'Pictures', 'photo.jpg']);

    treeApi().expandNode(['1']);
    await flush();
    expect(visibleNames().length).toBe(7);

    // selecting a parent selects the whole subtree
    treeApi().selectNode(['1']);
    await flush();

    const state = getDataSourceState();
    const selection = state.treeSelectionState;
    expect(selection.isNodeSelected(['1', '10'])).toBe(true);
    expect(selection.isNodeSelected(['1', '11', '110'])).toBe(true);
    expect(selection.isNodeSelected(['2', '20'])).toBe(false);
  });

  test('defaultTreeExpandState with collapsed root works', async () => {
    await mount(
      {},
      {
        defaultTreeExpandState: {
          defaultExpanded: true,
          collapsedPaths: [['1']],
        },
      },
    );

    expect(visibleNames()).toEqual(['Documents', 'Pictures', 'photo.jpg']);
  });
});
