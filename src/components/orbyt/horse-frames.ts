/* ── Orbyt · Gallop keyframes ──────────────────────────────
   Eight hand-posed frames of a transverse gallop (after
   Muybridge), stored as explicit joint coordinates — no IK,
   no elasticity, no guessing at runtime. A puppet, posed
   frame by frame, then sampled into ember dots by the canvas.

   Units: "horse units". x+ forward (the horse faces right),
   y+ up, ground at y = 0. Every pose below is hand-checked
   against the chain lengths so limbs never telescope:

     front leg  shoulder→carpus 7 · carpus→fetlock 5 · +1.7 pastern
     hind leg   hip→hock 8 · hock→fetlock 5.5 · +1.7 pastern
     body       withers ≈ 19 · chest depth ≈ 10 · length ≈ 25 */

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
  /** −1 gathered neck … +1 fully extended neck */
  neck: number;
  /** front legs: carpus, fetlock, hoof (world space) */
  fN: Joints;
  fF: Joints;
  /** hind legs: hock, fetlock, hoof (world space) */
  hN: Joints;
  hF: Joints;
  /** tail mid + two tip control points (world space) */
  tail: Joints;
};

const MID: Pt = { x: -1, y: 14.6 };

const SPINE: Array<{ p: Pt; r: number }> = [
  { p: { x: -15.0, y: 14.0 }, r: 3.9 }, // tail root
  { p: { x: -10.5, y: 14.2 }, r: 4.7 }, // hip
  { p: MID, r: 4.9 }, // barrel mid
  { p: { x: 6.0, y: 14.4 }, r: 4.5 }, // withers
  { p: { x: 10.0, y: 13.4 }, r: 4.0 }, // chest
];

const FILLS: Array<{ p: Pt; r: number }> = [
  { p: { x: 8.5, y: 10.8 }, r: 2.5 }, // brisket
  { p: { x: -10.0, y: 11.4 }, r: 3.1 }, // haunch
  { p: { x: -13.2, y: 15.9 }, r: 2.7 }, // rump top
];

const SHOULDER: Pt = { x: 6.5, y: 12.5 };
const HIP: Pt = { x: -10.5, y: 13.5 };

/* Gallop cycle: extend (flying) → front strike → front carry →
   gather (bunched) → hind strike → hind push → rise → reach. */
