import { Component, computed, input } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  renderComponent,
} from '@infinite-table/infinite-angular';
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

type Employee = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
  bugFixes: number[];
  streetName: string;
  streetPrefix: string;
  streetNo: string;
  department: string;
  team: string;
  salary: number;
  currency: number;
  age: number;
  email: string;
};

// the drawing width - the svg is stretched to the cell width
const WIDTH = 240;
const MARGIN = 2;

type Point = { x: number; y: number };

const toPoints = (points: Point[]) =>
  points.map(({ x, y }) => `${x},${y}`).join(' ');

/**
 * A small inline-SVG sparkline: a line over the values,
 * with the area below it lightly filled
 */
@Component({
  selector: 'sparkline',
  host: { style: 'display: contents' },
  template: `
    <svg
      style="width: 100%"
      [attr.viewBox]="viewBox()"
      preserveAspectRatio="none"
    >
      <polyline
        [attr.points]="areaPoints()"
        [attr.fill]="color()"
        fill-opacity="0.1"
        stroke="none"
      />
      <polyline
        [attr.points]="linePoints()"
        [attr.stroke]="color()"
        stroke-width="1"
        stroke-linejoin="round"
        stroke-linecap="round"
        fill="none"
      />
    </svg>
  `,
})
class Sparkline {
  readonly values = input.required<number[]>();
  readonly color = input('slategray');
  readonly height = input(60);

  protected readonly viewBox = computed(() => `0 0 ${WIDTH} ${this.height()}`);

  private readonly points = computed((): Point[] => {
    const values = this.values();
    const height = this.height();
    const min = Math.min(...values);
    const max = Math.max(...values);
    const xStep = (WIDTH - MARGIN * 2) / Math.max(values.length - 1, 1);
    const yStep = (height - MARGIN * 2) / (max - min || 2);

    return values.map((value, index) => ({
      x: index * xStep + MARGIN,
      y: (max === min ? 1 : max - value) * yStep + MARGIN,
    }));
  });

  protected readonly linePoints = computed(() => toPoints(this.points()));

  // the line, closed along the bottom edge
  protected readonly areaPoints = computed(() => {
    const points = this.points();
    const bottom = this.height() - MARGIN;
    return toPoints([
      ...points,
      { x: points[points.length - 1].x, y: bottom },
      { x: MARGIN, y: bottom },
      { x: MARGIN, y: points[0].y },
    ]);
  });
}

const columns: Record<string, InfiniteTableColumn<Employee>> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  country: {
    field: 'country',
    header: 'Country',
    columnGroup: 'location',
  },
  bugFixes: {
    field: 'bugFixes',
    header: 'Bug Fixes',
    defaultWidth: 300,
    renderValue: ({ value, data }) => {
      const color =
        data?.department === 'IT' || data?.department === 'Management'
          ? 'tomato'
          : '#253e56';
      return renderComponent(Sparkline, {
        inputs: { values: value, color, height: 30 },
      });
    },
  },
  city: {
    field: 'city',
    header: 'City',
    columnGroup: 'address',
  },
  salary: {
    field: 'salary',
    type: 'number',
    header: 'Salary',
  },
  department: {
    field: 'department',
    header: 'Department',
  },
  team: {
    field: 'team',
    header: 'Team',
  },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees10k')
    .then((r) => r.json())
    .then((data: Employee[]) => {
      return data.map((employee) => {
        return {
          ...employee,
          bugFixes: [...Array(10)].map(() => Math.round(Math.random() * 100)),
        };
      });
    });
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        debugId="using-sparklines-example"
        [columns]="columns"
        [columnDefaultWidth]="150"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
}
