import * as React from 'react';

import {
  DraggableItem,
  DragList,
} from '@src/components/InfiniteTable/components/draggable/DragList';

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

const updatePosition = (options: {
  id: string;
  node: HTMLElement;
  offset: null | { left: number; top: number };
}) => {
  const { node, offset } = options;
  if (!offset) {
    node.style.transform = 'none';
    return;
  }

  node.style.transform = `translate3d(0px, ${offset.top}px, 0px)`;
};

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
    ? `cursor-grab ${data.id >= 10 ? 'bg-blue-300/30' : 'bg-red-300/30'}`
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
  return (
    <div
      {...domProps}
      className={`${domProps.className} ${getItemClassName(data, {
        active,
        draggingInProgress,
      })}`}
    >
      <div className="flex flex-row gap-2">
        <div>{data?.id}</div>
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

  React.useEffect(() => {
    dataSource({}).then((data) => {
      setData1(data.slice(0, 10));
      setData2(data.slice(10, 20));
    });
  }, []);

  const onDrop1 = (
    sortedIndexes: number[],
    { dragItemId, dropItemId }: { dragItemId: string; dropItemId?: string },
  ) => {
    console.log(
      'onDrop',
      sortedIndexes,
      'dragItemId',
      dragItemId,
      'dropItemId',
      dropItemId,
    );
    setData1(sortedIndexes.map((index) => data1![index]));
  };

  const onDrop2 = (sortedIndexes: number[]) => {
    setData2(sortedIndexes.map((index) => data2![index]));
  };

  return (
    <div className="flex flex-row gap-2">
      <DragList
        orientation="vertical"
        dragListId="list1"
        onDrop={onDrop1}
        updatePosition={updatePosition}
        acceptDropsFrom={['list2']}
        onAcceptDrop={({ dragItemId, dragListId }) => {
          console.log('onAcceptDrop', dragItemId, dragListId);
        }}
      >
        {(domProps) => {
          return (
            <div
              {...domProps}
              ref={domProps.ref}
              className={`${domProps.className} flex flex-col gap-2`}
            >
              {data1?.map((d) => (
                <DraggableItem key={d.id} id={d.id}>
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
                </DraggableItem>
              ))}
            </div>
          );
        }}
      </DragList>
      <DragList
        orientation="vertical"
        onDrop={onDrop2}
        dragListId="list2"
        removeOnDropOutside
        onRemove={onDrop2}
      >
        {(domProps, { draggingInProgress, draggingOutside }) => {
          return (
            <div
              {...domProps}
              className={`${domProps.className} ml-30 flex flex-col gap-2 p-2 ${
                draggingOutside ? 'bg-red-500/30' : ''
              } ${
                draggingInProgress && !draggingOutside ? 'bg-green-500/30' : ''
              }`}
            >
              {data2?.map((d) => (
                <DraggableItem key={d.id} id={d.id}>
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
                </DraggableItem>
              ))}
              {/* {draggingInProgress && (
                <DragBox
                  domProps={domProps}
                  data={undefined}
                  active={false}
                  draggingInProgress={draggingInProgress}
                />
              )} */}
            </div>
          );
        }}
      </DragList>
    </div>
  );
}
