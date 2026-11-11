import { memo, useMemo } from "react";

type Flake = {
    left: number; // vw
    size: number; // px
    opacity: number;
    duration: number; // s
    delay: number; // s (negative => already mid-fall on first paint)
    driftMid: number; // vw
    driftEnd: number; // vw
    rotStart: number; // deg
    rotEnd: number; // deg
    blur: number; // px
    land: number; // vw above the snow bank where the flake touches down
};

const TINT_COUNT = 22;
const WHITE_COUNT = 8; // total 30 flakes (25-35)

// Flake size range in px. A snowflake shape needs a few more pixels than a
// dot to stay recognisable; raise or lower these to taste.
const SIZE_MIN = 7;
const SIZE_MAX = 13;

// Snow bank at the bottom of the screen.
const PILE_HEIGHT = 22; // px, final height once fully built up
const PILE_START_SCALE = 0.25; // fraction of the final height on first load
const PILE_GROW_SECONDS = 240; // time to reach the final height

type Tree = { kind: "pine" | "chinar"; c: number; w: number; color: string };
const TREES: Tree[] = [
    { kind: "pine", c: 96, w: 2.4, color: "#5f8f6a" },
    { kind: "pine", c: 94, w: 2, color: "#4a7c59" },
    { kind: "pine", c: 93, w: 1.5, color: "#6a9a74" },
    { kind: "chinar", c: 17.8, w: 2.4, color: "#c0763a" },
    { kind: "chinar", c: 16, w: 2.6, color: "#c0763a" },
    { kind: "pine", c: 92, w: 2.4, color: "#5f8f6a" },
    { kind: "pine", c: 90.6, w: 1.2, color: "#6a9a74" },
    { kind: "pine", c: 95, w: 2, color: "#4a7c59" },
];
const TREE_TRUNK = "#7a6a5c";
const CHINAR_TRUNK = "#6a5848"; // bark colour (trunk and limbs)
const TREE_AIM_EVERY = 3; // every Nth flake is aimed at one of the trees

// Height (vw above the bank) of a tree's branches at a given x, or 0 if the
// x is outside the tree. A pine is a cone from apex to lowest tier; a chinar
// is a dome (the crown) sitting on a bare trunk.
function treeLandingHeight(x: number): number {
    let best = 0;
    for (const t of TREES) {
        const u = Math.abs(x - t.c) / (t.w * 0.44);
        if (u >= 1) continue;
        if (t.kind === "chinar") {
            const base = t.w * 0.36;
            const top = t.w * 0.9;
            best = Math.max(best, base + (top - base) * 0.95 * Math.sqrt(1 - u * u));
        } else {
            const base = t.w * 0.16;
            const top = t.w * 1.34;
            best = Math.max(best, base + (top - base) * 0.95 * (1 - u));
        }
    }
    return best;
}

// One arm with a small V-branch, repeated six times at 60 degree steps.
const ARM = "M12 12V2M9.4 4.4L12 7l2.6-2.6";
const SNOWFLAKE_SVG =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' ` +
    `stroke='black' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'>` +
    [0, 60, 120, 180, 240, 300]
        .map((a) => `<path d='${ARM}' transform='rotate(${a} 12 12)'/>`)
        .join("") +
    `</svg>`;
const MASK = `url("data:image/svg+xml,${encodeURIComponent(SNOWFLAKE_SVG)}")`;

// Soft, uneven mounds along the bottom edge (stretched to the viewport width).
const PILE_TOP =
    "M0 20 C80 9 160 13 240 19 S400 29 480 17 S640 7 720 17 S880 29 960 19 S1120 7 1200 15 S1360 25 1440 17";

// Tree geometry: three tiers, plus a snow cap on each that builds up over time.
const TREE_TIERS = [
    "M50 6 L26 52 L74 52 Z",
    "M50 30 L17 84 L83 84 Z",
    "M50 56 L6 118 L94 118 Z",
];
const TREE_CAPS = [
    "M50 6 L38 28 L44 25 L50 30 L56 25 L62 28 Z",
    "M50 30 L33 58 L40 54 L46 60 L52 55 L58 60 L67 58 Z",
    "M50 56 L25 92 L33 88 L41 94 L50 89 L59 94 L67 88 L75 92 Z",
];

