"use client";

import React from "react";

/**
 * Ninety days of traffic, drawn as an area with the period before it behind.
 *
 * The comparison is the point of the chart. A line on its own says "some people
 * came"; the same line against the fortnight before it says whether the work
 * being done in this dashboard is making any difference, which is the only
 * question an owner actually has.
 *
 * The whole series is handed over once, so changing the range is arithmetic in
 * the browser rather than another trip to the database.
 */

type Point = { date: string; count: number };

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/** A rounded path through the points, in a 0-100 by 0-40 box. */
const shape = (values: number[], peak: number): string => {
  if (values.length < 2) return "";
  const step = 100 / (values.length - 1);
  return values
    .map((value, index) => {
      const x = index * step;
      const y = 38 - (value / peak) * 34;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
};

export function TrafficChart({ series }: { series: Point[] }) {
  const [days, setDays] = React.useState(30);
  const [hover, setHover] = React.useState<number | null>(null);

  const window_ = series.slice(-days);
  const before = series.slice(-days * 2, -days);
  const total = window_.reduce((sum, point) => sum + point.count, 0);
  const wasTotal = before.reduce((sum, point) => sum + point.count, 0);
  const peak = Math.max(1, ...window_.map((point) => point.count), ...before.map((point) => point.count));

  const line = shape(window_.map((point) => point.count), peak);
  const pastLine = before.length === window_.length ? shape(before.map((point) => point.count), peak) : "";
  const area = line ? `${line} L100,40 L0,40 Z` : "";

  const change = wasTotal > 0 ? Math.round(((total - wasTotal) / wasTotal) * 100) : null;
  const point = hover === null ? null : window_[hover];

  return (
    <div className="ns-chart">
      <div className="ns-chart__head">
        <div className="ns-chart__figure">
          <strong>{total.toLocaleString("en-GB")}</strong>
          <span>
            {point
              ? `${point.count.toLocaleString("en-GB")} on ${day(point.date)}`
              : `visits in the last ${days} days`}
          </span>
        </div>
        <div className="ns-chart__ranges" role="group" aria-label="How far back to look">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              className={`ns-chart__range${range.days === days ? " is-active" : ""}`}
              aria-pressed={range.days === days}
              onClick={() => {
                setDays(range.days);
                setHover(null);
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ns-chart__plot">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label={`${total} visits over ${days} days`}>
          <defs>
            <linearGradient id="ns-chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ns-chart-ink)" stopOpacity="0.34" />
              <stop offset="100%" stopColor="var(--ns-chart-ink)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[10, 20, 30].map((y) => (
            <line key={y} className="ns-chart__grid" x1="0" x2="100" y1={y} y2={y} />
          ))}
          {pastLine ? <path className="ns-chart__past" d={pastLine} /> : null}
          {area ? <path className="ns-chart__area" d={area} fill="url(#ns-chart-fill)" /> : null}
          {line ? <path className="ns-chart__line" d={line} /> : null}
          {point && hover !== null ? (
            <line
              className="ns-chart__cursor"
              x1={(hover / Math.max(1, window_.length - 1)) * 100}
              x2={(hover / Math.max(1, window_.length - 1)) * 100}
              y1="0"
              y2="40"
            />
          ) : null}
        </svg>

        {/* One hit area per day, so a day can be read without any maths on
            pointer coordinates - and so the chart still works from a keyboard. */}
        <div className="ns-chart__hits" onMouseLeave={() => setHover(null)}>
          {window_.map((entry, index) => (
            <button
              key={entry.date}
              type="button"
              className={`ns-chart__hit${hover === index ? " is-on" : ""}`}
              onMouseEnter={() => setHover(index)}
              onFocus={() => setHover(index)}
              onBlur={() => setHover(null)}
              aria-label={`${day(entry.date)}: ${entry.count} visits`}
              title={`${day(entry.date)}: ${entry.count.toLocaleString("en-GB")}`}
            />
          ))}
        </div>
      </div>

      <div className="ns-chart__foot">
        <span>{window_.length > 0 ? day(window_[0].date) : ""}</span>
        <span className="ns-chart__legend">
          {change === null ? (
            "Nothing to compare with yet"
          ) : (
            <>
              <i className="ns-chart__swatch ns-chart__swatch--now" />
              this period
              <i className="ns-chart__swatch ns-chart__swatch--past" />
              the {days} days before ({change > 0 ? "+" : ""}
              {change}%)
            </>
          )}
        </span>
        <span>{window_.length > 0 ? day(window_[window_.length - 1].date) : ""}</span>
      </div>
    </div>
  );
}

export default TrafficChart;
