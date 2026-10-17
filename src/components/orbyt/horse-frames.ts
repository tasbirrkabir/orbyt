/* ── Orbyt · Gallop keyframes ──────────────────────────────
   Eight hand-posed frames of a transverse gallop (after
   Muybridge), stored as explicit joint coordinates — no IK,
   no elasticity, no guessing at runtime. A puppet, posed
   frame by frame, then sampled into ember dots by the canvas.

   Units: "horse units". x+ forward (the horse faces right),
   y+ up, ground at y = 0. Proportions follow a real horse so
   the silhouette reads HORSE at a glance, not dog:

     · body core span (rump→chest) ≈ 18, depth ≈ 10  (~2:1)
     · height at withers ≈ 19 → legs are ~45% of the height
       and stay clearly visible under the barrel
     · neck rises ~30–42° (never horizontal), head angles
       DOWN from the poll — muzzle sits 3–4 units below it
     · ears small at the poll, tail flows off the rump

   Every pose is hand-checked so limbs never telescope:

     front leg  shoulder→carpus ≈6.5 · carpus→fetlock ≈5 · +1.5
     hind leg   hip→hock ≈6.5 · hock→fetlock ≈5.2 · +1.4        */

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

/* Gallop cycle: extend (flying) → front strike → front carry →
   gather (bunched) → hind strike → hind push → rise → reach. */
