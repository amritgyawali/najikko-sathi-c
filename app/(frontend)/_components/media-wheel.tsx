"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "framer-motion";
import { useCallback, useEffect, useId, useState } from "react";

/**
 * The media system wheel: six petals around the company logo, one for each
 * discipline, each of them a link to that discipline's page.
 *
 * Every petal is the same rounded wedge, drawn straight into the wheel's own
 * 100x100 coordinate space at its own angle, so the ring is exact in any
 * browser. Each petal is a solid slab rather than a flat shape: a darkened
 * copy of the wedge sits behind the face, offset outwards, and the sliver left
 * showing between the two reads as the side wall of something with thickness.
 *
 * Pointing at a petal sets it off. The slab swings up out of the ring towards
 * the reader - tipping about its own edge, deepening as it comes, catching a
 * white rim and a sheen down its face - and the wedge blows apart: a blast
 * front in the petal's own outline runs outwards, and darts, splinters and
 * chips are thrown off the outer edge in the petal's colour, spinning as they
 * go. The other five give way, dim, and tip back into the page. Nothing thrown
 * is round: every piece is a shard.
 *
 * On load the six petals bloom out of the middle one after another. All of it
 * is drawn in the wheel's own coordinate space, so the whole display scales
 * with the wheel and reads the same on a phone as on a desktop, and a visitor
 * who has asked for less motion gets the wheel with none of it - the petals
 * answer the pointer, and nothing is thrown.
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

/** How far out of the ring the pointed-at petal is thrown. */
const BLAST = 3.6;
/** How far the other five give way while it is out. */
const RECOIL = 1.4;
/** How much bigger the thrown petal is, and how much smaller the others. */
const GROW = 1.075;
const SHRINK = 0.955;
/** How far the thrown petal comes towards the reader, in pixels. */
const LIFT = 54;
/** How far it tips towards them, and how far the others tip away, in degrees. */
const TILT = 16;
const TIP_BACK = 5;
/** The side wall of the slab, at rest and while a petal is out. */
const DEPTH = 1.1;
const DEPTH_OUT = 2.5;
/** Pieces thrown off the outer edge of a petal as it goes. */
const SHARDS = 26;
/** How long a burst stays on screen before it is taken off the wheel. */
const BURST_MS = 1400;

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

/**
 * A repeatable number between 0 and 1. The shards have to differ from one
 * another without differing between renders, so their spread, size, spin and
 * reach are derived from a seed rather than drawn at random.
 */
