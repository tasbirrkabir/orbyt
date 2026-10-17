/* ── Orbyt · Trot keyframes ────────────────────────────────
   Eight hand-posed frames of a working trot, posed for
   INSTANT recognition: the head is carried HIGH (the poll
   sits well above the topline), the muzzle hangs forward-
   down, a serrated mane rides the crest of the neck and a
   full tail hangs and sways below the rump. High carriage +
   mane + hanging tail is what makes a silhouette read
   "horse" at a glance — a stretched flying gallop just
   reads fox.

   Units: "horse units". x+ forward (the horse faces right),
   y+ up, ground at y = 0. Proportions of a real horse:

     · body core span (rump→chest) ≈ 18, depth ≈ 10 (~2:1)
     · height at withers ≈ 19; poll ≈ 25 → head above topline
     · head length ≈ 5.7 (long muzzle, tapered)
     · legs ~45% of the silhouette height, clearly visible
     · mane crest + hanging tail — the horse signatures

   Trot mechanics: diagonal pairs (near-fore + far-hind) and
   (far-fore + near-hind) alternate — land, carry, push,
   brief suspension — every pose hand-checked so limbs never
   telescope:

     front leg  shoulder→carpus ≈4.8-6 · carpus→fetlock ≈4.2-4.4
                · fetlock→hoof ≈1.5-2
     hind leg   hip→hock ≈5.3-6.6 · hock→fetlock ≈4.4-5.6
                · fetlock→hoof ≈1.4-2.2                      */

export type Pt = { x: number; y: number };
export type Ball = { x: number; y: number; r: number; d?: number };
export type Stroke = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  r: number;
  d?: number;
};
export type FramePrims = { balls: Ball[]; strokes: Stroke[] };

type Joints = [Pt, Pt, Pt];

type Pose = {
  /** whole-body y offset (suspension lifts the barrel) */
  bob: number;
  /** body rotation in degrees, + = chest dips / rump rises */
  pitch: number;
  /** −1 gathered neck … +1 fully extended neck (subtle at trot) */
  neck: number;
  /** front legs: carpus, fetlock, hoof (world space) */
  fN: Joints;
  fF: Joints;
  /** hind legs: hock, fetlock, hoof (world space) */
  hN: Joints;
  hF: Joints;
  /** tail: three hanging points off the rump (world space) */
  tail: Joints;
};

const MID: Pt = { x: -2.5, y: 14.6 };

const SPINE: Array<{ p: Pt; r: number }> = [
  { p: { x: -11.5, y: 15.2 }, r: 3.3 }, // tail root
  { p: { x: -8.5, y: 15.5 }, r: 4.1 }, // croup
  { p: MID, r: 4.3 }, // mid-back
  { p: { x: 3.5, y: 15.1 }, r: 4.0 }, // withers
  { p: { x: 6.5, y: 14.0 }, r: 3.7 }, // chest
];

const FILLS: Array<{ p: Pt; r: number }> = [
  { p: { x: 4.6, y: 10.9 }, r: 2.9 }, // girth — deep chest
  { p: { x: -7.6, y: 12.2 }, r: 3.2 }, // haunch
  { p: { x: -10.6, y: 17.0 }, r: 2.5 }, // rump top
  { p: { x: -2.4, y: 11.6 }, r: 2.35 }, // flank tuck
];

const SHOULDER: Pt = { x: 5.0, y: 11.5 };
const HIP: Pt = { x: -8.0, y: 12.0 };

/* Trot cycle — diagonal A (near fore + far hind) vs diagonal B
   (far fore + near hind): land → carry → push → suspension. */
