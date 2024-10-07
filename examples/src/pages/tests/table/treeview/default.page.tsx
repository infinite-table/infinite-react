import {
  InfiniteTable,
  InfiniteTableColumn,
  DataSource,
} from '@infinite-table/infinite-react';

type Building = {
  building: string;
  floor: string | null;
  office: string;
  numOccupants: string;
};

const data: Building[] = [
  { building: 'building 1', floor: 'one', office: 'A', numOccupants: '5' },
  { building: 'building 1', floor: 'one', office: 'B', numOccupants: '1' },
  { building: 'building 1', floor: 'two', office: 'F', numOccupants: '2' },
  { building: 'building 1', floor: 'two', office: 'G', numOccupants: '1' },
  { building: 'building 2', floor: 'one', office: 'A', numOccupants: '5' },
  { building: 'building 2', floor: 'one', office: 'B', numOccupants: '1' },
  { building: 'building 2', floor: 'two', office: 'X', numOccupants: '1' },
  { building: 'building 2', floor: 'two', office: 'Y', numOccupants: '3' },
  { building: 'building 3', floor: null, office: 'M', numOccupants: '2' },
  { building: 'building 3', floor: null, office: 'N', numOccupants: '1' },
];

const columns: Record<string, InfiniteTableColumn<Building>> = {
  building: {
    field: 'building',
  },
  floor: {
    field: 'floor',
  },
  office: {
    field: 'office',
  },
  numOccupants: {
    field: 'numOccupants',
  },
};

export default function Default() {
  return (
    <DataSource<Building>
      data={data}
      primaryKey="building"
      defaultGroupBy={[{ field: 'building' }, { field: 'floor' }]}
    >
      <InfiniteTable<Building>
        columns={columns}
        columnDefaultWidth={200}
        domProps={{
          style: {
            height: '90vh',
          },
        }}
      />
    </DataSource>
  );
}
