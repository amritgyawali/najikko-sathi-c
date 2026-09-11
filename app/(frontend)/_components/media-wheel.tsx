import Image from "next/image";
import Link from "next/link";
import { useId, type CSSProperties } from "react";

/**
 * The media system wheel: six petals around the company logo, one for each
 * discipline, each of them a link to that discipline's page.
 *
 * Every petal is the same rounded wedge, drawn straight into the wheel's own
 * 100x100 coordinate space at its own angle, so the ring is exact in any
 * browser. Each petal sits in its own full-size overlay: only the drawn shape
 * and its label take the pointer, which gives every link a hit area matching
 * the petal a visitor can actually see.
 *
 * Each petal is drawn as a solid slab rather than a flat shape: a darkened copy
 * of the wedge sits behind the face, offset outwards, and the sliver showing
 * between the two reads as its side wall. A sheen runs down the face and a thin
 * lit edge runs round it.
 *
 * The movement is kept simple and lives entirely in the stylesheet: the petals
 * fade in one after another when the page opens, and the one being pointed at
 * brightens a little and sharpens its edge. Nothing moves out of the ring,
 * nothing is thrown off it, and nothing springs back, so the wheel holds its
 * shape the whole time. Someone who has asked for less motion gets the wheel
 * with no fade at all.
 */

export type WheelPetal = { label: string; href: string; from: string; to: string };

/** Inner and outer radius of the ring, as a share of the wheel's width. */
const INNER = 20.5;
const OUTER = 46;
/** Half the angle one petal covers. The remainder of the 60° is the gap. */
const HALF_ANGLE = 26;
/** Corner rounding, in the same units as the radii. */
const CORNER = 4;
/** Where a petal's label sits, measured from the middle of the wheel. */
const LABEL = (INNER + OUTER) / 2;
/** How much of the side wall shows beyond the face. */
const DEPTH = 1.1;

const rad = (degrees: number) => (degrees * Math.PI) / 180;
const round = (value: number) => Math.round(value * 100) / 100;

const point = (radius: number, degrees: number) =>
  [50 + radius * Math.cos(rad(degrees)), 50 + radius * Math.sin(rad(degrees))] as const;

const at = (radius: number, degrees: number) => point(radius, degrees).map(round).join(" ");

/** Darkens (negative) or lightens (positive) a colour from the wheel's data. */
function shade(hex: string, amount: number): string {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.replace(/(.)/g, "$1$1") : value;
  const channels = [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16));
  const mixed = channels.map((channel) =>
    Math.max(0, Math.min(255, Math.round(amount < 0 ? channel * (1 + amount) : channel + (255 - channel) * amount))),
  );
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * One petal: an arc along the outer edge, an arc back along the inner edge,
 * and a rounded corner where each pair of edges meets.
 */
function petalPath(axis: number): string {
  // How far round each arc has to stop short to leave room for the corner.
  const outerInset = (CORNER / OUTER) * (180 / Math.PI);
  const innerInset = (CORNER / INNER) * (180 / Math.PI);
  const [from, to] = [axis - HALF_ANGLE, axis + HALF_ANGLE];

  return [
    `M ${at(OUTER, from + outerInset)}`,
    `A ${OUTER} ${OUTER} 0 0 1 ${at(OUTER, to - outerInset)}`,
    `Q ${at(OUTER, to)} ${at(OUTER - CORNER, to)}`,
    `L ${at(INNER + CORNER, to)}`,
    `Q ${at(INNER, to)} ${at(INNER, to - innerInset)}`,
    `A ${INNER} ${INNER} 0 0 0 ${at(INNER, from + innerInset)}`,
    `Q ${at(INNER, from)} ${at(INNER + CORNER, from)}`,
    `L ${at(OUTER - CORNER, from)}`,
    `Q ${at(OUTER, from)} ${at(OUTER, from + outerInset)}`,
    "Z",
  ].join(" ");
}

export function MediaWheel({
  petals,
  logoUrl,
  logoAlt,
  initials,
}: {
  petals: WheelPetal[];
  logoUrl: string | null;
  logoAlt: string;
  initials: string;
}) {
  const gradient = useId().replace(/[^a-zA-Z0-9-]/g, "");

  return (
    <div className="media-system" role="group" aria-label="Our media system">
      <div className="media-system-wheel">
        {petals.map((petal, index) => {
          // Clockwise from the top, which in SVG coordinates starts at -90°.
          const axis = -90 + (index * 360) / petals.length;
          const [labelX, labelY] = point(LABEL, axis);
          const shape = petalPath(axis);
          const wallX = round(Math.cos(rad(axis)) * DEPTH);
          const wallY = round(Math.sin(rad(axis)) * DEPTH);

          return (
            <Link
              className="media-petal"
              href={petal.href}
              key={petal.label}
              // Read by the stylesheet to fade the petals in one after another.
              style={{ "--petal-index": index } as CSSProperties}
            >
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <defs>
                  <linearGradient id={`${gradient}-face-${index}`} x1="0" y1="0" x2="0.55" y2="1">
                    <stop offset="0%" stopColor={petal.from} />
                    <stop offset="100%" stopColor={petal.to} />
                  </linearGradient>
                  <linearGradient id={`${gradient}-gloss-${index}`} x1="0" y1="0" x2="0.35" y2="1">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.42" />
                    <stop offset="45%" stopColor="#fff" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.14" />
                  </linearGradient>
                </defs>
                {/* The side wall, pushed out behind the face. */}
                <path
                  d={shape}
                  fill={shade(petal.to, -0.45)}
                  transform={`translate(${wallX} ${wallY})`}
                />
                <path d={shape} fill={`url(#${gradient}-face-${index})`} />
                <path d={shape} fill={`url(#${gradient}-gloss-${index})`} />
                {/* Lightens the petal being pointed at. */}
                <path className="media-petal-sheen" d={shape} fill="#fff" />
                <path
                  className="media-petal-rim"
                  d={shape}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={0.6}
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ left: `${round(labelX)}%`, top: `${round(labelY)}%` }}>
                {petal.label}
              </span>
            </Link>
          );
        })}

        <span className="media-system-core">
          {logoUrl ? (
            <Image src={logoUrl} alt={logoAlt} width={220} height={220} />
          ) : (
            <strong>{initials}</strong>
          )}
        </span>
      </div>
    </div>
  );
}