// Chinar: a thick trunk with a flared root base that forks into limbs, under
// a wide, uneven crown built from three layers of leaf clumps (shaded back,
// base colour, sunlit highlights on the upper left). Gaps between clumps show
// the limbs, as on a real chinar. Snow caps settle on the top and both sides.
const CHINAR_TRUNK_PATH =
    "M43 110 C48 106 50 98 51 88 L52 64 L68 64 L70 88 C71 98 74 106 79 110 Z";
const CHINAR_LIMBS = [
    ["M58 72 C52 60 44 54 33 47", 4.2],
    ["M62 72 C68 60 78 54 89 47", 4],
    ["M60 74 C60 62 58 50 55 36", 3.4],
    ["M45 54 C39 54 31 58 25 63", 2.4],
    ["M76 54 C82 54 90 58 96 62", 2.4],
] as [string, number][];
// [cx, cy, r]
const CHINAR_CROWN_BACK = [
    [60, 40, 28],
    [32, 52, 22],
    [88, 52, 22],
    [17, 61, 13],
    [103, 61, 13],
    [46, 63, 13],
    [76, 63, 13],
];
const CHINAR_CROWN_MID = [
    [60, 34, 24],
    [38, 44, 17],
    [82, 42, 18],
    [26, 56, 11],
    [94, 56, 11],
    [52, 22, 14],
    [70, 20, 15],
];
const CHINAR_CROWN_LIGHT = [
    [52, 24, 10],
    [40, 38, 9],
    [66, 18, 9],
    [80, 33, 8],
    [28, 50, 6],
];
const CHINAR_CAPS = [
    "M40 22 C44 8 56 5 64 8 C70 2 82 5 86 20 C80 15 74 19 66 14 C58 20 48 15 40 22 Z",
    "M16 46 C22 32 44 30 50 42 C42 38 34 42 26 40 C22 42 18 44 16 46 Z",
    "M70 42 C76 30 98 32 106 46 C100 44 96 40 90 42 C84 40 76 44 70 42 Z",
];

// Small seeded PRNG so the layout is stable across re-renders / SSR.
function mulberry32(seed: number) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const range = (rand: () => number, min: number, max: number) =>
    min + rand() * (max - min);

function createFlakes(
    count: number,
    seed: number,
    opacityMin: number,
    opacityMax: number
): Flake[] {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, (_, i) => {
        const duration = range(rand, 10, 18);
        const aimed = i % TREE_AIM_EVERY === 0;

        // spread evenly with jitter so flakes don't clump
        let left = ((i + rand()) / count) * 100;
        let driftEnd = (rand() > 0.5 ? 1 : -1) * range(rand, 2, 8);
        if (aimed) {
            const t = TREES[Math.floor(i / TREE_AIM_EVERY) % TREES.length];
            left = t.c + range(rand, -1.3, 1.3) * t.w * 0.44;
            driftEnd = range(rand, -0.8, 0.8);
        }

        // Flakes that end up over a tree land on its branches; everything else
        // hits the bank.
        const land = treeLandingHeight(left + driftEnd);

        const rotStart = range(rand, 0, 60);
        const spinDir = rand() > 0.5 ? 1 : -1;
        return {
            left,
            size: Math.round(range(rand, SIZE_MIN, SIZE_MAX) * 10) / 10,
            opacity: Math.round(range(rand, opacityMin, opacityMax) * 100) / 100,
            duration: Math.round(duration * 10) / 10,
            delay: -Math.round(range(rand, 0, duration) * 10) / 10,
            driftMid: driftEnd * range(rand, -0.6, 1.1),
            driftEnd,
            rotStart,
            rotEnd: rotStart + spinDir * range(rand, 60, 200), // slow, gentle spin
            blur: rand() > 0.5 ? 0.3 : 0.15,
            land: Math.round(land * 100) / 100,
        };
    });
}