const POSES: Pose[] = [
  // F0 — extended suspension: the "flying" frame
  {
    bob: 2.3,
    pitch: -3,
    neck: 1,
    fN: [ { x: 13.3, y: 13.3 }, { x: 18.2, y: 12.2 }, { x: 19.9, y: 11.7 } ],
    fF: [ { x: 13.0, y: 12.9 }, { x: 17.6, y: 11.1 }, { x: 19.2, y: 10.5 } ],
    hN: [ { x: -18.4, y: 14.4 }, { x: -23.7, y: 13.0 }, { x: -25.3, y: 12.4 } ],
    hF: [ { x: -18.2, y: 13.7 }, { x: -23.5, y: 12.2 }, { x: -25.1, y: 11.7 } ],
    tail: [ { x: -19.8, y: 16.8 }, { x: -23.8, y: 17.4 }, { x: -27.2, y: 17.5 } ],
  },
  // F1 — front legs reaching down, hinds pushing away
  {
    bob: 1.0,
    pitch: -1,
    neck: 0.55,
    fN: [ { x: 12.2, y: 9.5 }, { x: 16.3, y: 6.6 }, { x: 17.7, y: 5.9 } ],
    fF: [ { x: 11.7, y: 8.8 }, { x: 15.4, y: 5.4 }, { x: 16.6, y: 4.3 } ],
    hN: [ { x: -15.1, y: 7.9 }, { x: -17.8, y: 3.1 }, { x: -18.4, y: 1.5 } ],
    hF: [ { x: -16.2, y: 8.9 }, { x: -20.1, y: 5.0 }, { x: -21.3, y: 3.8 } ],
    tail: [ { x: -19.8, y: 15.6 }, { x: -23.6, y: 15.0 }, { x: -26.6, y: 13.8 } ],
  },
  // F2 — near fore strikes the ground, hind swings under
  {
    bob: -0.4,
    pitch: 1,
    neck: 0,
    fN: [ { x: 11.5, y: 7.5 }, { x: 14.2, y: 2.0 }, { x: 15.0, y: 0.4 } ],
    fF: [ { x: 12.8, y: 8.6 }, { x: 15.6, y: 6.6 }, { x: 16.8, y: 6.0 } ],
    hN: [ { x: -7.0, y: 6.5 }, { x: -4.0, y: 2.6 }, { x: -2.8, y: 0.9 } ],
    hF: [ { x: -13.5, y: 7.3 }, { x: -15.5, y: 2.6 }, { x: -16.2, y: 0.9 } ],
    tail: [ { x: -19.8, y: 14.8 }, { x: -23.2, y: 13.2 }, { x: -25.8, y: 11.4 } ],
  },
  // F3 — front legs carry (lowest), both hinds coming forward
  {
    bob: -1.0,
    pitch: 2,
    neck: -0.5,
    fN: [ { x: 8.6, y: 6.0 }, { x: 9.2, y: 2.0 }, { x: 9.5, y: 0.4 } ],
    fF: [ { x: 6.6, y: 6.2 }, { x: 6.9, y: 2.2 }, { x: 6.8, y: 0.6 } ],
    hN: [ { x: -8.0, y: 5.6 }, { x: -6.0, y: 1.9 }, { x: -5.0, y: 0.6 } ],
    hF: [ { x: -10.0, y: 6.0 }, { x: -8.0, y: 2.1 }, { x: -7.0, y: 0.7 } ],
    tail: [ { x: -19.8, y: 14.4 }, { x: -22.8, y: 12.4 }, { x: -24.8, y: 10.4 } ],
  },
  // F4 — gathered suspension: everything tucked under, back up
  {
    bob: 1.8,
    pitch: 2.5,
    neck: -1,
    fN: [ { x: 12.2, y: 10.0 }, { x: 14.6, y: 7.0 }, { x: 15.6, y: 5.4 } ],
    fF: [ { x: 10.0, y: 10.4 }, { x: 12.2, y: 7.6 }, { x: 13.0, y: 6.2 } ],
    hN: [ { x: -6.6, y: 8.0 }, { x: -4.6, y: 4.0 }, { x: -3.6, y: 2.2 } ],
    hF: [ { x: -9.2, y: 8.4 }, { x: -7.4, y: 4.6 }, { x: -6.6, y: 2.8 } ],
    tail: [ { x: -19.8, y: 16.2 }, { x: -23.2, y: 15.8 }, { x: -26.2, y: 15.4 } ],
  },
  // F5 — near hind lands under the hip, front legs unfolding
  {
    bob: 0.6,
    pitch: 0,
    neck: -0.5,
    fN: [ { x: 12.6, y: 9.4 }, { x: 15.8, y: 6.4 }, { x: 17.6, y: 4.9 } ],
    fF: [ { x: 10.6, y: 9.8 }, { x: 13.4, y: 7.0 }, { x: 14.8, y: 5.8 } ],
    hN: [ { x: -12.4, y: 6.6 }, { x: -13.2, y: 2.2 }, { x: -13.5, y: 0.5 } ],
    hF: [ { x: -6.5, y: 6.6 }, { x: -4.0, y: 2.6 }, { x: -2.6, y: 1.0 } ],
    tail: [ { x: -19.8, y: 15.2 }, { x: -23.2, y: 13.8 }, { x: -26.2, y: 12.2 } ],
  },
  // F6 — hinds push off hard, front legs tucked under the chest
  {
    bob: 1.5,
    pitch: -1.5,
    neck: 0.2,
    fN: [ { x: 11.2, y: 10.2 }, { x: 13.2, y: 7.0 }, { x: 14.2, y: 5.6 } ],
    fF: [ { x: 9.2, y: 10.6 }, { x: 11.0, y: 7.4 }, { x: 12.0, y: 6.2 } ],
    hN: [ { x: -15.5, y: 9.4 }, { x: -19.6, y: 5.8 }, { x: -21.2, y: 4.6 } ],
    hF: [ { x: -13.5, y: 9.8 }, { x: -17.0, y: 6.4 }, { x: -18.4, y: 5.4 } ],
    tail: [ { x: -19.8, y: 15.6 }, { x: -23.8, y: 15.4 }, { x: -27.2, y: 15.0 } ],
  },
  // F7 — hinds trail away, front legs reach into the extension
  {
    bob: 2.1,
    pitch: -2.5,
    neck: 0.8,
    fN: [ { x: 12.6, y: 11.4 }, { x: 16.4, y: 8.6 }, { x: 18.6, y: 7.4 } ],
    fF: [ { x: 11.0, y: 11.6 }, { x: 14.6, y: 9.0 }, { x: 16.6, y: 8.0 } ],
    hN: [ { x: -16.0, y: 10.8 }, { x: -20.4, y: 7.6 }, { x: -22.4, y: 6.4 } ],
    hF: [ { x: -14.5, y: 11.0 }, { x: -18.6, y: 8.0 }, { x: -20.6, y: 7.0 } ],
    tail: [ { x: -19.8, y: 16.1 }, { x: -23.8, y: 16.4 }, { x: -27.2, y: 16.3 } ],
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
    for (let s = 0; s < 3; s++) {
      const t = s / 3;
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

  /* Neck + head — one rig, lerped between gathered and extended */
  const g = (pose.neck + 1) / 2;
  const base = att({ x: 9.3, y: 14.8 });
  const midN = att(lerpPt({ x: 15.0, y: 18.6 }, { x: 15.8, y: 17.8 }, g));
  const poll = att(lerpPt({ x: 19.6, y: 21.9 }, { x: 22.2, y: 20.0 }, g));
  const skull = att(lerpPt({ x: 21.0, y: 22.3 }, { x: 23.4, y: 20.5 }, g));
  const jaw = att(lerpPt({ x: 24.2, y: 21.3 }, { x: 26.6, y: 19.6 }, g));
  const tip = att(lerpPt({ x: 26.4, y: 20.7 }, { x: 28.9, y: 19.1 }, g));
  const earA = att(lerpPt({ x: 19.0, y: 24.9 }, { x: 20.3, y: 22.4 }, g));
  const earB = att(lerpPt({ x: 20.5, y: 24.8 }, { x: 21.9, y: 22.5 }, g));

  strokes.push({ x1: base.x, y1: base.y, x2: midN.x, y2: midN.y, r: 2.05 });
  strokes.push({ x1: midN.x, y1: midN.y, x2: poll.x, y2: poll.y, r: 1.5 });
  balls.push({ x: skull.x, y: skull.y, r: 1.85 });
  strokes.push({ x1: skull.x, y1: skull.y, x2: jaw.x, y2: jaw.y, r: 1.05 });
  strokes.push({ x1: jaw.x, y1: jaw.y, x2: tip.x, y2: tip.y, r: 0.92 });
  balls.push({ x: tip.x, y: tip.y, r: 0.95 });
  strokes.push({ x1: poll.x, y1: poll.y, x2: earA.x, y2: earA.y, r: 0.45 });
  strokes.push({ x1: poll.x, y1: poll.y, x2: earB.x, y2: earB.y, r: 0.45 });

  /* Tail: three tapering strands off the rump */
  const root = att(SPINE[0].p);
  const t1 = att(pose.tail[0]);
  const t2 = att(pose.tail[1]);
  const t3 = att(pose.tail[2]);
  strokes.push({ x1: root.x, y1: root.y, x2: t1.x, y2: t1.y, r: 1.15 });
  strokes.push({ x1: t1.x, y1: t1.y, x2: t2.x, y2: t2.y, r: 0.88 });
  strokes.push({ x1: t2.x, y1: t2.y, x2: t3.x, y2: t3.y, r: 0.62 });

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
  leg(hp, pose.hF, [1.19, 0.75, 0.53], 0.68); // far hind
  leg(sh, pose.fF, [0.98, 0.68, 0.53], 0.68); // far fore
  leg(hp, pose.hN, [1.4, 0.88, 0.62], undefined); // near hind
  leg(sh, pose.fN, [1.15, 0.8, 0.62], undefined); // near fore

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
