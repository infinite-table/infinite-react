import * as React from 'react';

import styles from './BenchmarkChart.module.css';

export type BenchmarkChartRow = {
  /** what is measured, e.g. "First rows painted, 300k rows" */
  label: string;
  ag: number;
  infinite: number;
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

const SERIES = [
  { key: 'ag', name: 'AG Grid' },
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
 * Paired horizontal bars comparing AG Grid and Infinite Table on a few
 * metrics that share a unit - for the benchmark blog posts.
 *
 * Rendered on the server, no client JS: the values are printed at the bar
 * ends, the hover/focus tooltip is CSS-only and every chart has a table view.
 */
export function BenchmarkChart(props: BenchmarkChartProps) {
  const { title, subtitle, unit, better = 'lower', rows } = props;
  const max = Math.max(...rows.flatMap((row) => [row.ag, row.infinite]), 0);
  const caption = [subtitle, `${better} is better`].filter(Boolean).join(' · ');

  return (
    <figure className={styles.root}>
      <figcaption className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{caption}</div>
      </figcaption>

      <div className={styles.legend} aria-hidden="true">
        {SERIES.map((series) => (
          <span key={series.key} className={styles.legendItem}>
            <span className={`${styles.swatch} ${styles[series.key]}`} />
            {series.name}
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
              {SERIES.map((series, index) => {
                const value = row[series.key];
                const other = SERIES[1 - index];
                const formatted = formatValue(value, unit);
                return (
                  <div
                    key={series.key}
                    className={styles.bar}
                    tabIndex={0}
                    aria-label={`${row.label} - ${series.name}: ${formatted}`}
                  >
                    <span
                      className={`${styles.fill} ${styles[series.key]}`}
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
                          className={`${styles.lineKey} ${styles[series.key]}`}
                        />
                        {series.name}
                      </span>
                      <span className={styles.tooltipDetail}>{row.label}</span>
                      <span className={styles.tooltipDetail}>
                        {compare(value, row[other.key], other.name)}
                      </span>
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
              {SERIES.map((series) => (
                <th key={series.key} scope="col">
                  {series.name}
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
                <td>{formatValue(row.ag, unit)}</td>
                <td>{formatValue(row.infinite, unit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