// Flakes fade in at the top, fall, then touch down (on the bank or on the
// tree) and fade out before the loop restarts at the top.
const KEYFRAMES = `
@keyframes snowfall-fall {
  0%   { opacity: 0; transform: translate3d(0, -6vh, 0) rotate(var(--snow-r0)); }
  6%   { opacity: var(--snow-o); }
  50%  { transform: translate3d(var(--snow-mid), 48vh, 0) rotate(calc((var(--snow-r0) + var(--snow-r1)) / 2)); }
  93%  { opacity: var(--snow-o); }
  100% { opacity: 0; transform: translate3d(var(--snow-end), calc(100vh - ${PILE_HEIGHT - 4}px - var(--snow-land)), 0) rotate(var(--snow-r1)); }
}
@keyframes snowfall-pile-grow {
  from { transform: scaleY(${PILE_START_SCALE}); }
  to   { transform: scaleY(1); }
}
@keyframes snowfall-cap-grow {
  from { transform: scale(0.55, 0.15); }
  to   { transform: scale(1, 1); }
}
@media (prefers-reduced-motion: reduce) {
  [data-snowfall] { display: none !important; }
}
`;

const LAYER_CLASS =
    "pointer-events-none fixed inset-0 z-40 overflow-hidden motion-reduce:hidden";

function renderFlakes(flakes: Flake[], color: string) {
    return flakes.map((f, i) => (
        <span
            key={i}
            className="absolute top-0 will-change-transform"
            style={
                {
                    left: `${f.left}vw`,
                    width: f.size,
                    height: f.size,
                    opacity: 0,
                    backgroundColor: color,
                    WebkitMaskImage: MASK,
                    maskImage: MASK,
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    filter: `blur(${f.blur}px)`,
                    animation: `snowfall-fall ${f.duration}s linear ${f.delay}s infinite`,
                    "--snow-o": f.opacity,
                    "--snow-mid": `${f.driftMid}vw`,
                    "--snow-end": `${f.driftEnd}vw`,
                    "--snow-r0": `${f.rotStart}deg`,
                    "--snow-r1": `${f.rotEnd}deg`,
                    "--snow-land": `${f.land}vw`,
                } as React.CSSProperties
            }
        />
    ));
}