const POSES: Pose[] = [
  // T0 — A lands: near fore + far hind plant, B folding through
  {
    bob: 0.2,
    pitch: 0,
    neck: 0.1,
    fN: [ { x: 6.0, y: 6.6 }, { x: 6.4, y: 2.5 }, { x: 6.6, y: 0.6 } ],
    fF: [ { x: 7.6, y: 8.2 }, { x: 9.2, y: 6.0 }, { x: 10.0, y: 4.8 } ],
    hN: [ { x: -4.6, y: 7.4 }, { x: -2.2, y: 3.6 }, { x: -1.2, y: 2.4 } ],
    hF: [ { x: -8.4, y: 6.4 }, { x: -8.8, y: 2.0 }, { x: -9.0, y: 0.5 } ],
    tail: [ { x: -14.2, y: 13.2 }, { x: -15.8, y: 10.0 }, { x: -16.6, y: 7.0 } ],
  },
  // T1 — A carries the weight, B folding tighter
  {
    bob: -0.2,
    pitch: 0,
    neck: 0,
    fN: [ { x: 5.8, y: 6.6 }, { x: 6.1, y: 2.4 }, { x: 6.2, y: 0.5 } ],
    fF: [ { x: 6.8, y: 7.8 }, { x: 7.6, y: 5.0 }, { x: 8.0, y: 3.8 } ],
    hN: [ { x: -4.2, y: 7.6 }, { x: -1.4, y: 4.0 }, { x: -0.2, y: 3.0 } ],
    hF: [ { x: -8.8, y: 6.2 }, { x: -9.2, y: 2.0 }, { x: -9.4, y: 0.5 } ],
    tail: [ { x: -14.4, y: 13.0 }, { x: -16.2, y: 9.8 }, { x: -17.2, y: 6.8 } ],
  },
  // T2 — A pushes off, B tucked ready to reach
  {
    bob: 0.1,
    pitch: -0.5,
    neck: 0,
    fN: [ { x: 5.6, y: 6.0 }, { x: 5.2, y: 2.0 }, { x: 4.9, y: 0.6 } ],
    fF: [ { x: 6.2, y: 7.6 }, { x: 6.4, y: 4.4 }, { x: 6.6, y: 3.2 } ],
    hN: [ { x: -4.0, y: 7.8 }, { x: -0.8, y: 4.4 }, { x: 0.4, y: 3.4 } ],
    hF: [ { x: -8.8, y: 6.2 }, { x: -9.8, y: 2.2 }, { x: -10.4, y: 0.9 } ],
    tail: [ { x: -14.6, y: 12.8 }, { x: -16.6, y: 9.6 }, { x: -17.6, y: 6.6 } ],
  },
  // T3 — suspension: B at full reach, A tucked under
  {
    bob: 1.0,
    pitch: 0,
    neck: 0.2,
    fN: [ { x: 6.0, y: 7.8 }, { x: 6.8, y: 5.0 }, { x: 7.4, y: 3.8 } ],
    fF: [ { x: 9.0, y: 7.6 }, { x: 11.8, y: 4.4 }, { x: 13.2, y: 3.0 } ],
    hN: [ { x: -4.6, y: 6.8 }, { x: -0.8, y: 2.8 }, { x: 1.0, y: 1.6 } ],
    hF: [ { x: -9.0, y: 7.0 }, { x: -10.6, y: 3.4 }, { x: -11.4, y: 2.4 } ],
    tail: [ { x: -14.4, y: 13.0 }, { x: -16.2, y: 9.8 }, { x: -17.0, y: 6.8 } ],
  },
  // T4 — B lands: far fore + near hind plant, A folding through
  {
    bob: 0.2,
    pitch: 0,
    neck: 0,
    fN: [ { x: 6.4, y: 7.6 }, { x: 7.4, y: 4.8 }, { x: 8.0, y: 3.6 } ],
    fF: [ { x: 8.4, y: 6.8 }, { x: 9.4, y: 2.6 }, { x: 9.7, y: 1.0 } ],
    hN: [ { x: -5.2, y: 6.8 }, { x: -3.6, y: 2.4 }, { x: -3.0, y: 1.0 } ],
    hF: [ { x: -9.2, y: 6.8 }, { x: -10.8, y: 3.2 }, { x: -11.6, y: 2.2 } ],
    tail: [ { x: -14.2, y: 13.2 }, { x: -15.6, y: 10.2 }, { x: -16.6, y: 7.4 } ],
  },
  // T5 — B carries the weight, A folding tighter
  {
    bob: -0.2,
    pitch: 0,
    neck: -0.1,
    fN: [ { x: 5.8, y: 7.8 }, { x: 6.4, y: 4.8 }, { x: 6.8, y: 3.6 } ],
    fF: [ { x: 8.2, y: 6.8 }, { x: 9.0, y: 2.6 }, { x: 9.2, y: 1.0 } ],
    hN: [ { x: -4.8, y: 7.0 }, { x: -3.0, y: 2.6 }, { x: -2.2, y: 1.2 } ],
    hF: [ { x: -9.4, y: 7.0 }, { x: -11.0, y: 3.6 }, { x: -11.8, y: 2.8 } ],
    tail: [ { x: -14.4, y: 13.4 }, { x: -15.8, y: 10.6 }, { x: -16.8, y: 7.8 } ],
  },
  // T6 — B pushes off, A tucked ready to reach
  {
    bob: 0.1,
    pitch: 0.5,
    neck: -0.2,
    fN: [ { x: 5.6, y: 7.8 }, { x: 5.8, y: 4.6 }, { x: 6.0, y: 3.4 } ],
    fF: [ { x: 8.6, y: 6.6 }, { x: 9.8, y: 2.4 }, { x: 10.1, y: 0.9 } ],
    hN: [ { x: -4.4, y: 6.6 }, { x: -2.8, y: 2.4 }, { x: -2.0, y: 0.9 } ],
    hF: [ { x: -9.6, y: 7.2 }, { x: -11.4, y: 3.8 }, { x: -12.2, y: 3.0 } ],
    tail: [ { x: -14.6, y: 13.6 }, { x: -15.8, y: 10.8 }, { x: -16.6, y: 8.0 } ],
  },
  // T7 — suspension: A at full reach, B tucked under
  {
    bob: 1.0,
    pitch: 0,
    neck: -0.1,
    fN: [ { x: 6.4, y: 7.4 }, { x: 8.6, y: 4.0 }, { x: 9.8, y: 2.6 } ],
    fF: [ { x: 7.0, y: 7.8 }, { x: 8.0, y: 5.0 }, { x: 8.6, y: 3.8 } ],
    hN: [ { x: -4.4, y: 7.6 }, { x: -1.2, y: 4.0 }, { x: 0.0, y: 3.0 } ],
    hF: [ { x: -9.8, y: 7.0 }, { x: -12.0, y: 2.6 }, { x: -13.4, y: 1.8 } ],
    tail: [ { x: -14.4, y: 13.8 }, { x: -15.4, y: 11.0 }, { x: -15.6, y: 8.2 } ],
  },
];

