import {
  InfiniteTable,
  DataSource,
  useInfiniteColumnEditor,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import { StyledEngineProvider } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import * as React from 'react';

type Developer = {
  birthDate: Date;
  dateHired: Date;
  id: number;
  firstName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  hobby: string;
  salary: number;
};

const DATE_FORMAT = 'YYYY-MM-DD';

const DateEditor = () => {
  const { value, confirmEdit, cancelEdit } = useInfiniteColumnEditor();

  const day = dayjs(value);

  return (
    <DatePicker
      slotProps={{
        textField: {
          sx: {
            width: '100%',
            height: '100%',
            background: 'white',
            padding: '3px',
          },
        },
      }}
      value={day}
      open
      orientation="landscape"
      format={DATE_FORMAT}
      onError={cancelEdit}
      onClose={cancelEdit}
      onAccept={(day) => {
        if (day) {
          confirmEdit(day.toDate());
        }
      }}
    />
  );
};

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName', header: 'First Name' },
  birthDate: {
    field: 'birthDate',
    header: 'Birth Date',
    // we need to specify the type of the column as "date"
    type: 'date',
  },
  dateHired: {
    field: 'dateHired',
    header: 'Date Hired',
    // we need to specify the type of the column as "date"
    type: 'date',
  },
  salary: {
    field: 'salary',
    header: 'Salary',
    type: 'number',
  },
  country: { field: 'country', header: 'Country' },
  preferredLanguage: { field: 'preferredLanguage' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const columnTypes = {
  date: {
    defaultEditable: true,
    components: {
      Editor: DateEditor,
    },
    defaultWidth: 200,
    style: ({ inEdit }: { inEdit: boolean }) => {
      return inEdit ? { padding: 0 } : {};
    },
    renderValue: ({ value }: { value: Date }) => {
      return <b>{dayjs(value).format(DATE_FORMAT)}</b>;
    },
  },
};

export default function LocalUncontrolledSingleSortingExample() {
  return (
    <>
      <StyledEngineProvider injectFirst>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DataSource<Developer> primaryKey="id" data={dataSource}>
            <InfiniteTable<Developer>
              columnTypes={columnTypes}
              columns={columns}
              columnDefaultWidth={120}
            />
          </DataSource>
        </LocalizationProvider>
      </StyledEngineProvider>
    </>
  );
}

const dataSource: Developer[] = [
  {
    id: 0,
    firstName: 'Nya',
    country: 'India',
    city: 'Unnao',
    birthDate: new Date(1997, 0, 1),
    dateHired: new Date(2023, 0, 1),
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    salary: 60000,
    hobby: 'sports',
    email: 'Nya44@gmail.com',
  },
  {
    id: 1,
    firstName: 'Axel',
    country: 'Mexico',
    city: 'Cuitlahuac',
    birthDate: new Date(1993, 3, 10),
    dateHired: new Date(2022, 5, 10),
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    salary: 100000,
    hobby: 'sports',
    email: 'Axel93@hotmail.com',
  },
  {
    id: 2,
    firstName: 'Gonzalo',
    country: 'United Arab Emirates',
    city: 'Fujairah',
    birthDate: new Date(1997, 10, 30),
    dateHired: new Date(2021, 8, 29),
    currency: 'JPY',
    preferredLanguage: 'Go',
    salary: 120000,
    hobby: 'photography',
    email: 'Gonzalo_McGlynn34@gmail.com',
  },
  {
    id: 3,
    firstName: 'Sherwood',
    country: 'Mexico',
    city: 'Tlacolula de Matamoros',
    birthDate: new Date(1990, 5, 20),
    dateHired: new Date(2021, 8, 20),
    currency: 'CHF',
    preferredLanguage: 'Rust',
    salary: 99000,
    hobby: 'cooking',
    email: 'Sherwood_McLaughlin65@hotmail.com',
  },
  {
    id: 4,
    firstName: 'Alexandre',
    country: 'France',
    city: 'Persan',
    birthDate: new Date(1990, 3, 20),
    dateHired: new Date(2023, 11, 12),
    currency: 'EUR',
    preferredLanguage: 'Go',
    salary: 97000,
    hobby: 'reading',
    email: 'Alexandre_Harber@hotmail.com',
  },
  {
    id: 5,
    firstName: 'Mariane',
    country: 'United States',
    city: 'Hays',
    birthDate: new Date(2002, 3, 20),
    dateHired: new Date(2022, 2, 22),
    currency: 'EUR',
    preferredLanguage: 'TypeScript',

    salary: 58000,
    hobby: 'cooking',
    email: 'Mariane0@hotmail.com',
  },
  {
    id: 6,
    firstName: 'Rosalind',
    country: 'Mexico',
    city: 'Nuevo Casas Grandes',
    birthDate: new Date(1992, 11, 12),
    dateHired: new Date(2022, 1, 12),
    currency: 'AUD',
    preferredLanguage: 'JavaScript',
    salary: 198000,
    hobby: 'dancing',
    email: 'Rosalind69@gmail.com',
  },
  {
    id: 7,
    firstName: 'Lolita',
    country: 'Sweden',
    city: 'Delsbo',
    birthDate: new Date(1990, 9, 5),
    dateHired: new Date(2022, 1, 5),
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    salary: 200000,
    hobby: 'cooking',
    email: 'Lolita.Hayes@hotmail.com',
  },
  {
    id: 8,
    firstName: 'Tre',
    country: 'Germany',
    city: 'Bad Camberg',
    birthDate: new Date(1990, 9, 15),
    dateHired: new Date(2022, 10, 1),
    currency: 'GBP',
    preferredLanguage: 'TypeScript',
    salary: 200000,
    hobby: 'sports',
    email: 'Tre28@gmail.com',
  },
  {
    id: 9,
    firstName: 'Lurline',
    country: 'Canada',
    city: 'Raymore',
    birthDate: new Date(1990, 4, 18),
    dateHired: new Date(2023, 3, 18),
    currency: 'EUR',
    preferredLanguage: 'Rust',
    salary: 58000,
    hobby: 'sports',
    email: 'Lurline_Deckow@gmail.com',
  },
];