function SnowfallBase() {
    const tintFlakes = useMemo(
        () => createFlakes(TINT_COUNT, 20261108, 0.35, 0.6),
        []
    );
    const whiteFlakes = useMemo(
        () => createFlakes(WHITE_COUNT, 11082026, 0.3, 0.5),
        []
    );

    return (
        <>
            <style>{KEYFRAMES}</style>

            {/* Pine trees standing in the snow bank (drawn before the bank so the
          bank covers the foot of the trunks). Muted greens keep the palette
          calm; the white caps are the settling snow. */}
            <div
                data-snowfall
                aria-hidden="true"
                className="pointer-events-none fixed inset-x-0 bottom-0 z-40 motion-reduce:hidden"
            >
                {TREES.map((t, n) => {
                    const chinar = t.kind === "chinar";
                    const capStyle = {
                        transformBox: "fill-box",
                        transformOrigin: "top center",
                        animation: `snowfall-cap-grow ${PILE_GROW_SECONDS}s ease-out forwards`,
                    } as React.CSSProperties;
                    return (
                        <svg
                            key={n}
                            viewBox={chinar ? "0 0 120 110" : "0 0 100 134"}
                            className="absolute block"
                            style={{
                                left: `${t.c - t.w / 2}vw`,
                                bottom: 6,
                                width: `${t.w}vw`,
                                aspectRatio: chinar ? "120 / 110" : "100 / 134",
                                height: "auto",
                            }}
                        >
                            {chinar ? (
                                <>
                                    <path d={CHINAR_TRUNK_PATH} fill={CHINAR_TRUNK} />
                                    <g
                                        fill="none"
                                        stroke={CHINAR_TRUNK}
                                        strokeLinecap="round"
                                    >
                                        {CHINAR_LIMBS.map(([d, sw], i) => (
                                            <path key={i} d={d} strokeWidth={sw} />
                                        ))}
                                    </g>
                                    {/* Leaf colours are shades of the tree's own colour; the
                      plain fill is the fallback for browsers without
                      color-mix(). */}
                                    <g opacity="0.94">
                                        <g
                                            fill={t.color}
                                            style={{ fill: `color-mix(in srgb, ${t.color} 76%, #3b2412)` }}
                                        >
                                            {CHINAR_CROWN_BACK.map(([cx, cy, r], i) => (
                                                <circle key={i} cx={cx} cy={cy} r={r} />
                                            ))}
                                        </g>
                                        <g fill={t.color}>
                                            {CHINAR_CROWN_MID.map(([cx, cy, r], i) => (
                                                <circle key={i} cx={cx} cy={cy} r={r} />
                                            ))}
                                        </g>
                                        <g
                                            fill={t.color}
                                            style={{ fill: `color-mix(in srgb, ${t.color} 78%, #ffffff)` }}
                                        >
                                            {CHINAR_CROWN_LIGHT.map(([cx, cy, r], i) => (
                                                <circle key={i} cx={cx} cy={cy} r={r} />
                                            ))}
                                        </g>
                                    </g>
                                    <g fill="#ffffff" opacity="0.95">
                                        {CHINAR_CAPS.map((d, i) => (
                                            <path key={i} d={d} style={capStyle} />
                                        ))}
                                    </g>
                                </>
                            ) : (
                                <>
                                    <rect x="45" y="116" width="10" height="18" rx="1" fill={TREE_TRUNK} />
                                    <g fill={t.color} opacity="0.92">
                                        {TREE_TIERS.map((d, i) => (
                                            <path key={i} d={d} />
                                        ))}
                                    </g>
                                    <g fill="#ffffff" opacity="0.95">
                                        {TREE_CAPS.map((d, i) => (
                                            <path key={i} d={d} style={capStyle} />
                                        ))}
                                    </g>
                                </>
                            )}
                        </svg>
                    );
                })}
            </div>

            {/* Snow bank resting at the bottom of the viewport. White at the top
          fading to a cool blue-grey base, with a hairline top edge, so it
          reads on white, lavender and darker regions alike. */}
            <div
                data-snowfall
                aria-hidden="true"
                className="pointer-events-none fixed inset-x-0 bottom-0 z-40 motion-reduce:hidden"
                style={{ height: PILE_HEIGHT }}
            >
                <svg
                    viewBox="0 0 1440 40"
                    preserveAspectRatio="none"
                    className="block h-full w-full"
                    style={{
                        transformOrigin: "bottom",
                        animation: `snowfall-pile-grow ${PILE_GROW_SECONDS}s ease-out forwards`,
                        opacity: 0.92,
                    }}
                >
                    <defs>
                        <linearGradient id="snowfall-pile-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="100%" stopColor="#dde5f4" />
                        </linearGradient>
                    </defs>
                    <path d={`${PILE_TOP} V40 H0 Z`} fill="url(#snowfall-pile-fill)" />
                    <path
                        d={PILE_TOP}
                        fill="none"
                        stroke="#b4c2de"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>

            {/* Layer 1: blue-grey flakes that blend with the page background.
          The blend mode sits on the layer itself so it blends with the app
          underneath (a fixed + z-index element forms its own stacking context). */}
            <div
                data-snowfall
                aria-hidden="true"
                className={LAYER_CLASS}
                style={{ mixBlendMode: "multiply" }}
            >
                {renderFlakes(tintFlakes, "#9fb0d3")}
            </div>

            {/* Layer 2: white flakes, visible over darker UI regions. */}
            <div data-snowfall aria-hidden="true" className={LAYER_CLASS}>
                {renderFlakes(whiteFlakes, "#ffffff")}
            </div>
        </>
    );
}

const Snowfall = memo(SnowfallBase);
export default Snowfall;

/////////////////////////////////////////////////////////////////

// import { memo, useMemo } from "react";

// type Flake = {
//     left: number; // vw
//     size: number; // px
//     opacity: number;
//     duration: number; // s
//     delay: number; // s (negative => already mid-fall on first paint)
//     driftMid: number; // vw
//     driftEnd: number; // vw
//     rotStart: number; // deg
//     rotEnd: number; // deg
//     blur: number; // px
// };

