"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { useCallback, useEffect, useId, useState } from "react";

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
 * The movement is deliberately quiet. The petals settle into the ring one after
 * another when the page opens, and pointing at one lifts it a little way out
 * while its neighbours step back and dim. Nothing is thrown off it, nothing
 * circles it, and nothing keeps moving once the wheel has settled - the shape
 * and its colours carry the band, and the animation only points at whichever
 * petal the visitor is reading. Someone who has asked for less motion gets the
 * wheel with none of it.
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

/** How far out of the ring the pointed-at petal is lifted. */
const LIFT = 2.4;
/** How far the other five step back while it is out. */
const RECOIL = 0.9;
/** How much bigger the lifted petal is, and how much smaller the others. */
const GROW = 1.05;
const SHRINK = 0.975;

const rad = (degrees: number) => (degrees * Math.PI) / 180;
const round = (value: number) => Math.round(value * 100) / 100;

const point = (radius: number, degrees: number) =>
  [50 + radius * Math.cos(rad(degrees)), 50 + radius * Math.sin(rad(degrees))] as const;

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
  const still = useReducedMotion();

  const [hovered, setHovered] = useState<number | null>(null);
  // The petals settle into the ring on load; after that they answer the
  // pointer at once, without the entrance delay still standing in the way.
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const settled = window.setTimeout(() => setEntered(true), 400 + petals.length * 80);
    return () => window.clearTimeout(settled);
  }, [petals.length]);

  const enter = useCallback((index: number) => setHovered(index), []);

  // Guarded by index, so moving straight from one petal to the next cannot
  // leave the wheel thinking nothing is pointed at.
  const leave = useCallback(
    (index: number) => setHovered((current) => (current === index ? null : current)),
    [],
  );
  const leaveAll = useCallback(() => setHovered(null), []);

  const settle: Transition = still
    ? { duration: 0 }
    : { type: "spring", stiffness: 260, damping: 26, mass: 0.6 };

  return (
    <div className="media-system" role="group" aria-label="Our media system">
      <div className="media-system-wheel" onMouseLeave={leaveAll}>
        {petals.map((petal, index) => {
          // Clockwise from the top, which in SVG coordinates starts at -90°.
          const axis = -90 + (index * 360) / petals.length;
          const active = hovered === index;
          const away = hovered !== null && !active;
          const shift = active ? LIFT : away ? -RECOIL : 0;
          const scale = active ? GROW : away ? SHRINK : 1;
          // The label rides the petal: the wedge grows about the middle of the
          // wheel, so the label's distance from it grows by the same amount.
          const [labelX, labelY] = point(LABEL * scale + shift, axis);
          // Where it sits at rest. Written as plain styles as well, so the
          // label is in the right place in the page the server sends, before
          // any of this has been asked to run.
          const [restX, restY] = point(LABEL, axis);
          const shape = petalPath(axis);

          const flight: Transition =
            entered || still
              ? settle
              : { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.08 * index };

          return (
            <Link
              className={`media-petal${active ? " is-active" : ""}${away ? " is-away" : ""}`}
              href={petal.href}
              key={petal.label}
              onMouseEnter={() => enter(index)}
              onMouseLeave={() => leave(index)}
              onFocus={() => enter(index)}
              onBlur={() => leave(index)}
            >
              <motion.svg
                viewBox="0 0 100 100"
                aria-hidden="true"
                initial={still ? false : { scale: 0.94, opacity: 0, x: "0%", y: "0%" }}
                animate={{
                  scale,
                  opacity: away ? 0.72 : 1,
                  x: `${round(Math.cos(rad(axis)) * shift)}%`,
                  y: `${round(Math.sin(rad(axis)) * shift)}%`,
                }}
                transition={flight}
              >
                <defs>
                  <linearGradient id={`${gradient}-${index}`} x1="0" y1="0" x2="0.55" y2="1">
                    <stop offset="0%" stopColor={petal.from} />
                    <stop offset="100%" stopColor={petal.to} />
                  </linearGradient>
                </defs>
                <path d={shape} fill={`url(#${gradient}-${index})`} />
                {/* The wedge being read lightens, so the eye lands on it
                    without anything having to move across the page. */}
                <motion.path
                  d={shape}
                  fill="#fff"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: active ? 0.14 : 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                />
              </motion.svg>
              <motion.span
                style={{ left: `${round(restX)}%`, top: `${round(restY)}%` }}
                initial={still ? false : { opacity: 0, x: "-50%", y: "-50%" }}
                animate={{
                  left: `${round(labelX)}%`,
                  top: `${round(labelY)}%`,
                  opacity: away ? 0.78 : 1,
                  scale: active ? 1.06 : 1,
                  x: "-50%",
                  y: "-50%",
                }}
                transition={flight}
              >
                {petal.label}
              </motion.span>
            </Link>
          );
        })}

        {/* Centred by half its own width, which framer motion has to be told
            about: it writes the whole transform, so a translate left in the
            stylesheet would simply be overwritten. */}
        <motion.span
          className="media-system-core"
          animate={{ scale: hovered === null ? 1 : 1.04, x: "-50%", y: "-50%" }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          {logoUrl ? (
            <Image src={logoUrl} alt={logoAlt} width={220} height={220} />
          ) : (
            <strong>{initials}</strong>
          )}
        </motion.span>
      </div>
    </div>
  );
}
