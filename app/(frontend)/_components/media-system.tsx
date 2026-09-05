import Image from "next/image";
import Link from "next/link";

import type { BusinessInfo } from "@/lib/content";
import { mediaSystem } from "../_data/site";

/**
 * The media system wheel: six petals around the company logo, one for each
 * discipline, each of them a link to that discipline's page.
 *
 * Every petal is the same rounded wedge, drawn straight into the wheel's own
 * 100x100 coordinate space at its own angle, so the ring is exact in any
 * browser and needs no client script. Each petal sits in its own full-size
 * overlay: only the drawn shape and its label take the pointer, which gives
 * every link a hit area matching the petal a visitor can actually see.
 */

/** Inner and outer radius of the ring, as a share of the wheel's width. */
const INNER = 20.5;
const OUTER = 46;
/** Half the angle one petal covers. The remainder of the 60° is the gap. */
const HALF_ANGLE = 26;
/** Corner rounding, in the same units as the radii. */
const CORNER = 4;
/** Where a petal's label sits, measured from the middle of the wheel. */
const LABEL = (INNER + OUTER) / 2;

const point = (radius: number, degrees: number) => {
  const radians = (degrees * Math.PI) / 180;
  return [50 + radius * Math.cos(radians), 50 + radius * Math.sin(radians)] as const;
};

const round = (value: number) => Math.round(value * 100) / 100;
const at = (radius: number, degrees: number) => point(radius, degrees).map(round).join(" ");

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

export function MediaSystem({ business }: { business: BusinessInfo }) {
  return (
    <div className="media-system" role="group" aria-label="Our media system">
      <div className="media-system-wheel">
        {mediaSystem.map((petal, index) => {
          // Clockwise from the top, which in SVG coordinates starts at -90°.
          const axis = -90 + (index * 360) / mediaSystem.length;
          const [labelX, labelY] = point(LABEL, axis);

          return (
            <Link className="media-petal" href={petal.href} key={petal.label}>
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <defs>
                  <linearGradient id={`petal-${index}`} x1="0" y1="0" x2="0.55" y2="1">
                    <stop offset="0%" stopColor={petal.from} />
                    <stop offset="100%" stopColor={petal.to} />
                  </linearGradient>
                </defs>
                <path d={petalPath(axis)} fill={`url(#petal-${index})`} />
              </svg>
              <span style={{ left: `${round(labelX)}%`, top: `${round(labelY)}%` }}>{petal.label}</span>
            </Link>
          );
        })}
        <span className="media-system-core">
          {business.logoUrl ? (
            <Image src={business.logoUrl} alt={business.logoAlt} width={220} height={220} />
          ) : (
            <strong>{business.initials}</strong>
          )}
        </span>
      </div>
    </div>
  );
}