// const TINT_COUNT = 22;
// const WHITE_COUNT = 8; // total 30 flakes (25-35)

// // Flake size range in px. A snowflake shape needs a few more pixels than a
// // dot to stay recognisable; raise or lower these to taste.
// const SIZE_MIN = 7;
// const SIZE_MAX = 13;

// // Snow bank at the bottom of the screen.
// const PILE_HEIGHT = 22; // px, final height once fully built up
// const PILE_START_SCALE = 0.25; // fraction of the final height on first load
// const PILE_GROW_SECONDS = 240; // time to reach the final height

// // One arm with a small V-branch, repeated six times at 60 degree steps.
// const ARM = "M12 12V2M9.4 4.4L12 7l2.6-2.6";
// const SNOWFLAKE_SVG =
//     `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' ` +
//     `stroke='black' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'>` +
//     [0, 60, 120, 180, 240, 300]
//         .map((a) => `<path d='${ARM}' transform='rotate(${a} 12 12)'/>`)
//         .join("") +
//     `</svg>`;
// const MASK = `url("data:image/svg+xml,${encodeURIComponent(SNOWFLAKE_SVG)}")`;

// // Soft, uneven mounds along the bottom edge (stretched to the viewport width).
// const PILE_TOP =
//     "M0 20 C80 9 160 13 240 19 S400 29 480 17 S640 7 720 17 S880 29 960 19 S1120 7 1200 15 S1360 25 1440 17";

// // Small seeded PRNG so the layout is stable across re-renders / SSR.
// function mulberry32(seed: number) {
//     return () => {
//         seed |= 0;
//         seed = (seed + 0x6d2b79f5) | 0;
//         let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
//         t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
//         return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
//     };
// }

// const range = (rand: () => number, min: number, max: number) =>
//     min + rand() * (max - min);

// function createFlakes(
//     count: number,
//     seed: number,
//     opacityMin: number,
//     opacityMax: number
// ): Flake[] {
//     const rand = mulberry32(seed);
//     return Array.from({ length: count }, (_, i) => {
//         const duration = range(rand, 10, 18);
//         const dir = rand() > 0.5 ? 1 : -1;
//         const driftEnd = dir * range(rand, 2, 8);
//         const rotStart = range(rand, 0, 60);
//         const spinDir = rand() > 0.5 ? 1 : -1;
//         return {
//             // spread evenly with jitter so flakes don't clump
//             left: ((i + rand()) / count) * 100,
//             size: Math.round(range(rand, SIZE_MIN, SIZE_MAX) * 10) / 10,
//             opacity: Math.round(range(rand, opacityMin, opacityMax) * 100) / 100,
//             duration: Math.round(duration * 10) / 10,
//             delay: -Math.round(range(rand, 0, duration) * 10) / 10,
//             driftMid: driftEnd * range(rand, -0.6, 1.1),
//             driftEnd,
//             rotStart,
//             rotEnd: rotStart + spinDir * range(rand, 60, 200), // slow, gentle spin
//             blur: rand() > 0.5 ? 0.3 : 0.15,
//         };
//     });
// }

// // Flakes fade in at the top, fall, then touch down on the snow bank and
// // fade out into it before the loop restarts at the top.
// const KEYFRAMES = `
// @keyframes snowfall-fall {
//   0%   { opacity: 0; transform: translate3d(0, -6vh, 0) rotate(var(--snow-r0)); }
//   6%   { opacity: var(--snow-o); }
//   50%  { transform: translate3d(var(--snow-mid), 48vh, 0) rotate(calc((var(--snow-r0) + var(--snow-r1)) / 2)); }
//   93%  { opacity: var(--snow-o); }
//   100% { opacity: 0; transform: translate3d(var(--snow-end), calc(100vh - ${PILE_HEIGHT - 4}px), 0) rotate(var(--snow-r1)); }
// }
// @keyframes snowfall-pile-grow {
//   from { transform: scaleY(${PILE_START_SCALE}); }
//   to   { transform: scaleY(1); }
// }
// @media (prefers-reduced-motion: reduce) {
//   [data-snowfall] { display: none !important; }
// }
// `;

