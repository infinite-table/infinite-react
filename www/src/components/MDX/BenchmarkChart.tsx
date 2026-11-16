import * as React from 'react';

import styles from './BenchmarkChart.module.css';

export type BenchmarkChartRow = {
  /** what is measured, e.g. "First rows painted, 300k rows" */
  label: string;
  /** a grid that was not measured for this row has no value */
  mui?: number;
  ag?: number;
  tanstack?: number;
  infinite?: number;
  /** short remark shown next to the label, e.g. "no significant difference" */
  note?: string;
};

export type BenchmarkChartProps = {
  title: string;
  /** e.g. "median of 7 runs" - "lower/higher is better" is appended */
  subtitle?: string;
  /** all the rows of a chart share one unit and one scale */
  unit: string;
  better?: 'lower' | 'higher';
  rows: BenchmarkChartRow[];
};

// in this order everywhere: the colors were checked next to each other
const SERIES = [
  { key: 'mui', name: 'MUI X Data Grid' },
  { key: 'ag', name: 'AG Grid' },
  { key: 'tanstack', name: 'TanStack Table' },
  { key: 'infinite', name: 'Infinite Table' },
] as const;

function formatValue(value: number, unit: string) {
  const abs = Math.abs(value);
  const text = value.toLocaleString('en-US', {
    maximumFractionDigits: abs >= 100 ? 0 : abs >= 10 ? 1 : 2,
  });
  return unit === '%' ? `${text}%` : `${text} ${unit}`;
}

function compare(value: number, other: number, otherName: string) {
  if (value === other) {
    return `same as ${otherName}`;
  }
  if (!other) {
    return `${otherName}: 0`;
  }
  const pct = Math.round((Math.abs(value - other) / other) * 100);
  return `${pct}% ${value < other ? 'lower' : 'higher'} than ${otherName}`;
}

/**
 * Grouped horizontal bars comparing Infinite Table with other grids on a few
 * metrics that share a unit - for the benchmark page and blog posts. A chart
 * shows the grids that have a value in at least one of its rows.
 *
 * Rendered on the server, no client JS: the values are printed at the bar
 * ends, the hover/focus tooltip is CSS-only and every chart has a table view.
 */
export function BenchmarkChart(props: BenchmarkChartProps) {
  const { title, subtitle, unit, better = 'lower', rows } = props;
  const series = SERIES.filter((s) => rows.some((row) => row[s.key] != null));
  const max = Math.max(
    ...rows.flatMap((row) => series.map((s) => row[s.key] ?? 0)),
    0,
  );
  const caption = [subtitle, `${better} is better`].filter(Boolean).join(' · ');
  // with more than two grids, every bar has the name of its grid next to it
  const named = series.length > 2;

  return (
    <figure className={styles.root}>
      <figcaption className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{caption}</div>
      </figcaption>

      <div className={styles.legend} aria-hidden="true">
        {series.map((s) => (
          <span key={s.key} className={styles.legendItem}>
            <span className={`${styles.swatch} ${styles[s.key]}`} />
            {s.name}
          </span>
        ))}
      </div>

      <div className={styles.rows}>
        {rows.map((row) => (
          <div key={row.label} className={styles.row}>
            <div className={styles.rowLabel}>
              <span>{row.label}</span>
              {row.note ? (
                <span className={styles.note}>{row.note}</span>
              ) : null}
            </div>
            <div className={styles.bars}>
              {series.map((current) => {
                const value = row[current.key];
                if (value == null) {
                  return null;
                }
                const formatted = formatValue(value, unit);
                return (
                  <div
                    key={current.key}
                    className={`${styles.bar} ${named ? styles.named : ''}`}
                    tabIndex={0}
                    aria-label={`${row.label} - ${current.name}: ${formatted}`}
                  >
                    {named ? (
                      <span className={styles.name}>{current.name}</span>
                    ) : null}
                    <span
                      className={`${styles.fill} ${styles[current.key]}`}
                      style={
                        {
                          '--bc-fraction': max ? value / max : 0,
                        } as React.CSSProperties
                      }
                    />
                    <span className={styles.value}>{formatted}</span>
                    <span className={styles.tooltip} role="tooltip">
                      <strong>{formatted}</strong>
                      <span className={styles.tooltipSeries}>
                        <span
                          className={`${styles.lineKey} ${styles[current.key]}`}
                        />
                        {current.name}
                      </span>
                      <span className={styles.tooltipDetail}>{row.label}</span>
                      {series.map((other) => {
                        const otherValue = row[other.key];
                        return other.key === current.key ||
                          otherValue == null ? null : (
                          <span
                            key={other.key}
                            className={styles.tooltipDetail}
                          >
                            {compare(value, otherValue, other.name)}
                          </span>
                        );
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <details className={styles.tableView}>
        <summary>View as table</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">{title}</th>
              {series.map((s) => (
                <th key={s.key} scope="col">
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">
                  {row.label}
                  {row.note ? ` (${row.note})` : ''}
                </th>
                {series.map((s) => {
                  const value = row[s.key];
                  return (
                    <td key={s.key}>
                      {value == null ? '–' : formatValue(value, unit)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
