import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import {
  DataSource,
  InfiniteTable,
  DevToolsHostPageMessagePayload,
} from '@infinite-table/infinite-react';

import { sendMessageToContentScript } from '../lib/sendMessageToContentScript';

//@ts-ignore
const LICENSE_KEY = process.env.INFINITE_TABLE_LICENSE_KEY;

function MainPanel({
  instances,
}: {
  instances: DevToolsHostPageMessagePayload[];
}) {
  return (
    <div className="bg-background flex flex-1">
      <DataSource<any>
        data={instances}
        primaryKey="debugId"
        selectionMode="single-row"
      >
        <InfiniteTable
          rowHeight={30}
          domProps={{
            className: 'flex-1',
          }}
          licenseKey={LICENSE_KEY}
          keyboardNavigation="row"
          columns={{
            highlight: {
              field: 'highlight',
              header: 'Actions',
              defaultWidth: 70,
              resizable: false,
              renderMenuIcon: false,
              defaultSortable: false,

              render: ({ data }) => {
                return (
                  <button
                    className="px-2 py-0 bg-amber-400 text-background cursor-pointer rounded-sm"
                    onClick={() => {
                      sendMessageToContentScript('highlight', {
                        debugId: data?.debugId,
                      });
                    }}
                  >
                    Show
                  </button>
                );
              },
            },
            debugId: {
              field: 'debugId',
              header: 'Debug ID',
              renderSelectionCheckBox: true,
              defaultWidth: 120,
            },
            visibleColumns: {
              field: 'visibleColumnIds',
              defaultFlex: 1,
              header: 'Visible Columns',
              renderValue: ({ value }: { value: string[] }) => {
                return Array.isArray(value) ? value.join(', ') : `${value}`;
              },
            },
            columnOrder: {
              defaultFlex: 1,
              field: 'columnOrder',
              header: 'Column Order',
              renderValue: ({ value }: { value: string[] }) => {
                return Array.isArray(value) ? value.join(', ') : `${value}`;
              },
            },
            selectionMode: {
              header: 'Selection Mode',
              field: 'selectionMode',
            },
          }}
        />
      </DataSource>
    </div>
  );
}

function useOnMessageFromHostPage(
  onMessage: (payload: Record<string, DevToolsHostPageMessagePayload>) => void,
) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const listener = (changes: any) => {
      if (changes.instances) {
        onMessageRef.current?.(changes.instances.newValue);
      }
    };
    chrome.storage.session.get('instances').then((result) => {
      onMessageRef.current?.(result.instances);
    });

    chrome.storage.session.onChanged.addListener(listener);

    return () => {
      chrome.storage.session.onChanged.removeListener(listener);
    };
  }, []);
}

function PanelRoot() {
  const [instances, setInstances] = useState<
    Record<string, DevToolsHostPageMessagePayload>
  >({});

  useOnMessageFromHostPage(setInstances);

  return <MainPanel instances={Object.values(instances)} />;
}

export default PanelRoot;