function noise(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * One piece of a petal, drawn about the origin and already turned to face the
 * way it is being thrown. Three kinds, so a spray does not read as one shape
 * repeated twenty times - and not one of them is round.
 */
function shardPath(kind: number, size: number, angle: number): string {
  const along = Math.cos(rad(angle));
  const alongY = Math.sin(rad(angle));
  const across = -alongY;
  const acrossY = along;

  const corner = (out: number, side: number) =>
    `${round(along * out + across * side)} ${round(alongY * out + acrossY * side)}`;

  // A dart: a long point ahead, two barbs trailing behind it.
  if (kind === 0) {
    return `M ${corner(size * 2.3, 0)} L ${corner(-size * 0.9, size * 0.8)} L ${corner(-size * 0.25, 0)} L ${corner(-size * 0.9, -size * 0.8)} Z`;
  }
  // A splinter: a thin four-sided sliver of the wedge.
  if (kind === 1) {
    return `M ${corner(size * 2, 0)} L ${corner(0, size * 0.4)} L ${corner(-size * 1.6, 0)} L ${corner(0, -size * 0.4)} Z`;
  }
  // A chip: a small ragged triangle off a corner.
  return `M ${corner(size * 1.3, size * 0.25)} L ${corner(-size * 0.7, size * 0.95)} L ${corner(-size * 0.55, -size * 0.75)} Z`;
}

/** Turns and grows about its own middle rather than about the wheel's. */
const OWN_CENTRE = { transformBox: "fill-box", transformOrigin: "center" } as const;

/** The blast front and the shards thrown by one petal, played once. */
function Burst({ axis, petal }: { axis: number; petal: WheelPetal }) {
  const shape = petalPath(axis);
  const bright = shade(petal.from, 0.35);

  return (
    <g>
      {/*
        The blast front: the petal's own outline, run outwards and faded - the
        shape of the thing that went off rather than a ring around it, so the
        eye reads it as this petal blowing out and not as a halo. The solid
        wave carries the colour and the drawn one the edge.
      */}
      <motion.path
        d={shape}
        fill={petal.from}
        style={{ transformBox: "view-box", transformOrigin: "50px 50px" }}
        initial={{ scale: 1, opacity: 0.45 }}
        animate={{ scale: 1.2, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.45,
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.45, ease: "easeIn" },
        }}
      />
      <motion.path
        d={shape}
        fill="none"
        stroke={petal.from}
        strokeWidth={1.5}
        strokeLinejoin="round"
        style={{ transformBox: "view-box", transformOrigin: "50px 50px" }}
        initial={{ scale: 1, opacity: 0.9 }}
        animate={{ scale: 1.46, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.7,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.03,
          opacity: { duration: 0.7, ease: "linear" },
        }}
      />

      {Array.from({ length: SHARDS }, (_, index) => {
        // Fanned across the petal's own width and thrown straight outwards.
        const spread = (noise(index * 3 + 1) - 0.5) * 2.4 * HALF_ANGLE;
        const angle = axis + spread;
        const reach = 6 + noise(index * 7 + 3) * 14;
        const size = 1.5 + noise(index * 11 + 5) * 2.2;
        const flight = 0.7 + noise(index * 13 + 7) * 0.5;
        const spin = (noise(index * 17 + 11) - 0.5) * 260;
        // Thrown from the outer edge of the petal as it stands while it is
        // out - not from where it sits at rest, which is under the slab by
        // then - and from somewhere along that edge rather than one spot.
        const [fromX, fromY] = point(OUTER * GROW + BLAST + noise(index * 19 + 13) * 3, angle);
        const kind = index % 3;

        return (
          <g key={index} transform={`translate(${round(fromX)} ${round(fromY)})`}>
            <motion.g
              style={OWN_CENTRE}
              initial={{ x: 0, y: 0, rotate: 0, scale: 0.5, opacity: 1 }}
              animate={{
                x: round(Math.cos(rad(angle)) * reach),
                y: round(Math.sin(rad(angle)) * reach),
                rotate: spin,
                scale: [0.55, 1.15, 0.6],
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              /*
               * The throw is fastest at the moment it leaves the petal and
               * slows as it goes, which is what makes it read as thrown
               * rather than slid. Fading on that same curve would take the
               * shard off screen in the first eighth of a second, so the fade
               * and the tumble keep their own even timing and the piece stays
               * legible for the whole flight.
               */
              transition={{
                duration: flight,
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: flight, ease: "linear", times: [0, 0.62, 1] },
                scale: { duration: flight, ease: "easeOut", times: [0, 0.3, 1] },
                rotate: { duration: flight, ease: "easeOut" },
              }}
            >
              {/* A dark edge, so a shard still reads as a solid chip of the
                  petal when it crosses a photograph rather than the page. */}
              <path
                d={shardPath(kind, size, angle)}
                fill={kind === 2 ? bright : petal.from}
                stroke={shade(petal.to, -0.35)}
                strokeWidth={0.22}
                strokeLinejoin="round"
              />
            </motion.g>
          </g>
        );
      })}
    </g>
  );
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
  // Counted rather than flagged, so pointing at the same petal twice plays the
  // burst twice instead of leaving the first one on screen.
  const [burst, setBurst] = useState<{ index: number; key: number } | null>(null);
  // The petals settle into the ring on load; after that they answer the
  // pointer at once, without the entrance delay still standing in the way.
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const settled = window.setTimeout(() => setEntered(true), 400 + petals.length * 80);
    return () => window.clearTimeout(settled);
  }, [petals.length]);

  const enter = useCallback(
    (index: number) => {
      setHovered(index);
      if (!still) setBurst((current) => ({ index, key: (current?.key ?? 0) + 1 }));
    },
    [still],
  );

  // Guarded by index, so moving straight from one petal to the next cannot
  // leave the wheel thinking nothing is pointed at.
  const leave = useCallback(
    (index: number) => setHovered((current) => (current === index ? null : current)),
    [],
  );
  const leaveAll = useCallback(() => setHovered(null), []);

  // A burst is played once and taken off; it is not tied to the pointer still
  // being there, so leaving mid-flight lets it finish rather than cutting it.
  useEffect(() => {
    if (!burst) return;
    const done = window.setTimeout(() => setBurst(null), BURST_MS);
    return () => window.clearTimeout(done);
  }, [burst]);

  const settle: Transition = still
    ? { duration: 0 }
    : { type: "spring", stiffness: 240, damping: 22, mass: 0.7 };

  return (
    <div className="media-system" role="group" aria-label="Our media system">
      <div className="media-system-wheel" onMouseLeave={leaveAll}>
        {petals.map((petal, index) => {
          // Clockwise from the top, which in SVG coordinates starts at -90°.
          const axis = -90 + (index * 360) / petals.length;
          const active = hovered === index;
          const away = hovered !== null && !active;
          const shift = active ? BLAST : away ? -RECOIL : 0;
          const scale = active ? GROW : away ? SHRINK : 1;
          const shape = petalPath(axis);
          const [labelX, labelY] = point(LABEL, axis);
          const depth = active ? DEPTH_OUT : DEPTH;

          // Tipping the slab towards the reader means turning it about the
          // line across its own axis. Composed out of the two turns a browser
          // offers: about the horizontal by sin, about the vertical by -cos.
          const tip = still ? 0 : active ? TILT : away ? -TIP_BACK : 0;

          const flight: Transition =
            entered || still
              ? settle
              : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.08 * index };

          return (
            <motion.div
              className={`media-petal${active ? " is-active" : ""}${away ? " is-away" : ""}`}
              key={petal.label}
              initial={still ? false : { scale: 0.62, opacity: 0, x: "0%", y: "0%" }}
              animate={{
                scale,
                opacity: away ? 0.74 : 1,
                x: `${round(Math.cos(rad(axis)) * shift)}%`,
                y: `${round(Math.sin(rad(axis)) * shift)}%`,
                z: still ? 0 : active ? LIFT : away ? -18 : 0,
                rotateX: round(tip * Math.sin(rad(axis))),
                rotateY: round(-tip * Math.cos(rad(axis))),
              }}
              transition={flight}
            >
              <Link
                className="media-petal-link"
                href={petal.href}
                onMouseEnter={() => enter(index)}
                onMouseLeave={() => leave(index)}
                onFocus={() => enter(index)}
                onBlur={() => leave(index)}
              >
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <defs>
                    <linearGradient id={`${gradient}-face-${index}`} x1="0" y1="0" x2="0.55" y2="1">
                      <stop offset="0%" stopColor={petal.from} />
                      <stop offset="100%" stopColor={petal.to} />
                    </linearGradient>
                    {/* The sheen down the face, which is what makes a flat
                        fill read as a surface catching the light. */}
                    <linearGradient id={`${gradient}-gloss-${index}`} x1="0" y1="0" x2="0.35" y2="1">
                      <stop offset="0%" stopColor="#fff" stopOpacity="0.42" />
                      <stop offset="45%" stopColor="#fff" stopOpacity="0.06" />
                      <stop offset="100%" stopColor="#000" stopOpacity="0.14" />
                    </linearGradient>
                  </defs>

                  {/* The side wall: the same wedge, pushed out behind the face.
                      What shows between the two is the thickness of the slab,
                      and it deepens as the petal comes towards the reader. */}
                  <motion.path
                    d={shape}
                    fill={shade(petal.to, -0.45)}
                    animate={{
                      x: round(Math.cos(rad(axis)) * depth),
                      y: round(Math.sin(rad(axis)) * depth),
                    }}
                    transition={flight}
                  />
                  <path d={shape} fill={`url(#${gradient}-face-${index})`} />
                  <path d={shape} fill={`url(#${gradient}-gloss-${index})`} />

                  {/* The wedge being read lightens and picks up a lit edge, so
                      the eye lands on it without anything having to move. */}
                  <motion.path
                    d={shape}
                    fill="#fff"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: active ? 0.16 : 0 }}
                    transition={{ duration: 0.26, ease: "easeOut" }}
                  />
                  <motion.path
                    d={shape}
                    fill="none"
                    stroke="#fff"
                    strokeWidth={0.6}
                    strokeLinejoin="round"
                    initial={{ opacity: 0.14 }}
                    animate={{ opacity: active ? 0.7 : 0.14 }}
                    transition={{ duration: 0.26, ease: "easeOut" }}
                  />
                </svg>
                <span style={{ left: `${round(labelX)}%`, top: `${round(labelY)}%` }}>
                  {petal.label}
                </span>
              </Link>
            </motion.div>
          );
        })}

        {/* Everything thrown, over the ring and out of the pointer's way. */}
        <svg className="media-system-burst" viewBox="0 0 100 100" aria-hidden="true">
          <AnimatePresence>
            {burst ? <Burst axis={-90 + (burst.index * 360) / petals.length} petal={petals[burst.index]} key={burst.key} /> : null}
          </AnimatePresence>
        </svg>

        {/* Centred by half its own width, which framer motion has to be told
            about: it writes the whole transform, so a translate left in the
            stylesheet would simply be overwritten. */}
        <motion.span
          className="media-system-core"
          animate={{
            scale: hovered === null ? 1 : 1.05,
            x: "-50%",
            y: "-50%",
            boxShadow:
              hovered === null
                ? "0 10px 28px rgb(6 43 92 / 14%)"
                : `0 14px 34px ${shade(petals[hovered].to, -0.1)}59`,
          }}
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