const POSES: Pose[] = [
  // F0 — extended suspension: the "flying" frame, legs reaching full stretch
  {
    bob: 2.2,
    pitch: -1.5,
    neck: 1,
    fN: [ { x: 11.4, y: 10.6 }, { x: 16.2, y: 9.6 }, { x: 18.2, y: 9.0 } ],
    fF: [ { x: 10.6, y: 9.9 }, { x: 15.0, y: 8.2 }, { x: 16.8, y: 7.4 } ],
    hN: [ { x: -14.4, y: 11.6 }, { x: -19.6, y: 9.6 }, { x: -21.6, y: 9.0 } ],
    hF: [ { x: -13.6, y: 10.9 }, { x: -18.4, y: 8.6 }, { x: -20.2, y: 7.8 } ],
    tail: [ { x: -15.8, y: 16.6 }, { x: -19.6, y: 17.4 }, { x: -22.8, y: 17.6 } ],
  },
  // F1 — front legs reaching down, hinds pushing away behind
  {
    bob: 0.8,
    pitch: 0,
    neck: 0.5,
    fN: [ { x: 10.8, y: 8.2 }, { x: 14.8, y: 4.6 }, { x: 16.0, y: 3.2 } ],
    fF: [ { x: 11.4, y: 9.4 }, { x: 15.8, y: 6.4 }, { x: 17.2, y: 5.4 } ],
    hN: [ { x: -13.2, y: 8.0 }, { x: -17.0, y: 4.4 }, { x: -18.4, y: 3.0 } ],
    hF: [ { x: -12.6, y: 8.8 }, { x: -16.0, y: 5.2 }, { x: -17.2, y: 4.0 } ],
    tail: [ { x: -15.6, y: 15.6 }, { x: -19.2, y: 14.6 }, { x: -22.0, y: 13.4 } ],
  },
  // F2 — near fore strikes the ground, hinds swing under the belly
  {
    bob: -0.5,
    pitch: 1.5,
    neck: 0,
    fN: [ { x: 9.0, y: 6.4 }, { x: 12.2, y: 2.0 }, { x: 13.0, y: 0.5 } ],
    fF: [ { x: 10.8, y: 7.0 }, { x: 14.6, y: 3.4 }, { x: 16.0, y: 2.2 } ],
    hN: [ { x: -4.4, y: 6.2 }, { x: -1.6, y: 1.8 }, { x: -0.6, y: 0.4 } ],
    hF: [ { x: -10.2, y: 6.0 }, { x: -13.2, y: 1.8 }, { x: -14.4, y: 0.4 } ],
    tail: [ { x: -15.4, y: 14.8 }, { x: -18.8, y: 12.8 }, { x: -21.4, y: 11.0 } ],
  },
  // F3 — front legs carry (lowest), hinds folding forward
  {
    bob: -0.6,
    pitch: 2,
    neck: -0.5,
    fN: [ { x: 7.4, y: 5.4 }, { x: 9.4, y: 1.4 }, { x: 9.8, y: 0.6 } ],
    fF: [ { x: 5.2, y: 5.6 }, { x: 6.4, y: 1.6 }, { x: 6.2, y: 0.7 } ],
    hN: [ { x: -3.4, y: 6.0 }, { x: -1.0, y: 1.8 }, { x: -0.2, y: 0.7 } ],
    hF: [ { x: -6.6, y: 6.2 }, { x: -4.6, y: 2.0 }, { x: -3.8, y: 0.7 } ],
    tail: [ { x: -15.2, y: 14.4 }, { x: -18.2, y: 12.2 }, { x: -20.4, y: 10.2 } ],
  },
  // F4 — gathered suspension: everything tucked under, back arched
  {
    bob: 1.8,
    pitch: 2.5,
    neck: -1,
    fN: [ { x: 9.4, y: 7.6 }, { x: 12.6, y: 5.0 }, { x: 14.0, y: 3.8 } ],
    fF: [ { x: 7.0, y: 8.0 }, { x: 9.6, y: 5.6 }, { x: 10.8, y: 4.6 } ],
    hN: [ { x: -4.0, y: 7.4 }, { x: -1.4, y: 3.2 }, { x: -0.4, y: 1.8 } ],
    hF: [ { x: -7.0, y: 7.6 }, { x: -4.8, y: 3.6 }, { x: -3.6, y: 2.2 } ],
    tail: [ { x: -15.6, y: 16.0 }, { x: -19.2, y: 15.6 }, { x: -22.0, y: 15.0 } ],
  },
  // F5 — near hind lands under the hip, front legs folding up
  {
    bob: 0.5,
    pitch: 0.5,
    neck: -0.5,
    fN: [ { x: 10.4, y: 8.4 }, { x: 14.0, y: 6.0 }, { x: 15.6, y: 5.0 } ],
    fF: [ { x: 8.6, y: 8.8 }, { x: 11.0, y: 6.6 }, { x: 12.4, y: 5.8 } ],
    hN: [ { x: -10.6, y: 6.6 }, { x: -13.4, y: 2.2 }, { x: -14.2, y: 0.5 } ],
    hF: [ { x: -3.6, y: 6.8 }, { x: -0.8, y: 2.0 }, { x: 0.2, y: 0.5 } ],
    tail: [ { x: -15.4, y: 15.0 }, { x: -19.0, y: 13.6 }, { x: -21.8, y: 12.2 } ],
  },
  // F6 — hinds push off hard, front legs tucked under the chest
  {
    bob: 1.4,
    pitch: -2,
    neck: 0.2,
    fN: [ { x: 8.8, y: 8.0 }, { x: 10.6, y: 4.8 }, { x: 11.4, y: 3.6 } ],
    fF: [ { x: 7.2, y: 8.4 }, { x: 8.6, y: 5.2 }, { x: 9.2, y: 4.0 } ],
    hN: [ { x: -12.6, y: 8.6 }, { x: -17.0, y: 4.6 }, { x: -19.0, y: 3.2 } ],
    hF: [ { x: -11.6, y: 7.8 }, { x: -15.6, y: 3.6 }, { x: -17.4, y: 2.2 } ],
    tail: [ { x: -15.8, y: 15.8 }, { x: -19.8, y: 15.6 }, { x: -22.8, y: 15.2 } ],
  },
  // F7 — hinds trail away, front legs reach into the extension
  {
    bob: 2.0,
    pitch: -2,
    neck: 0.7,
    fN: [ { x: 11.0, y: 9.6 }, { x: 15.4, y: 7.6 }, { x: 17.4, y: 6.8 } ],
    fF: [ { x: 10.2, y: 9.0 }, { x: 14.2, y: 6.6 }, { x: 16.0, y: 5.8 } ],
    hN: [ { x: -13.6, y: 10.2 }, { x: -18.4, y: 7.6 }, { x: -20.6, y: 6.6 } ],
    hF: [ { x: -12.8, y: 9.4 }, { x: -17.2, y: 6.6 }, { x: -19.2, y: 5.6 } ],
    tail: [ { x: -15.8, y: 16.2 }, { x: -19.8, y: 16.8 }, { x: -23.0, y: 16.8 } ],
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

  /* Neck + head — arched when gathered, stretched forward-low when
     extended; the muzzle always hangs below the poll (horse, not dog). */
  const g = (pose.neck + 1) / 2;
  const base = att({ x: 6.2, y: 15.3 });
  const midN = att(lerpPt({ x: 10.4, y: 19.0 }, { x: 11.4, y: 18.4 }, g));
  const poll = att(lerpPt({ x: 13.4, y: 21.6 }, { x: 15.4, y: 20.2 }, g));
  const skull = att(lerpPt({ x: 14.9, y: 21.1 }, { x: 16.9, y: 19.6 }, g));
  const jaw = att(lerpPt({ x: 17.4, y: 19.7 }, { x: 19.5, y: 18.1 }, g));
  const tip = att(lerpPt({ x: 19.2, y: 18.2 }, { x: 21.4, y: 16.4 }, g));
  const earA = att(lerpPt({ x: 12.6, y: 23.0 }, { x: 14.6, y: 21.4 }, g));
  const earB = att(lerpPt({ x: 13.9, y: 22.9 }, { x: 15.9, y: 21.3 }, g));

  strokes.push({ x1: base.x, y1: base.y, x2: midN.x, y2: midN.y, r: 1.75 });
  strokes.push({ x1: midN.x, y1: midN.y, x2: poll.x, y2: poll.y, r: 1.05 });
  balls.push({ x: skull.x, y: skull.y, r: 1.35 });
  strokes.push({ x1: skull.x, y1: skull.y, x2: jaw.x, y2: jaw.y, r: 0.85 });
  strokes.push({ x1: jaw.x, y1: jaw.y, x2: tip.x, y2: tip.y, r: 0.6 });
  balls.push({ x: tip.x, y: tip.y, r: 0.6 });
  strokes.push({ x1: poll.x, y1: poll.y, x2: earA.x, y2: earA.y, r: 0.38 });
  strokes.push({ x1: poll.x, y1: poll.y, x2: earB.x, y2: earB.y, r: 0.38 });

  /* Tail: three tapering strands off the rump */
  const root = att(SPINE[0].p);
  const t1 = att(pose.tail[0]);
  const t2 = att(pose.tail[1]);
  const t3 = att(pose.tail[2]);
  strokes.push({ x1: root.x, y1: root.y, x2: t1.x, y2: t1.y, r: 1.3 });
  strokes.push({ x1: t1.x, y1: t1.y, x2: t2.x, y2: t2.y, r: 1.05 });
  strokes.push({ x1: t2.x, y1: t2.y, x2: t3.x, y2: t3.y, r: 0.78 });

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