// const LAYER_CLASS =
//     "pointer-events-none fixed inset-0 z-40 overflow-hidden motion-reduce:hidden";

// function renderFlakes(flakes: Flake[], color: string) {
//     return flakes.map((f, i) => (
//         <span
//             key={i}
//             className="absolute top-0 will-change-transform"
//             style={
//                 {
//                     left: `${f.left}vw`,
//                     width: f.size,
//                     height: f.size,
//                     opacity: 0,
//                     backgroundColor: color,
//                     WebkitMaskImage: MASK,
//                     maskImage: MASK,
//                     WebkitMaskSize: "100% 100%",
//                     maskSize: "100% 100%",
//                     WebkitMaskRepeat: "no-repeat",
//                     maskRepeat: "no-repeat",
//                     filter: `blur(${f.blur}px)`,
//                     animation: `snowfall-fall ${f.duration}s linear ${f.delay}s infinite`,
//                     "--snow-o": f.opacity,
//                     "--snow-mid": `${f.driftMid}vw`,
//                     "--snow-end": `${f.driftEnd}vw`,
//                     "--snow-r0": `${f.rotStart}deg`,
//                     "--snow-r1": `${f.rotEnd}deg`,
//                 } as React.CSSProperties
//             }
//         />
//     ));
// }

// function SnowfallBase() {
//     const tintFlakes = useMemo(
//         () => createFlakes(TINT_COUNT, 20261108, 0.35, 0.6),
//         []
//     );
//     const whiteFlakes = useMemo(
//         () => createFlakes(WHITE_COUNT, 11082026, 0.3, 0.5),
//         []
//     );

//     return (
//         <>
//             <style>{KEYFRAMES}</style>

//             {/* Snow bank resting at the bottom of the viewport. White at the top
//           fading to a cool blue-grey base, with a hairline top edge, so it
//           reads on white, lavender and darker regions alike. */}
//             <div
//                 data-snowfall
//                 aria-hidden="true"
//                 className="pointer-events-none fixed inset-x-0 bottom-0 z-40 motion-reduce:hidden"
//                 style={{ height: PILE_HEIGHT }}
//             >
//                 <svg
//                     viewBox="0 0 1440 40"
//                     preserveAspectRatio="none"
//                     className="block h-full w-full"
//                     style={{
//                         transformOrigin: "bottom",
//                         animation: `snowfall-pile-grow ${PILE_GROW_SECONDS}s ease-out forwards`,
//                         opacity: 0.92,
//                     }}
//                 >
//                     <defs>
//                         <linearGradient id="snowfall-pile-fill" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="0%" stopColor="#ffffff" />
//                             <stop offset="100%" stopColor="#dde5f4" />
//                         </linearGradient>
//                     </defs>
//                     <path d={`${PILE_TOP} V40 H0 Z`} fill="url(#snowfall-pile-fill)" />
//                     <path
//                         d={PILE_TOP}
//                         fill="none"
//                         stroke="#b4c2de"
//                         strokeWidth="1"
//                         vectorEffect="non-scaling-stroke"
//                     />
//                 </svg>
//             </div>

//             {/* Layer 1: blue-grey flakes that blend with the page background.
//           The blend mode sits on the layer itself so it blends with the app
//           underneath (a fixed + z-index element forms its own stacking context). */}
//             <div
//                 data-snowfall
//                 aria-hidden="true"
//                 className={LAYER_CLASS}
//                 style={{ mixBlendMode: "multiply" }}
//             >
//                 {renderFlakes(tintFlakes, "#9fb0d3")}
//             </div>

//             {/* Layer 2: white flakes, visible over darker UI regions. */}
//             <div data-snowfall aria-hidden="true" className={LAYER_CLASS}>
//                 {renderFlakes(whiteFlakes, "#ffffff")}
//             </div>
//         </>
//     );
// }

// const Snowfall = memo(SnowfallBase);
// export default Snowfall;