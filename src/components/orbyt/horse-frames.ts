/* ── Orbyt · Trot kinematics & anatomy ──────────────────────
   Precision mathematical model of an equine working trot.
   Anatomically sculpted: high carriage arched crest, pricked
   ears, chiseled cheek, tapered muzzle with clean throatlatch,
   athletic withers, saddle dip, rounded croup, lean tucked flank,
   slender athletic cannons, angular hocks, and a continuous
   sinusoidal flowing wind-blown tail and mane.

   Units: "horse units". x+ forward (faces right), y+ up, ground at y = 0.
*/

export type Pt = { x: number; y: number };
export type Ball = { x: number; y: number; r: number; d?: number; hot?: boolean };
export type Stroke = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  r1: number;
  r2: number;
  d?: number;
  hot?: boolean;
};

export type FramePrims = {
  balls: Ball[];
  strokes: Stroke[];
  hoofs: Pt[];
  bbox: { minX: number; maxX: number; minY: number; maxY: number };
};

const TAU = Math.PI * 2;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPt(a: Pt, b: Pt, t: number): Pt {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

/**
 * Procedural generation of a horse pose at stride phase p in [0, 1).
 * Generates continuous smooth kinematics without jerky keyframe steps.
 */
export function generateHorsePose(phase: number): FramePrims {
  const p = ((phase % 1) + 1) % 1;
  const pTau = p * TAU;

  // Stride suspension & bob: two bounces per stride (at p=0.25 and p=0.75)
  const bob = Math.sin(pTau * 2) * 0.7;
  const pitch = Math.sin(pTau * 2 - 0.4) * 1.4; // subtle chest dip / rise in degrees
  const pitchRad = (pitch * Math.PI) / 180;
  const cosP = Math.cos(pitchRad);
  const sinP = Math.sin(pitchRad);

  const midX = -1.0;
  const midY = 15.0;

  function att(pt: Pt): Pt {
    const rx = pt.x - midX;
    const ry = pt.y - midY;
    return {
      x: midX + rx * cosP - ry * sinP,
      y: midY + rx * sinP + ry * cosP + bob,
    };
  }

  // --- Spine & Torso points ---
  const withers = att({ x: 4.2, y: 19.4 });
  const midBack = att({ x: -1.8, y: 18.0 });
  const croup = att({ x: -8.0, y: 19.0 });
  const dock = att({ x: -11.8, y: 17.5 });

  const chest = att({ x: 7.2, y: 14.2 });
  const girth = att({ x: 3.2, y: 11.2 });
  const flank = att({ x: -4.5, y: 13.0 });
  const hip = att({ x: -8.2, y: 14.5 });

  // --- Neck & Head (nodding rhythmically with stride momentum) ---
  const headBob = Math.sin(pTau * 2 + 0.8) * 0.35;
  const poll = att({ x: 11.5 + headBob * 0.2, y: 25.2 + headBob });
  const throat = att({ x: 9.6, y: 20.8 });
  const jawCheek = att({ x: 11.8, y: 22.0 });
  const nasalBridge = att({ x: 14.8, y: 22.2 });
  const muzzle = att({ x: 16.8, y: 20.8 });
  const chin = att({ x: 15.2, y: 20.0 });
  const earTipNear = att({ x: 11.2, y: 27.8 });
  const earTipFar = att({ x: 12.4, y: 27.5 });

  const balls: Ball[] = [];
  const strokes: Stroke[] = [];

  // Torso construction (smooth tapered blends)
  strokes.push({ x1: withers.x, y1: withers.y, x2: midBack.x, y2: midBack.y, r1: 2.8, r2: 2.7, hot: true });
  strokes.push({ x1: midBack.x, y1: midBack.y, x2: croup.x, y2: croup.y, r1: 2.7, r2: 3.2, hot: true });
  strokes.push({ x1: croup.x, y1: croup.y, x2: dock.x, y2: dock.y, r1: 3.2, r2: 2.0 });

  // Underside: chest to girth to flank to hip
  strokes.push({ x1: chest.x, y1: chest.y, x2: girth.x, y2: girth.y, r1: 3.0, r2: 2.8 });
  strokes.push({ x1: girth.x, y1: girth.y, x2: flank.x, y2: flank.y, r1: 2.8, r2: 2.2 });
  strokes.push({ x1: flank.x, y1: flank.y, x2: hip.x, y2: hip.y, r1: 2.2, r2: 2.9 });

  // Barrel volume fill
  strokes.push({ x1: withers.x, y1: withers.y, x2: chest.x, y2: chest.y, r1: 2.8, r2: 3.0 });
  strokes.push({ x1: midBack.x, y1: midBack.y, x2: girth.x, y2: girth.y, r1: 2.7, r2: 2.8 });
  strokes.push({ x1: croup.x, y1: croup.y, x2: hip.x, y2: hip.y, r1: 3.2, r2: 2.9 });

  // Neck (proud arched crest + refined throatlatch)
  const neckBase = att({ x: 5.5, y: 17.5 });
  const neckCrestMid = att({ x: 8.2, y: 22.0 });
  strokes.push({ x1: neckBase.x, y1: neckBase.y, x2: neckCrestMid.x, y2: neckCrestMid.y, r1: 2.6, r2: 2.0, hot: true });
  strokes.push({ x1: neckCrestMid.x, y1: neckCrestMid.y, x2: poll.x, y2: poll.y, r1: 2.0, r2: 1.4, hot: true });
  strokes.push({ x1: chest.x, y1: chest.y, x2: throat.x, y2: throat.y, r1: 2.4, r2: 1.2 });
  strokes.push({ x1: throat.x, y1: throat.y, x2: jawCheek.x, y2: jawCheek.y, r1: 1.2, r2: 1.5 });

  // Head details
  balls.push({ x: jawCheek.x, y: jawCheek.y, r: 1.5 }); // cheek muscle
  strokes.push({ x1: poll.x, y1: poll.y, x2: nasalBridge.x, y2: nasalBridge.y, r1: 1.3, r2: 0.85, hot: true });
  strokes.push({ x1: nasalBridge.x, y1: nasalBridge.y, x2: muzzle.x, y2: muzzle.y, r1: 0.85, r2: 0.65, hot: true });
  strokes.push({ x1: muzzle.x, y1: muzzle.y, x2: chin.x, y2: chin.y, r1: 0.65, r2: 0.5 });
  strokes.push({ x1: chin.x, y1: chin.y, x2: jawCheek.x, y2: jawCheek.y, r1: 0.5, r2: 1.3 });
  balls.push({ x: muzzle.x, y: muzzle.y, r: 0.65, hot: true }); // refined muzzle

  // Ears (pricked forward alert)
  strokes.push({ x1: poll.x, y1: poll.y, x2: earTipNear.x, y2: earTipNear.y, r1: 0.45, r2: 0.18, hot: true });
  strokes.push({ x1: poll.x + 0.6, y1: poll.y, x2: earTipFar.x, y2: earTipFar.y, r1: 0.4, r2: 0.15, d: 0.7 });

  // Mane: flowing wind-blown locks along the crest
  for (let i = 0; i <= 6; i++) {
    const tMane = i / 6;
    const basePt = lerpPt(neckBase, poll, tMane);
    const wave = Math.sin(pTau * 2 - i * 0.7) * 0.45;
    const lockTip = {
      x: basePt.x - 1.3 - (1 - tMane) * 0.8,
      y: basePt.y + 0.8 + wave,
    };
    strokes.push({ x1: basePt.x, y1: basePt.y, x2: lockTip.x, y2: lockTip.y, r1: 0.6, r2: 0.25, hot: true });
  }

  // --- Dynamic Flowing Tail (Undulating liquid wave) ---
  const tailSegments = 6;
  let prevTail = dock;
  for (let i = 1; i <= tailSegments; i++) {
    const tailProgress = i / tailSegments;
    const waveX = Math.sin(pTau * 2 - i * 0.85) * (0.8 + tailProgress * 1.5);
    const waveY = Math.cos(pTau * 2 - i * 0.85) * (0.5 + tailProgress * 1.0);
    const tailPt = {
      x: dock.x - i * 1.6 - waveX,
      y: dock.y - i * 1.8 + waveY,
    };
    const r1 = lerp(1.7, 0.4, (i - 1) / tailSegments);
    const r2 = lerp(1.7, 0.4, i / tailSegments);
    strokes.push({ x1: prevTail.x, y1: prevTail.y, x2: tailPt.x, y2: tailPt.y, r1, r2, hot: i < 3 });
    prevTail = tailPt;
  }

  // --- Trot Leg Kinematics ---
  function getForeLeg(subPhase: number, shoulderPt: Pt, isFar: boolean) {
    const sp = ((subPhase % 1) + 1) % 1;
    let carpus: Pt;
    let fetlock: Pt;
    let hoof: Pt;

    if (sp < 0.5) {
      const st = sp / 0.5; // Stance: 0 -> 1
      const groundX = lerp(7.8, 4.2, st);
      const groundY = 0.5;
      hoof = { x: groundX, y: groundY };
      fetlock = { x: groundX + 0.2, y: 2.2 };
      carpus = { x: lerp(7.2, 5.8, st), y: 7.0 };
    } else {
      const sw = (sp - 0.5) / 0.5; // Swing: 0 -> 1
      const lift = Math.sin(sw * Math.PI);
      const swingX = lerp(4.2, 8.2, sw);
      const swingY = 0.5 + lift * 4.2;
      hoof = { x: swingX, y: swingY };
      fetlock = { x: swingX - 0.4, y: swingY + 1.8 };
      carpus = { x: lerp(5.8, 7.8, sw) - lift * 0.8, y: 7.0 + lift * 1.8 };
    }

    const d = isFar ? 0.65 : undefined;
    const hot = !isFar;
    // Scapula to Carpus (Forearm)
    strokes.push({ x1: shoulderPt.x, y1: shoulderPt.y, x2: carpus.x, y2: carpus.y, r1: 1.4, r2: 0.65, d, hot });
    // Carpus joint
    balls.push({ x: carpus.x, y: carpus.y, r: 0.65, d, hot });
    // Carpus to Fetlock (Cannon)
    strokes.push({ x1: carpus.x, y1: carpus.y, x2: fetlock.x, y2: fetlock.y, r1: 0.62, r2: 0.48, d, hot });
    // Fetlock joint
    balls.push({ x: fetlock.x, y: fetlock.y, r: 0.5, d, hot });
    // Pastern to Hoof
    strokes.push({ x1: fetlock.x, y1: fetlock.y, x2: hoof.x, y2: hoof.y, r1: 0.46, r2: 0.42, d, hot });
    // Hoof wedge
    balls.push({ x: hoof.x, y: hoof.y, r: 0.52, d, hot });

    return hoof;
  }

  function getHindLeg(subPhase: number, hipPt: Pt, isFar: boolean) {
    const sp = ((subPhase % 1) + 1) % 1;
    let stifle: Pt;
    let hock: Pt;
    let fetlock: Pt;
    let hoof: Pt;

    if (sp < 0.5) {
      const st = sp / 0.5; // Stance: 0 -> 1
      const groundX = lerp(-6.5, -11.5, st);
      const groundY = 0.5;
      hoof = { x: groundX, y: groundY };
      fetlock = { x: groundX + 0.3, y: 2.4 };
      hock = { x: lerp(-7.8, -10.5, st), y: 7.2 };
      stifle = { x: -5.8, y: 11.2 };
    } else {
      const sw = (sp - 0.5) / 0.5; // Swing: 0 -> 1
      const lift = Math.sin(sw * Math.PI);
      const swingX = lerp(-11.5, -5.8, sw);
      const swingY = 0.5 + lift * 3.8;
      hoof = { x: swingX, y: swingY };
      fetlock = { x: swingX - 0.4, y: swingY + 1.8 };
      hock = { x: lerp(-10.5, -7.5, sw) - lift * 1.0, y: 7.2 + lift * 1.5 };
      stifle = { x: -5.8 + lift * 0.5, y: 11.2 };
    }

    const d = isFar ? 0.65 : undefined;
    const hot = !isFar;
    // Hip to Stifle (Thigh)
    strokes.push({ x1: hipPt.x, y1: hipPt.y, x2: stifle.x, y2: stifle.y, r1: 2.2, r2: 1.4, d, hot });
    // Stifle to Hock (Gaskin)
    strokes.push({ x1: stifle.x, y1: stifle.y, x2: hock.x, y2: hock.y, r1: 1.4, r2: 0.65, d, hot });
    // Hock sharp backward joint
    balls.push({ x: hock.x, y: hock.y, r: 0.65, d, hot });
    // Hock to Fetlock (Cannon)
    strokes.push({ x1: hock.x, y1: hock.y, x2: fetlock.x, y2: fetlock.y, r1: 0.62, r2: 0.48, d, hot });
    // Fetlock
    balls.push({ x: fetlock.x, y: fetlock.y, r: 0.5, d, hot });
    // Pastern to Hoof
    strokes.push({ x1: fetlock.x, y1: fetlock.y, x2: hoof.x, y2: hoof.y, r1: 0.46, r2: 0.42, d, hot });
    // Hoof wedge
    balls.push({ x: hoof.x, y: hoof.y, r: 0.52, d, hot });

    return hoof;
  }

  const shoulderNear = att({ x: 6.2, y: 13.5 });
  const shoulderFar = att({ x: 6.8, y: 14.0 });
  const hipNear = att({ x: -8.0, y: 13.8 });
  const hipFar = att({ x: -7.5, y: 14.2 });

  // Far legs (rendered beneath body)
  const hF_hoof = getHindLeg(p, hipFar, true); // Diagonal A (far hind)
  const fF_hoof = getForeLeg(p + 0.5, shoulderFar, true); // Diagonal B (far fore)

  // Near legs (rendered on top)
  const fN_hoof = getForeLeg(p, shoulderNear, false); // Diagonal A (near fore)
  const hN_hoof = getHindLeg(p + 0.5, hipNear, false); // Diagonal B (near hind)

  // Calculate bounding box
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const b of balls) {
    minX = Math.min(minX, b.x - b.r);
    maxX = Math.max(maxX, b.x + b.r);
    minY = Math.min(minY, b.y - b.r);
    maxY = Math.max(maxY, b.y + b.r);
  }
  for (const s of strokes) {
    const maxR = Math.max(s.r1, s.r2);
    minX = Math.min(minX, s.x1 - maxR, s.x2 - maxR);
    maxX = Math.max(maxX, s.x1 + maxR, s.x2 + maxR);
    minY = Math.min(minY, s.y1 - maxR, s.y2 - maxR);
    maxY = Math.max(maxY, s.y1 + maxR, s.y2 + maxR);
  }

  return {
    balls,
    strokes,
    hoofs: [fN_hoof, fF_hoof, hN_hoof, hF_hoof],
    bbox: { minX, maxX, minY, maxY },
  };
}

// Pre-baked frame list for legacy/static usage
export const HORSE_FRAMES: FramePrims[] = Array.from({ length: 16 }, (_, i) =>
  generateHorsePose(i / 16)
);

export const HORSE_HOOFS: Array<Pt[]> = HORSE_FRAMES.map((f) => f.hoofs);

export const HORSE_BBOX = (() => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const fr of HORSE_FRAMES) {
    minX = Math.min(minX, fr.bbox.minX);
    maxX = Math.max(maxX, fr.bbox.maxX);
    minY = Math.min(minY, fr.bbox.minY);
    maxY = Math.max(maxY, fr.bbox.maxY);
  }
  return { minX, maxX, minY, maxY };
})();
