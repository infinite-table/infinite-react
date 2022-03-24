import {
  DataSourceGroupBy,
  DataSourcePivotBy,
} from '@infinite-table/infinite-react';

export type ReducerOptions = 'min' | 'max' | 'avg';

export type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
  streetName: string;
  streetNo: number;
  streetPrefix: string;
};

export type GroupByDeveloperType =
  DataSourceGroupBy<Developer>[];
export type PivotByDeveloperType =
  DataSourcePivotBy<Developer>[];
