import * as React from 'react';

import {
  DragList,
  DragDropProvider,
} from '@src/components/InfiniteTable/components/draggable';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = async ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

// const updatePosition = (options: {
//   id: string;
//   node: HTMLElement;
//   offset: null | { left: number; top: number };
// }) => {
//   const { node, offset } = options;
//   if (!node) {
//     return;
//   }

//   if (!offset) {
//     node.style.transform = 'none';
//     return;
//   }

//   node.style.transform = `translate3d(0px, ${offset.top}px, 0px)`;
// };

function getItemClassName(
  data: Developer | undefined,
  {
    active,
    draggingInProgress,
  }: { active: boolean; draggingInProgress: boolean },
) {
  return `p-5 border h-20 ${active ? 'bg-primary z-50' : ''} ${
    draggingInProgress && !active ? 'bg-green-500/90' : ''
  }
${
  !draggingInProgress && data
    ? ` ${data.id >= 10 ? 'bg-blue-300/30' : 'bg-red-300/30'}`
    : ''
}`;
}

const DragBox = (props: {
  domProps: React.HTMLProps<HTMLDivElement>;
  data?: Developer;
  active: boolean;
  draggingInProgress: boolean;
}) => {
  const { domProps, data, active, draggingInProgress } = props;
  const { onPointerDown, className: classNameProp, ...restDomProps } = domProps;
  return (
    <div
      {...restDomProps}
      className={`${getItemClassName(data, {
        active,
        draggingInProgress,
      })}`}
    >
      <div className="flex flex-row gap-2">
        <div
          onPointerDown={onPointerDown}
          className={`${classNameProp} border border-indigo-400/50 rounded-full bg-amber-300/50 p-2`}
        >
          {data?.id}
        </div>
        <div className="flex flex-col">
          <div>{data?.firstName}</div>
          <div>{data?.lastName}</div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [data1, setData1] = React.useState<Developer[]>();
  const [data2, setData2] = React.useState<Developer[]>();
  const [_data3, setData3] = React.useState<Developer[]>();
  React.useEffect(() => {
    dataSource({}).then((data) => {
      setData1(data.slice(0, 10));
      setData2(data.slice(10, 20));
      setData3(data.slice(20, 30));
    });
  }, []);

  const onAcceptDrop1 = (params: {
    dragItemId: string;
    dragSourceListId: string;
    dropTargetListId: string;
    dropIndex: number;
    dragIndex: number;
    dropItemId?: string;
  }) => {
    setData1((data) => {
      const newData = [...(data || [])];
      const sourceData = data2 || [];

      newData.splice(params.dropIndex, 0, sourceData[params.dragIndex]);

      return newData;
    });
  };
  const onDrop1 = (
    sortedIndexes: number[],
    // { dragItemId, dropItemId }: { dragItemId: string; dropItemId?: string },
  ) => {
    console.log('onDrop1');
    setData1(sortedIndexes.map((index) => data1![index]));
  };

  const onDrop2 = (sortedIndexes: number[]) => {
    console.log('onDrop2', sortedIndexes);
    setData2((data2) => {
      const newData = sortedIndexes.map((index) => data2![index]);
      console.log('newData', newData);
      return newData;
    });
  };

  return (
    <DragDropProvider>
      {({ dragSourceListId, dropTargetListId, status }) => {
        console.log('status', status);
        return (
          <>
            <div className="flex flex-row gap-2">
              <DragList
                orientation="vertical"
                dragListId="list1"
                shouldAcceptDrop={(event) => {
                  if (event.dragSourceListId === 'list2') {
                    if (event.dragItem.id == `12`) {
                      return false;
                    }
                  }
                  return true;
                }}
                onDrop={onDrop1}
                acceptDropsFrom={['list2', 'list1']}
                removeOnDropOutside
                onAcceptDrop={onAcceptDrop1}
                onRemove={onDrop1}
              >
                {(domProps) => {
                  const rejected = status === 'rejected';
                  return (
                    <div
                      {...domProps}
                      ref={domProps.ref}
                      className={`${domProps.className} ${
                        rejected ? 'bg-red-500' : ''
                      } ${
                        dropTargetListId === 'list1' && !rejected
                          ? 'bg-green-500'
                          : ''
                      } flex flex-col gap-2`}
                    >
                      {data1?.map((d) => (
                        <DragList.DraggableItem key={d.id} id={d.id}>
                          {(domProps, { active }) => {
                            return (
                              <DragBox
                                domProps={domProps}
                                data={d}
                                active={active}
                                draggingInProgress={
                                  dropTargetListId === 'list1'
                                }
                              />
                            );
                          }}
                        </DragList.DraggableItem>
                      ))}
                    </div>
                  );
                }}
              </DragList>
              <DragList
                orientation="vertical"
                onDrop={onDrop2}
                dragListId="list2"
                acceptDropsFrom={['list1', 'list2']}
                removeOnDropOutside
                onRemove={onDrop2}
              >
                {(domProps) => {
                  const draggingInProgress = dropTargetListId;
                  const draggingOutside =
                    dragSourceListId === 'list2' &&
                    dropTargetListId != dragSourceListId;
                  return (
                    <div
                      {...domProps}
                      className={`${
                        domProps.className
                      } ml-30 flex flex-col gap-2 ${
                        draggingOutside ? 'bg-red-500/30' : ''
                      } ${draggingInProgress ? 'bg-green-500/30' : ''}`}
                    >
                      {data2?.map((d) => (
                        <DragList.DraggableItem key={d.id} id={d.id}>
                          {(domProps, { active, draggingInProgress }) => {
                            return (
                              <DragBox
                                domProps={domProps}
                                data={d}
                                active={active}
                                draggingInProgress={draggingInProgress}
                              />
                            );
                          }}
                        </DragList.DraggableItem>
                      ))}
                    </div>
                  );
                }}
              </DragList>
              <DragList
                orientation="vertical"
                onDrop={() => {}}
                dragListId="list3"
                removeOnDropOutside
                acceptDropsFrom={['list1']}
                onRemove={() => {}}
              >
                {(domProps) => {
                  const draggingInProgress = dropTargetListId === 'list1';

                  return (
                    <div>
                      <div>list3 - accepts drops from list1</div>
                      <div
                        {...domProps}
                        className={`${
                          domProps.className
                        } ml-30 flex flex-col gap-2  ${
                          draggingInProgress ? 'bg-green-500/30' : ''
                        }`}
                      >
                        {data2?.map((d) => (
                          <DragList.DraggableItem key={d.id} id={d.id}>
                            {(domProps, { active, draggingInProgress }) => {
                              return (
                                <DragBox
                                  domProps={domProps}
                                  data={d}
                                  active={active}
                                  draggingInProgress={draggingInProgress}
                                />
                              );
                            }}
                          </DragList.DraggableItem>
                        ))}
                      </div>
                    </div>
                  );
                }}
              </DragList>
              <div className="flex flex-col">
                <div>dragSourceListId: {dragSourceListId}</div>
                <div>dropTargetListId: {dropTargetListId}</div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-bold">data1:</h2>
                  <ul>
                    {data1?.map((d) => {
                      if (!d) {
                        debugger;
                      }
                      return <li key={d.id}>{d.id}</li>;
                    })}
                  </ul>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">data2:</h2>
                  <ul>
                    {data2?.map((d) => (
                      <li key={d.id}>{d.id}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        );
      }}
    </DragDropProvider>
  );
}