const rad = (deg: number) => (deg * Math.PI) / 180;

function lerpPt(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function buildFrame(pose: Pose): FramePrims {
  const th = rad(pose.pitch);
  const cos = Math.cos(th);
  const sin = Math.sin(th);
  const att = (q: Pt): Pt => ({
    x: MID.x + (q.x - MID.x) * cos - (q.y - MID.y) * sin,
    y: MID.y + (q.x - MID.x) * sin + (q.y - MID.y) * cos + pose.bob,
  });

  const balls: Ball[] = [];
  const strokes: Stroke[] = [];

  /* Barrel: spine chain subdivided for a smooth topline */
  for (let i = 0; i < SPINE.length - 1; i++) {
    const a = att(SPINE[i].p);
    const ra = SPINE[i].r;
    const b = att(SPINE[i + 1].p);
    const rb = SPINE[i + 1].r;
    for (let s = 0; s < 4; s++) {
      const t = s / 4;
      balls.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        r: ra + (rb - ra) * t,
      });
    }
  }
  const lastSpine = SPINE[SPINE.length - 1];
  balls.push({ ...att(lastSpine.p), r: lastSpine.r });

  for (const f of FILLS) {
    const q = att(f.p);
    balls.push({ x: q.x, y: q.y, r: f.r });
  }

  /* Neck — carried HIGH (steep ~60° rise), so the head sits well
     above the topline. The muzzle always hangs below the poll. */
  const g = (pose.neck + 1) / 2;
  const base = att({ x: 5.8, y: 15.4 });
  const midN = att(lerpPt({ x: 8.8, y: 20.4 }, { x: 9.4, y: 19.8 }, g));
  const poll = att(lerpPt({ x: 10.5, y: 24.7 }, { x: 11.4, y: 23.8 }, g));
  const skull = att(lerpPt({ x: 12.1, y: 24.85 }, { x: 13.0, y: 23.95 }, g));
  const jaw = att(lerpPt({ x: 14.4, y: 23.8 }, { x: 15.4, y: 22.85 }, g));
  const tip = att(lerpPt({ x: 16.4, y: 22.7 }, { x: 17.4, y: 21.75 }, g));
  const earA = att(lerpPt({ x: 10.2, y: 26.1 }, { x: 11.1, y: 25.2 }, g));
  const earB = att(lerpPt({ x: 11.4, y: 26.0 }, { x: 12.3, y: 25.1 }, g));

  strokes.push({ x1: base.x, y1: base.y, x2: midN.x, y2: midN.y, r: 1.95 });
  strokes.push({ x1: midN.x, y1: midN.y, x2: poll.x, y2: poll.y, r: 1.2 });
  balls.push({ x: skull.x, y: skull.y, r: 1.5 });
  strokes.push({ x1: skull.x, y1: skull.y, x2: jaw.x, y2: jaw.y, r: 0.95 });
  strokes.push({ x1: jaw.x, y1: jaw.y, x2: tip.x, y2: tip.y, r: 0.68 });
  balls.push({ x: tip.x, y: tip.y, r: 0.68 });
  strokes.push({ x1: poll.x, y1: poll.y, x2: earA.x, y2: earA.y, r: 0.42 });
  strokes.push({ x1: poll.x, y1: poll.y, x2: earB.x, y2: earB.y, r: 0.42 });

  /* Mane — a serrated crest riding the back edge of the neck,
     plus a small forelock at the poll. THE horse signifier. */
  const nx = poll.x - base.x;
  const ny = poll.y - base.y;
  const nl = Math.hypot(nx, ny) || 1;
  const px = -ny / nl; // perpendicular, pointing up-back
  const py = nx / nl;
  const maneT = [0.16, 0.34, 0.52, 0.7, 0.88];
  maneT.forEach((t, i) => {
    const r = 1.95 + (1.2 - 1.95) * t;
    const off = r + 0.48;
    const mx = base.x + nx * t + px * off;
    const my = base.y + ny * t + py * off;
    balls.push({ x: mx, y: my, r: 0.82 - i * 0.045 });
  });
  strokes.push({
    x1: poll.x,
    y1: poll.y,
    x2: poll.x + px * 1.5 - 0.2,
    y2: poll.y + py * 1.5 + 0.3,
    r: 0.42,
  });
  strokes.push({
    x1: poll.x,
    y1: poll.y,
    x2: poll.x + px * 1.1 + 0.35,
    y2: poll.y + py * 1.1 + 0.5,
    r: 0.4,
  });

  /* Tail — hangs down off the rump and sways with the stride */
  const root = att(SPINE[0].p);
  const t1 = att(pose.tail[0]);
  const t2 = att(pose.tail[1]);
  const t3 = att(pose.tail[2]);
  strokes.push({ x1: root.x, y1: root.y, x2: t1.x, y2: t1.y, r: 1.4 });
  strokes.push({ x1: t1.x, y1: t1.y, x2: t2.x, y2: t2.y, r: 1.15 });
  strokes.push({ x1: t2.x, y1: t2.y, x2: t3.x, y2: t3.y, r: 0.85 });
  balls.push({ x: t3.x, y: t3.y, r: 0.8 });

  /* Legs — far pair drawn dimmer so the near pair reads on top */
  const leg = (
    anchor: Pt,
    joints: Joints,
    radii: [number, number, number],
    d: number | undefined
  ) => {
    const [c, f, h] = joints;
    strokes.push({ x1: anchor.x, y1: anchor.y, x2: c.x, y2: c.y, r: radii[0], d });
    strokes.push({ x1: c.x, y1: c.y, x2: f.x, y2: f.y, r: radii[1], d });
    strokes.push({ x1: f.x, y1: f.y, x2: h.x, y2: h.y, r: radii[2], d });
    balls.push({ x: h.x, y: h.y, r: radii[2] + 0.2, d });
  };
  const sh = att(SHOULDER);
  const hp = att(HIP);
  leg(hp, pose.hF, [1.3, 0.78, 0.52], 0.68); // far hind
  leg(sh, pose.fF, [1.05, 0.7, 0.5], 0.68); // far fore
  leg(hp, pose.hN, [1.45, 0.85, 0.55], undefined); // near hind
  leg(sh, pose.fN, [1.15, 0.72, 0.5], undefined); // near fore

  return { balls, strokes };
}

export const HORSE_FRAMES: FramePrims[] = POSES.map(buildFrame);

/** Hoof world positions per frame — used for dust timing. [fN,fF,hN,hF] */
export const HORSE_HOOFS: Array<{ x: number; y: number }[]> = POSES.map(
  (p) => [p.fN[2], p.fF[2], p.hN[2], p.hF[2]]
);

export const HORSE_BBOX = (() => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const fr of HORSE_FRAMES) {
    for (const b of fr.balls) {
      minX = Math.min(minX, b.x - b.r);
      maxX = Math.max(maxX, b.x + b.r);
      minY = Math.min(minY, b.y - b.r);
      maxY = Math.max(maxY, b.y + b.r);
    }
    for (const s of fr.strokes) {
      const r = Math.max(s.r, s.r);
      minX = Math.min(minX, s.x1 - r, s.x2 - r);
      maxX = Math.max(maxX, s.x1 + r, s.x2 + r);
      minY = Math.min(minY, s.y1 - r, s.y2 - r);
      maxY = Math.max(maxY, s.y1 + r, s.y2 + r);
    }
  }
  return { minX, maxX, minY, maxY };
})();
